const React = require("react");
const server = require("react-dom/server");

const matchHelper = require("posthtml-match-helper");

const attrToProp = {
  class: "className",
  for: "htmlFor",
};

const isReactComponent = (tag, components) =>
  /^[A-Z]/.test(tag) && tag in components;

function toReact(node, components) {
  const tag = node.tag;
  const attrs = node.attrs;
  const element = isReactComponent(tag, components) ? components[tag] : tag;
  const props = {
    key: Math.random().toString(32).slice(2),
  };

  if (attrs) {
    Object.keys(attrs).map(function (attr) {
      const prop = attr in attrToProp ? attrToProp[attr] : attr;
      props[prop] = attrs[attr];
    });
  }

  let children = null;
  if (Array.isArray(node.content)) {
    children = node.content.map(function (_node) {
      return typeof _node === "string" ? _node : toReact(_node, components);
    });
  }

  return React.createElement(element, props, children);
}

module.exports = function (matcher, components) {
  return function posthtmlStaticReact(tree) {
    tree.match(matchHelper(matcher), function (node) {
      if (isReactComponent(node.tag, components)) {
        return server.renderToStaticMarkup(toReact(node, components));
      } else {
        return node;
      }
    });
  };
};
