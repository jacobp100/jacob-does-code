import classnames from "classnames";
import { InlineJs } from "../core/components";
import { className } from "../core/css";

export default () => (
  <>
    <div
      id="computation"
      className={classnames(
        className("computation"),
        className("computation--form-hidden")
      )}
      hidden
    />
    <InlineJs src="/assets/technicalc/computation-critical.js" />
  </>
);
