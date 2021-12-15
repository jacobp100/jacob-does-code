module.exports = {
  presets: [
    "@babel/preset-typescript",
    [
      "@babel/preset-env",
      {
        exclude: ["@babel/plugin-transform-regenerator"],
        modules: "commonjs",
      },
    ],
    ["@babel/preset-react", { runtime: "automatic" }],
  ],
};
