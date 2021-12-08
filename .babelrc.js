export default {
  presets: [
    "@babel/preset-typescript",
    ["@babel/preset-env", { targets: { node: "16" }, modules: false }],
    ["@babel/preset-react", { runtime: "automatic" }],
  ],
};
