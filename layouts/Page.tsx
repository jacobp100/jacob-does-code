import classnames from "classnames";
import { ExternalCss, InlineCss, InlineJs } from "../components";

const Header = ({ children }: { children: any }) => (
  <div className="header">{children}</div>
);

const HeaderSection = ({
  last,
  children,
}: {
  last?: boolean;
  children: string;
}) => (
  <div
    className={classnames("header__section", last && "header__section--last")}
  >
    {children}
  </div>
);

const HeaderLogo = () => (
  <a href="/" className="header__logo">
    Jacob
    <br />
    does
    <br />
    code
  </a>
);

const HeaderLink = ({ href, children }: { href: string; children: string }) => (
  <a href={href} className="header__link">
    {children}
  </a>
);

type Props = {
  title: string;
  description?: string;
  "inline-css"?: string;
  "external-css"?: string;
  primary?: string;
  children: JSX.Element;
};

export default ({
  title,
  description,
  "inline-css": inlineCss,
  "external-css": externalCss,
  primary,
  children,
}: Props) => (
  <html style={{ "--primary": primary } as any}>
    <head>
      <title>{title}</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      {description && <meta name="description" content={description} />}
      <InlineJs src="set-hairline-width.js" />
      <InlineCss src={inlineCss ? `base.css,${inlineCss}.css` : "base.css"} />
      {externalCss && <ExternalCss src={`${externalCss}.css`} />}
    </head>
    <body>
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
