import { AnchorHTMLAttributes } from "react";
import { ClassNames, classNames } from "../css";
import { useTableOfContents } from "../useTableOfContents";

type Props = Omit<AnchorHTMLAttributes<any>, "className"> & {
  className?: ClassNames;
};

export default (props: Props) => {
  const contents = useTableOfContents();

  let href: string | undefined;
  if (props.href?.startsWith("/")) {
    const filename = decodeURIComponent(props.href);
    const page = contents.find((page) => page.filename === filename);

    if (page == null) {
      throw new Error(`Could not page with href "${filename}"`);
    }

    href = page.url;
  } else {
    href = props.href;
  }

  return <a {...props} href={href} className={classNames(props.className)} />;
};
