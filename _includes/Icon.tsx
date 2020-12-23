import type { SVGProps } from "react";
import { readAsset } from "../core/assets";

type Props = SVGProps<any> & {
  name: string;
};

export default ({ name, className = "app__logo" }: Props) => {
  const svg = readAsset(`icons/${name}.svg`);
  return (
    <svg
      viewBox="0 0 60 60"
      className={className}
      role="img"
      aria-label="Logo"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};
