import * as React from "react";
import { format } from "date-fns";
import {
  ExternalJs,
  InlineCss,
  InlineJs,
  className,
  classNames,
  cssVariable,
} from "../core/core";

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
  children,
}: Props) => (
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
        <HeaderLink href="/pocket-jam">Pocket Jam</HeaderLink>
        <HeaderLink href="/piano-tabs">Piano Tabs</HeaderLink>
        <HeaderLink href="/technicalc">TechniCalc</HeaderLink>
        <HeaderLink href="/freebies">Freebies</HeaderLink>
        <HeaderSection last>Developement</HeaderSection>
        <HeaderLink href="/blog">Blog</HeaderLink>
        <HeaderLink href="https://github.com/jacobp100">Github</HeaderLink>
      </Header>
      {children}
      <PublishedOn filename={filename} />
    </body>
  </html>
);
