import * as fs from "fs";
import * as path from "path";
// @ts-ignore
import glob from "glob";
import renderPage from "./core/renderPage";

const sitePath = path.join(__dirname, "site");
// fs.rmdirSync(sitePath, { recursive: true });
// fs.mkdirSync(sitePath);

glob.sync(path.join(__dirname, "pages/*.md")).forEach((file: string) => {
  const name = path.basename(file, path.extname(file));
  console.log(`Compiling ${name}`);
  const contents = fs.readFileSync(file, "utf8");
  renderPage(contents, name);
});
