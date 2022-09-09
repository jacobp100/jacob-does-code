import type { IpcMessage } from "./api-bridge-types";
import { Status } from "./api-bridge-types";
import api from "./api-direct";
import "./register";

let queue = Promise.resolve();

process.send!({ type: Status.Ready, payload: null });

process.on("message", (message: IpcMessage) => {
  queue = queue.then(async () => {
    try {
      const { type } = message;
      const payload: any = (await api[type](message.payload)) ?? null;
      process.send!({ type, payload });
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  });
});
