import ZipDownload from "./ZipDownload";

type Props = {
  files: string[];
  className: string | string[];
  children?: any;
};

export default ({ files, className }: Props) => {
  return (
    <ZipDownload files={files} className="press-kit">
      Download Press Kit
    </ZipDownload>
  );
};
