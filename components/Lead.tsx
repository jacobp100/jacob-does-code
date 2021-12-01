import * as React from "react";
import { className } from "../core/core.js";

export default ({ children }: any) => (
  <p className={className("lead")}>{children}</p>
);
