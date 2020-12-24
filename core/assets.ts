import * as fs from "fs";
import * as path from "path";
// @ts-ignore
import stringHash from "string-hash";
import cache from "./cache";

const modulePath = (directory: string, filename: string) =>
  [".js", ".jsx", ".ts", ".tsx"]
    .map((extension) =>
      path.join(__dirname, "..", directory, `${filename}${extension}`)
    )
    .find((candidate) => fs.existsSync(candidate));

const componentPath = cache<string, string | undefined>((filename) => {
  return modulePath("components", filename);
});
export const requireComponent = (filename: string) =>
  require(componentPath(filename)!).default;

const layoutPath = cache<string, string | undefined>((filename) => {
  return modulePath("layouts", filename);
});
export const requireLayout = (filename: string) =>
  require(layoutPath(filename)!).default;

const assetPath = (filename: string) =>
  path.join(__dirname, "../assets", filename);
export const readAsset = (filename: string): string =>
  fs.readFileSync(assetPath(filename), "utf8");
export const readAssetBuffer = (filename: string): Buffer =>
  fs.readFileSync(assetPath(filename));

const sitePath = (filename: string) =>
  path.join(__dirname, "../site", filename);
export const writeSiteAsset = (
  content: Buffer | string,
  { filename = "", extension }: { filename?: string; extension: string }
) => {
  const outputFilename = [
    filename.length > 0
      ? filename
      : typeof content === "string"
      ? stringHash(content).toString(16)
      : stringHash(content.toString("hex")).toString(16),
    extension,
  ].join("");

  if (filename.includes("/")) {
    const dir = sitePath(path.join(outputFilename, ".."));
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(sitePath(outputFilename), content);

  const outputHref = `/${outputFilename}`;

  return outputHref;
};
