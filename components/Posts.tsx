import { posts } from "../core/files";

export default () => (
  <ul>
    {posts.map(({ name, title, filename }) => (
      <li key={filename}>
        <a href={name}>{title ?? name}</a>
      </li>
    ))}
  </ul>
);
