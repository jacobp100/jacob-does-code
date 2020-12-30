import { format } from "date-fns";
import {
  ExternalCss,
  ExternalJs,
  InlineCss,
  InlineJs,
} from "../core/components";
import type { File } from "../core/files";
import { className, classNames, variable } from "../core/css";
import TechnicalcComputation from "../components/TechnicalcComputation";

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
    className={classNames("header__section", last && "header__section--last")}
  >
    {children}
  </div>
);

const HeaderLogo = () => (
  <a href="/" className={classNames("header__logo")}>
    Jacob
    <br />
    does
    <br />
    code
  </a>
);

const HeaderLink = ({ href, children }: { href: string; children: string }) => (
  <a href={href} className={classNames("header__link")}>
    {children}
  </a>
);

type Props = {
  file: File;
  title: string;
  description?: string;
  "inline-css"?: string;
  "external-css"?: string;
  "external-js-defer"?: string;
  banner?: string;
  primary?: string;
  children: JSX.Element;
};

export default ({
  file,
  title,
  description,
  "inline-css": inlineCss = "",
  "external-css": externalCss,
  "external-js-defer": externalJsDefer,
  banner,
  primary,
  children,
}: Props) => {
  const style: any = {
    [variable("--primary")]: primary?.startsWith("var(")
      ? primary.replace(/--[a-z-]+/, variable)
      : primary,
  };

  return (
    <html style={style} lang="en">
      <head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        {description && <meta name="description" content={description} />}
        <InlineJs src="/assets/set-hairline-width.js" />
        <InlineCss
          src={["base", ...inlineCss.split(",")]
            .filter((file) => file.length > 0)
            .map((file) => `/assets/${file}.css`)}
        />
        {externalCss && <ExternalCss src={`/assets/${externalCss}.css`} />}
        {externalJsDefer && (
          <ExternalJs src={`/assets/${externalJsDefer}.js`} defer />
        )}
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
        {file?.date != null && (
          <span className={className("published-on")}>
            Published on{" "}
            <time dateTime={new Date(file.date).toISOString()}>
              {format(new Date(file.date), "do MMMM yyyy")}
            </time>
          </span>
        )}
      </body>
    </html>
  );
};
