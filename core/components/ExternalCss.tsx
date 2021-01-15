import useContent from "../useContent";
import { cacheTransform } from "../cacheTransform";
import transformCss from "../transformCss";

const transform = cacheTransform((content, src) => {
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
