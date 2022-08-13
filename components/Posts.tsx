import * as React from "react";
import { useTableOfContents } from "../core/core";

export default () => {
  const posts = useTableOfContents({ pages: "/posts/**" }).sort(
    (a, b) => -a.url.localeCompare(b.url)
  );

  return (
    <ul>
      {posts.map(({ url, title }) => (
        <li key={url}>
          <a href={url}>{title}</a>
        </li>
      ))}
    </ul>
  );
};
