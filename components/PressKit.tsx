import ZipDownload from "./ZipDownload";

type Props = {
  files: string[];
};

export default ({ files }: Props) => {
  return (
    <ZipDownload download="Press Kit" files={files} className="press-kit">
      Download Press Kit
    </ZipDownload>
  );
};
