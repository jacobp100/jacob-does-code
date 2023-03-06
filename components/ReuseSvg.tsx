import { useContent, svgMetadata } from "jdc";

type Props = {
  src: string;
  id: string;
};

export default ({ src, id }: Props) => {
  const content = useContent();
  const { attributes } = svgMetadata(content.read(src));
  return (
    <svg {...attributes}>
      <use href={`#${id}`} />
    </svg>
  );
};
