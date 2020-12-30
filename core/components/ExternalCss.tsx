import useContent from "../useContent";
import cacheAssetTransform from "../cacheAssetTransform";
import transformCss from "../transformCss";

const transform = cacheAssetTransform((content, src) => {
  const input = src.split(",").map(content.asset).join("\n");
  const output = transformCss(content, input);
  const href = content.write(output, { extension: ".css" });
  return href;
});

type Props = {
  src: string;
};

export default ({ src }: Props) => {
  const content = useContent();
  return <link href={transform(content, src)} rel="stylesheet" />;
};
