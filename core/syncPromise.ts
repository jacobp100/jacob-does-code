// @ts-ignore
import deasync from "deasync";

type Result<Value, Error> =
  | { type: "ok"; value: Value }
  | { type: "error"; error: Error };

export default <T>(promise: Promise<T>) => {
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
