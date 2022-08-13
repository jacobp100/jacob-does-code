#!/usr/bin/env node

require("@babel/register")({
  extensions: [".js", ".ts", ".tsx"],
});

require("./index.ts");
