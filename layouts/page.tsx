import { format } from "date-fns";
import {
  ExternalCss,
  ExternalJs,
  Image,
  InlineCss,
  InlineJs,
} from "../core/api/components";
import type { File } from "../core";
import { className, classNames, cssVariable } from "../core";
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
  css?: string;
  js?: string;
  banner?: string;
  primary?: string;
  children: JSX.Element;
};

export default ({
  file,
  title,
  description,
  css = "",
  js,
  banner,
  primary,
  children,
}: Props) => {
  const style: any = {
    [cssVariable("--primary")]: primary?.startsWith("var(")
      ? primary.replace(/--[a-z-]+/, cssVariable)
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
          src={["base", ...css.split(",")]
            .filter((file) => file.length > 0)
            .map((file) => `/assets/${file}.css`)}
        />
        {js && <ExternalJs src={`/assets/${js}.js`} defer />}
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
        {file.date != null && (
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
