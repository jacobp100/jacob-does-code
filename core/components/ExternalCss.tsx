import useContent from "../useContent";
import transformCss from "../transformCss";

type Props = {
  src: string;
};

export default ({ src }: Props) => {
  // Can't cache because this could be multiple sources
  const content = useContent();
  const input = src.split(",").map(content.asset).join("\n");
  const output = transformCss(content, input);
  const href = content.write(output, { extension: ".css" });
  return <link href={href} rel="stylesheet" />;
};
