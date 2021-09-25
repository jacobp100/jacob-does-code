require("@babel/register")({
  extensions: [".js", ".ts", ".tsx"],
});

require("./worker.ts");
