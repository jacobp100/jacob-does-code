import { Writable } from "stream";

export default class AsyncWritable extends Writable {
  _chunks: string[];
  _res: (value: string) => void;
  awaited: Promise<string>;

  constructor() {
    super();

    this._chunks = [];
    this._res = undefined!;
    this.awaited = new Promise<string>((res) => {
      this._res = res;
    });
  }

  _write(chunk: string, encoding: any, done: () => void) {
    this._chunks.push(chunk);
    done();
  }

  _final(callback: () => void) {
    const value = this._chunks.join("");
    this._chunks.length = 0;
    this._res(value);
    callback();
  }
}
