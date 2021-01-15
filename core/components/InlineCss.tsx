import useContent from "../useContent";
import { cacheTransform } from "../cacheTransform";
import transformCss from "../transformCss";

const transform = cacheTransform((content, src) => {
  const input = Array.isArray(src)
    ? src.map(content.asset).join("\n")
    : content.asset(src);
  return transformCss(content, input);
});

type Props = {
  src: string | string[];
};

export default ({ src }: Props) => {
  const content = useContent();
  const __html = transform(content, src);
  return <style dangerouslySetInnerHTML={{ __html }} />;
};
