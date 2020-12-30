const path = require("path");
const fs = require("fs");
const { fork } = require("child_process");
const chalk = require("chalk");
const chokidar = require("chokidar");

const projectDir = path.join(__dirname, "../..");

const sitePath = path.join(projectDir, "site");
const clearSiteFolder = () => {
  fs.rmdirSync(sitePath, { recursive: true });
  fs.mkdirSync(sitePath);
};

clearSiteFolder();

if (process.argv.includes("--dev")) {
  console.log(
    chalk.whiteBright.bgYellow("[Dev mode - listening on port 8080]")
  );

  /* Run child on worker thread */
  let childProcess;

  const cliRunnerModule = require.resolve("./runner");

  const restartProcess = () => {
    childProcess?.kill();
    childProcess = fork(cliRunnerModule, ["--dev"]);
  };

  restartProcess();

  /* Start server */
  require("http-server")
    .createServer({
      root: path.resolve(__dirname, "../../site"),
    })
    .listen("8080", "0.0.0.0");

  /* Watch for changes */
  const rebuildDirectories = [
    path.resolve(projectDir, "assets"),
    path.resolve(projectDir, "pages"),
    path.resolve(projectDir, "posts"),
  ];
  const restartDirectories = [
    path.resolve(projectDir, "core"),
    path.resolve(projectDir, "components"),
    path.resolve(projectDir, "layouts"),
  ];
  const isSubdirectoryOf = (filename, dir) =>
    /^[^./]/.test(path.relative(dir, filename));

  let restartBuilderTimeout = null;
  const restartBuilder = () => {
    console.log(chalk.whiteBright.bgGray("[Restarting builder]"));
    restartProcess();
  };

  chokidar.watch(projectDir).on("change", (filename) => {
    const shouldRestart = restartDirectories.some((dir) => {
      return isSubdirectoryOf(filename, dir);
    });
    const shouldRebuild = rebuildDirectories.some((dir) => {
      return isSubdirectoryOf(filename, dir);
    });

    if (shouldRestart) {
      clearTimeout(restartBuilderTimeout);
      restartBuilderTimeout = setTimeout(restartBuilder, 50);
    } else if (shouldRebuild) {
      childProcess.send({ type: "rebuild", filename });
    }
  });

  /* Watch for `r` input to trigger rebuild */
  const stdin = process.stdin;
  stdin.setRawMode(true);
  stdin.setEncoding("utf8");
  stdin.on("data", (key) => {
    if (key === "\u0003") {
      childProcess?.kill();
      process.exit();
    } else if (key == "r") {
      restartBuilder();
    }
  });
} else {
  require("./runner");
}
