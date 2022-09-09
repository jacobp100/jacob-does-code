import { className } from "jdc";

export default ({ children }: any) => (
  <p className={className("lead")}>{children}</p>
);
