module.exports = {
  presets: [
    "@babel/preset-typescript",
    ["@babel/preset-env", { exclude: ["@babel/plugin-transform-regenerator"] }],
    ["@babel/preset-react", { runtime: "automatic" }],
  ],
};
