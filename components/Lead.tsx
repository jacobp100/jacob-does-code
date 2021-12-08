import * as React from "react";
import { className } from "../core/core";

export default ({ children }: any) => (
  <p className={className("lead")}>{children}</p>
);
