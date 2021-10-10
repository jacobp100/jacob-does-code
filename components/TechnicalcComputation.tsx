import { InlineJs, classNames } from "../core";

export default () => (
  <>
    <div
      id="computation"
      className={classNames("computation", "computation--form-hidden")}
      hidden
    />
    <InlineJs src="/assets/technicalc/computation-critical.js" type="module" />
  </>
);
