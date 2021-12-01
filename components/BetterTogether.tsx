import * as React from "react";
import { Svg, className, classNames, cssVariable } from "../core/core.js";

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
      <a
        href="/pocket-jam"
        style={{ color: `var(${cssVariable("--pocket-jam")})` }}
      >
        Pocket Jam
      </a>{" "}
      and{" "}
      <a
        href="/piano-tabs"
        style={{ color: `var(${cssVariable("--piano-tabs")})` }}
      >
        Piano Tabs
      </a>{" "}
      together and save 30%
    </p>

    {/* Requires StoreLinks to already be present in page */}
    <div className={classNames("center-icons")}>
      <a
        title="App Store"
        href="https://apps.apple.com/us/app-bundle/id1542101429?mt=8"
      >
        <Svg src="/assets/vendor/app-store-reused.svg" />
      </a>
    </div>
  </>
);
