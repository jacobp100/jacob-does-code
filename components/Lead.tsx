import { className } from "../core";

export default ({ children }: any) => (
  <p className={className("lead")}>{children}</p>
);
