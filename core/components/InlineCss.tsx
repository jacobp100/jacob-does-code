import { assetTransform } from "../assetTransformer";
import { transformCss } from "../assetTransforms";
import useContent from "../useContent";

const transform = assetTransform<string, [string | string[]]>(
  (content, src) => {
    const input = Array.isArray(src)
      ? src.map(content.read).join("\n")
      : content.read(src);
    return transformCss(content, input);
  },
  { cacheKey: "core/InlineCss" }
);

type Props = {
  src: string | string[];
};

export default ({ src }: Props) => {
  const content = useContent();
  const __html = transform(content, src);
  return <style dangerouslySetInnerHTML={{ __html }} />;
};
