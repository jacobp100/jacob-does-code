require("@babel/register")({
  extensions: [".js", ".ts", ".tsx"],
});

require("./api-worker.ts");
