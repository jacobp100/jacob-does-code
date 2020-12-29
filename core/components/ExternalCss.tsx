import useContent from "../useContent";
import cache from "../cache";
import transformCss from "../useTransformCss";

const process = cache((src: string) => {
  const content = useContent();
  const input = src.split(",").map(content.asset).join("\n");
  const output = transformCss(input);
  const href = content.write(output, { extension: ".css" });
  return href;
});

type Props = {
  src: string;
};

export default ({ src }: Props) => (
  <link href={process(src)} rel="stylesheet" />
);
