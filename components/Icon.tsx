import * as React from "react";
import type { SVGProps } from "react";
import { useContent, classNames } from "../core/core.js";

type Props = SVGProps<any> & {
  name: string;
};

export default ({ name, className = "app-logo" }: Props) => {
  const svg = useContent().asset(`/assets/icons/${name}.svg`);

  return (
    <svg
      viewBox="0 0 60 60"
      className={classNames(className)}
      role="img"
      aria-label="Logo"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};
