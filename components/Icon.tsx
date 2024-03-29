import type { SVGProps } from "react";
import { useContent, classNames } from "jdc";

type Props = SVGProps<any> & {
  name: string;
};

export default ({ name, className = "app-logo" }: Props) => {
  const svg = useContent().read(`/assets/icons/${name}.svg`);

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
