import { format } from "date-fns";
import {
  A,
  ExternalJs,
  InlineCss,
  InlineJs,
  className,
  classNames,
  cssVariable,
} from "jdc";

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
  <A href="/pages/index.mdx" className="header__logo">
    Jacob
    <br />
    does
    <br />
    code
  </A>
);

const HeaderLink = ({ href, children }: { href: string; children: string }) => (
  <A href={href} className="header__link">
    {children}
  </A>
);

const PublishedOn = ({ filename }: { filename: string }) => {
  const dateMatch = filename.match(/\d{4}-\d{2}-\d{2}/);
  const date = dateMatch != null ? new Date(dateMatch[0]) : undefined;

  return date != null ? (
    <span className={className("published-on")}>
      Published on{" "}
      <time dateTime={date.toISOString()}>{format(date, "do MMMM yyyy")}</time>
    </span>
  ) : null;
};

const castArray = (x: string[] | string | undefined): string[] => {
  if (Array.isArray(x)) {
    return x;
  } else if (x != null) {
    return [x];
  } else {
    return [];
  }
};

type Props = {
  filename: string;
  title: string;
  description?: string;
  css?: string[] | string | undefined;
  js?: string;
  banner?: JSX.Element;
  primary?: string;
  fragment?: boolean;
  children: JSX.Element;
};

export default ({
  filename,
  title,
  description,
  css,
  js,
  banner,
  primary,
  fragment,
  children,
}: Props) => {
  if (fragment === true) {
    return children;
  }

  return (
    <html style={{ [cssVariable("--primary")]: primary }} lang="en">
      <head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        {description && <meta name="description" content={description} />}
        <InlineJs src="/assets/set-hairline-width.js" />
        <InlineCss src={["/assets/base.css", ...castArray(css)]} />
        {castArray(js).map((src, index) => (
          <ExternalJs key={index} src={src} type="module" defer />
        ))}
      </head>
      <body>
        {banner}
        <Header>
          <HeaderLogo />
          <HeaderSection>Apps</HeaderSection>
          <HeaderLink href="/pages/pocket-jam.mdx">Pocket Jam</HeaderLink>
          <HeaderLink href="/pages/piano-tabs.mdx">Piano Tabs</HeaderLink>
          <HeaderLink href="/pages/technicalc.mdx">TechniCalc</HeaderLink>
          <HeaderLink href="/pages/freebies.mdx">Freebies</HeaderLink>
          <HeaderSection last>Developement</HeaderSection>
          <HeaderLink href="/pages/blog.mdx">Blog</HeaderLink>
          <HeaderLink href="https://github.com/jacobp100">Github</HeaderLink>
        </Header>
        {children}
        <PublishedOn filename={filename} />
      </body>
    </html>
  );
};
