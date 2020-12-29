import useContent from "../useContent";
import useTransformCss from "../useTransformCss";

type Props = {
  src: string;
};

export default ({ src }: Props) => {
  const content = useContent();
  const input = src.split(",").map(content.asset).join("\n");
  const output = useTransformCss(input);
  return <style dangerouslySetInnerHTML={{ __html: output }} />;
};
