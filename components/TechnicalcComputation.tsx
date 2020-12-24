import { InlineJs } from "../core/components";

export default () => (
  <>
    <div
      id="computation"
      className="computation computation--form-hidden"
      hidden
    />
    <InlineJs src="technicalc/computation-critical.js" />
  </>
);
