import type { SVGProps } from "react";
import { readAsset } from "../core/assets";
import { className } from "../core/css";

type Props = SVGProps<any> & {
  name: string;
};

export default ({ name, className: _className = "app__logo" }: Props) => {
  const svg = readAsset(`icons/${name}.svg`);
  return (
    <svg
      viewBox="0 0 60 60"
      className={className(_className)}
      role="img"
      aria-label="Logo"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};
