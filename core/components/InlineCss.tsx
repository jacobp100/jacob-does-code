import useContent from "../useContent";
import cacheAssetTransform from "../cacheAssetTransform";
import transformCss from "../transformCss";

const transform = cacheAssetTransform((content, src) => {
  const input = src.split(",").map(content.asset).join("\n");
  return transformCss(content, input);
});

type Props = {
  src: string;
};

export default ({ src }: Props) => {
  const content = useContent();
  const output = transform(content, src);
  return <style dangerouslySetInnerHTML={{ __html: output }} />;
};
