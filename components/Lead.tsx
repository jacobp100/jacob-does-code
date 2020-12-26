import { className } from "../core/css";

export default ({ children }: any) => (
  <p className={className("lead")}>{children}</p>
);
