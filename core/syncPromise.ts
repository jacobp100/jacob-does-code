// @ts-ignore
import deasync from "deasync";

export type Result<Value, Error> =
  | { type: "ok"; value: Value }
  | { type: "error"; error: Error };

export const syncPromiseResult = <T>(promise: Promise<T>) => {
  let result: Result<T, any> | undefined;

  promise
    .then((value) => {
      result = { type: "ok", value };
    })
    .catch((error) => {
      result = { type: "error", error };
    });

  deasync.loopWhile(() => result == null);

  return result!;
};

export const syncPromiseValue = <T>(promise: Promise<T>): T => {
  const result = syncPromiseResult(promise);

  if (result.type === "ok") {
    return result.value;
  } else {
    throw result.error ?? new Error("Unknown error");
  }
};
