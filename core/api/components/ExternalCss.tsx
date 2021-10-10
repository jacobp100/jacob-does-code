import useContent from "../useContent";
import { assetTransform } from "../assetTransformer";
import { transformCss } from "../assetTransforms";

const transform = assetTransform<string, [string]>(
  async (content, src) => {
    const input = content.asset(src);
    const output = await transformCss(content, input);
    return content.write(output, { extension: ".css" });
  },
  {
    cacheKey: "core/ExternalCss",
    encodable: true,
  }
);

type Props = {
  src: string;
};

export default ({ src }: Props) => {
  const content = useContent();
  return <link href={transform(content, src)} rel="stylesheet" />;
};
