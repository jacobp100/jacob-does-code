import { getPosts } from "../core/files";

export default () => (
  <ul>
    {getPosts().map(({ url, title, filename }) => (
      <li key={filename}>
        <a href={url}>{title ?? url}</a>
      </li>
    ))}
  </ul>
);
