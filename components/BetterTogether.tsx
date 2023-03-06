import { A, InlineSvg, className, classNames, cssVariable } from "jdc";
import ReuseSvg from "./ReuseSvg";

export default () => (
  <>
    <h1>
      <span style={{ color: `var(${cssVariable("--piano-tabs")})` }}>
        Better
      </span>{" "}
      <span style={{ opacity: 0.2 }}>&hearts;</span>{" "}
      <span style={{ color: `var(${cssVariable("--pocket-jam")})` }}>
        Together
      </span>
    </h1>

    <p className={className("lead")} style={{ color: "inherit" }}>
      Get{" "}
      <A
        href="/pages/pocket-jam.mdx"
        style={{ color: `var(${cssVariable("--pocket-jam")})` }}
      >
        Pocket Jam
      </A>{" "}
      and{" "}
      <A
        href="/pages/piano-tabs.mdx"
        style={{ color: `var(${cssVariable("--piano-tabs")})` }}
      >
        Piano Tabs
      </A>{" "}
      together and save 30%
    </p>

    {/* Requires StoreLinks to already be present in page */}
    <div className={classNames("center-icons")}>
      <A
        title="App Store"
        href="https://apps.apple.com/us/app-bundle/id1542101429?mt=8"
      >
        <ReuseSvg src="/assets/vendor/app-store.svg" id="app-store" />
      </A>
    </div>
  </>
);
