import type { SVGAttributes } from "react";
import useContent from "../useContent";
import { ClassNames, classNames } from "../css";

type Props = Omit<SVGAttributes<any>, "className"> & {
  className?: ClassNames;
  src: string;
};

export default ({ src, className, ...props }: Props) => {
  const content = useContent();

  const xml = content.asset(src);
  const { 1: attributesString, 2: __html } = xml.match(
    /<svg([^>]*)>(.*)<\/svg>/
  )!;
  const attribteEnitries = Array.from(
    attributesString.matchAll(/(\w+)="([^"]*)"/g),
    (match) => [match[1], match[2]]
  );
  const attributes = Object.fromEntries(attribteEnitries);

  return (
    <svg
      className={classNames(className)}
      {...attributes}
      {...props}
      dangerouslySetInnerHTML={{ __html }}
    />
  );
};
