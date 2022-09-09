import { assetTransform } from "../assetTransformer";
import { transformCss } from "../assetTransforms";
import useContent from "../useContent";

const transform = assetTransform<string, [string | string[]]>(
  async (content, src) => {
    const input = Array.isArray(src)
      ? src.map(content.read).join("\n")
      : content.read(src);
    const output = await transformCss(content, input);
    return content.write(output, { extension: ".css" });
  },
  { cacheKey: "core/ExternalCss" }
);

type Props = {
  src: string | string[];
};

export default ({ src }: Props) => {
  const content = useContent();
  return <link href={transform(content, src)} rel="stylesheet" />;
};
