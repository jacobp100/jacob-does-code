import type { API } from "./api";

export enum Status {
  Ready = "Ready",
}

export type StatusMessage = { type: Status; payload: null };
export type IpcMessage = { type: keyof API; payload: any };
export type AnyMessage = StatusMessage | IpcMessage;
