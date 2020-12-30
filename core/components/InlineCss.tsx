import useContent from "../useContent";
import transformCss from "../transformCss";

type Props = {
  src: string | string[];
};

export default ({ src }: Props) => {
  // Can't cache because this could be multiple sources
  // We only allow multiple sources in inline css to get better minification
  // and to avoid multiple <style> tags
  const content = useContent();
  const input = Array.isArray(src)
    ? src.map(content.asset).join("\n")
    : content.asset(src);
  const output = transformCss(content, input);
  return <style dangerouslySetInnerHTML={{ __html: output }} />;
};
