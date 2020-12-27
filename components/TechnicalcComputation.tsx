import { InlineJs } from "../core/components";
import { classNames } from "../core/css";

export default () => (
  <>
    <div
      id="computation"
      className={classNames("computation", "computation--form-hidden")}
      hidden
    />
    <InlineJs src="/assets/technicalc/computation-critical.js" />
  </>
);
