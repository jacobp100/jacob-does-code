import useContent from "../useContent";
import cacheAssetTransform from "../cacheAssetTransform";
import transformCss from "../transformCss";

const transform = cacheAssetTransform((content, src) => {
  const input = content.asset(src);
  const output = transformCss(content, input);
  return content.write(output, { extension: ".css" });
});

type Props = {
  src: string;
};

export default ({ src }: Props) => {
  const content = useContent();
  return <link href={transform(content, src)} rel="stylesheet" />;
};
