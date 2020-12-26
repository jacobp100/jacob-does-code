import { className, variable } from "../core/css";
import AppLinks from "./AppLinks";
import AppStoreLink from "./AppStoreLink";

export default () => (
  <>
    <h1>
      <span style={{ color: `var(${variable("--piano-tabs")})` }}>Better</span>{" "}
      <span style={{ opacity: 0.2 }}>&hearts;</span>{" "}
      <span style={{ color: `var(${variable("--pocket-jam")})` }}>
        Together
      </span>
    </h1>

    <p className={className("lead")} style={{ color: "inherit" }}>
      Get{" "}
      <a
        href="/pocket-jam"
        style={{ color: `var(${variable("--pocket-jam")})` }}
      >
        Pocket Jam
      </a>{" "}
      and{" "}
      <a
        href="/piano-tabs"
        style={{ color: `var(${variable("--piano-tabs")})` }}
      >
        Piano Tabs
      </a>{" "}
      together and save 30%
    </p>

    {/* Requires StoreLinks to already be present in page */}
    <AppLinks>
      <AppStoreLink
        href="https://apps.apple.com/us/app-bundle/id1542101429?mt=8"
        reuseSvg
      />
    </AppLinks>
  </>
);
