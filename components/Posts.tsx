import * as React from "react";
import { usePages, usePagesData } from "../core/core";

export default () => {
  const allPages = usePages();
  const posts = allPages.filter((page) => page.filename.startsWith("/posts"));
  const postsData = usePagesData(posts);

  return (
    <ul>
      {postsData.map(({ url, title }) => (
        <li key={url}>
          <a href={url}>{title}</a>
        </li>
      ))}
    </ul>
  );
};
