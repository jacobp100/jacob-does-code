import * as fs from "fs";
import * as path from "path";
import renderPage from "./core/renderPage";
import { pages, posts } from "./core/files";

const sitePath = path.join(__dirname, "site");
fs.rmdirSync(sitePath, { recursive: true });
fs.mkdirSync(sitePath);

[...pages, ...posts].forEach((file) => {
  console.log(`Compiling ${file.title ?? file.url}`);
  renderPage(file);
});
