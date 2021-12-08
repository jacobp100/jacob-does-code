import * as React from "react";
import { getPosts } from "../core/core";

export default () => (
  <ul>
    {getPosts().map(({ url, title, filename }) => (
      <li key={filename}>
        <a href={url}>{title ?? url}</a>
      </li>
    ))}
  </ul>
);
