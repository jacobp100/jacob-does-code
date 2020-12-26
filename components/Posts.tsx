import { posts } from "../core/files";

export default () => (
  <ul>
    {posts.map(({ url, title, filename }) => (
      <li key={filename}>
        <a href={url}>{title ?? url}</a>
      </li>
    ))}
  </ul>
);
