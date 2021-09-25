import useContent from "../useContent";
import { assetTransform } from "../assetTransformer";
import { transformCss } from "../assetTransforms";

const transform = assetTransform(
  (content, src) => {
    const input = Array.isArray(src)
      ? src.map(content.asset).join("\n")
      : content.asset(src);
    return transformCss(content, input);
  },
  {
    cacheKey: "core/InlineCss",
    encodable: true,
  }
);

type Props = {
  src: string | string[];
};

export default ({ src }: Props) => {
  const content = useContent();
  const __html = transform(content, src);
  return <style dangerouslySetInnerHTML={{ __html }} />;
};
