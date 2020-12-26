import classnames from "classnames";
import { ExternalCss, InlineCss, InlineJs } from "../core/components";
import TechnicalcComputation from "../components/TechnicalcComputation";
import { className, variable } from "../core/css";

const Header = ({ children }: { children: any }) => (
  <div className={className("header")}>{children}</div>
);

const HeaderSection = ({
  last,
  children,
}: {
  last?: boolean;
  children: string;
}) => (
  <div
    className={classnames(
      className("header__section"),
      last && className("header__section--last")
    )}
  >
    {children}
  </div>
);

const HeaderLogo = () => (
  <a href="/" className={className("header__logo")}>
    Jacob
    <br />
    does
    <br />
    code
  </a>
);

const HeaderLink = ({ href, children }: { href: string; children: string }) => (
  <a href={href} className={className("header__link")}>
    {children}
  </a>
);

type Props = {
  title: string;
  description?: string;
  "inline-css"?: string;
  "external-css"?: string;
  banner?: string;
  primary?: string;
  children: JSX.Element;
};

export default ({
  title,
  description,
  "inline-css": inlineCss = "",
  "external-css": externalCss,
  banner,
  primary,
  children,
}: Props) => (
  <html
    style={
      {
        [variable("--primary")]: primary?.startsWith("var(")
          ? primary.replace(/--[a-z-]+/, variable)
          : primary,
      } as any
    }
    lang="en"
  >
    <head>
      <title>{title}</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      {description && <meta name="description" content={description} />}
      <InlineJs src="set-hairline-width.js" />
      <InlineCss
        src={["base", ...inlineCss?.split(",")]
          .filter((file) => file.length > 0)
          .map((file) => `${file}.css`)
          .join(",")}
      />
      {externalCss && <ExternalCss src={`${externalCss}.css`} />}
    </head>
    <body>
      {banner === "TechnicalcComputation" && <TechnicalcComputation />}
      <Header>
        <HeaderLogo />
        <HeaderSection>Apps</HeaderSection>
        <HeaderLink href="/pocket-jam">Pocket Jam</HeaderLink>
        <HeaderLink href="/piano-tabs">Piano Tabs</HeaderLink>
        <HeaderLink href="/technicalc">TechniCalc</HeaderLink>
        <HeaderLink href="/freebies">Freebies</HeaderLink>
        <HeaderSection last>Developement</HeaderSection>
        <HeaderLink href="/blog">Blog</HeaderLink>
        <HeaderLink href="https://github.com/jacobp100">Github</HeaderLink>
      </Header>
      {children}
    </body>
  </html>
);
