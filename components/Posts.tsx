import { A, useTableOfContents } from "jdc";

export default () => {
  const posts = useTableOfContents({ pages: "/posts/**" }).sort(
    (a, b) => -a.url.localeCompare(b.url)
  );

  return (
    <ul>
      {posts.map(({ filename, title }: any) => (
        <li key={filename}>
          <A href={filename}>{title}</A>
        </li>
      ))}
    </ul>
  );
};
