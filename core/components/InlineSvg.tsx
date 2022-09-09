import type { SVGAttributes } from "react";
import { assetTransform } from "../assetTransformer";
import { transformSvg, svgMetadata } from "../assetTransforms";
import { ClassNames, classNames } from "../css";
import useContent from "../useContent";

const transform = assetTransform<
  { attributes: Record<string, string>; __html: string },
  [string]
>(async (content, src) => {
  const input = content.read(src);
  const svg = await transformSvg(content, input);
  const { attributes, __html } = svgMetadata(svg);
  return { attributes, __html };
});

type Props = Omit<SVGAttributes<any>, "className"> & {
  className?: ClassNames;
  src: string;
};

export default ({ src, className, ...props }: Props) => {
  const content = useContent();
  const { attributes, __html } = transform(content, src);

  return (
    <svg
      className={classNames(className)}
      {...attributes}
      {...props}
      dangerouslySetInnerHTML={{ __html }}
    />
  );
};
