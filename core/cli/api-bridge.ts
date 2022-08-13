import type { ChildProcess } from "child_process";
import { fork } from "child_process";
import type { API } from "./api-direct";
import type { AnyMessage } from "./api-bridge-types";
import { Status } from "./api-bridge-types";

type WorkItem = {
  type: keyof API;
  payload: any;
  res: (arg: any) => void;
  rej: (arg: Error) => void;
};

let inProgress: WorkItem | undefined;
let queue: WorkItem[] = [];
let worker: ChildProcess | undefined;
let workerReady = false;

const abortWorkItems = () => {
  inProgress?.rej(new Error("Aborted"));

  queue.forEach((queueItem) => {
    queueItem.rej(new Error("Aborted"));
  });

  queue = [];
};

const runInProgressWorkIfNeeded = () => {
  if (inProgress !== undefined && workerReady) {
    const { type, payload } = inProgress;
    worker?.send({ type, payload });
  }
};

const scheduleWorkItem = (work: WorkItem) => {
  if (inProgress === undefined) {
    inProgress = work;
    runInProgressWorkIfNeeded();
  } else {
    queue.push(work);
  }
};

const handleMessage = ({ type, payload }: AnyMessage) => {
  if (type === Status.Ready) {
    workerReady = true;
    runInProgressWorkIfNeeded();
    return;
  }

  if (inProgress === undefined) {
    console.warn("Unhandled message");
    return;
  } else if (inProgress.type !== type) {
    inProgress.rej(new Error(`Invalid message type of "${type}" received`));
    inProgress = undefined;
    abortWorkItems();
    return;
  }

  inProgress.res(payload);
  inProgress = undefined;

  const nextWorkItem = queue.shift();
  if (nextWorkItem !== undefined) {
    scheduleWorkItem(nextWorkItem);
  }
};

const workerModulePath = require.resolve("./api-worker.js");

export const startWorker = () => {
  if (worker !== undefined) {
    throw new Error("Worker already exists");
  }

  worker = fork(workerModulePath, {
    env: { ...process.env, NODE_ENV: "development" },
  });
  workerReady = false;
  worker.on("message", handleMessage);
  worker.on("close", () => {
    worker = undefined;
    workerReady = false;
  });

  runInProgressWorkIfNeeded();
};

export const terminateWorker = () => {
  abortWorkItems();

  if (worker !== undefined) {
    worker.removeAllListeners();
    worker.kill();
    worker = undefined;
    workerReady = false;
  }
};

export const restartWorker = () => {
  terminateWorker();
  startWorker();
};

startWorker();

type WorkerFunction<
  T extends keyof API,
  Input = Parameters<API[T]>[0],
  Output = ReturnType<API[T]>
> = Parameters<API[T]>[0] extends undefined
  ? () => Output
  : (payload: Input) => Output;

const createWorkerFunction = <T extends keyof API>(
  type: T
): WorkerFunction<T> => {
  const fn = (payload: any = null) => {
    return new Promise((res, rej) => {
      scheduleWorkItem({ type, payload, res, rej });
    });
  };

  return fn as any;
};

const api: API = {
  renderPage: createWorkerFunction("renderPage"),
  encodeAssetTransformCache: createWorkerFunction("encodeAssetTransformCache"),
  restoreAssetTransformCache: createWorkerFunction(
    "restoreAssetTransformCache"
  ),
  clearAssetTransformCacheForFiles: createWorkerFunction(
    "clearAssetTransformCacheForFiles"
  ),
  generateCssStats: createWorkerFunction("generateCssStats"),
  resetCssStats: createWorkerFunction("resetCssStats"),
};

export default api;
