const React = require("react");
const server = require("react-dom/server");

const matchHelper = require("posthtml-match-helper");

const { isReactComponent } = require("./htmlUtil");

const attrToProp = {
  class: "className",
  for: "htmlFor",
};

function toReact(node, components) {
  const tag = node.tag;
  const attrs = node.attrs;
  const element = isReactComponent(tag) ? components[tag] : tag;

  let props = Object.assign(
    { key: Math.random().toString(32).slice(2) },
    attrs
  );

  if (typeof element === "string") {
    const nextProps = {};
    Object.entries(props).forEach(([attr, value]) => {
      const prop = attr in attrToProp ? attrToProp[attr] : attr;
      nextProps[prop] = value;
    });
    props = nextProps;
  }

  let children = null;
  if (Array.isArray(node.content)) {
    children = node.content.map(function (_node) {
      return typeof _node === "string" ? _node : toReact(_node, components);
    });
  }

  return React.createElement(element, props, children);
}

module.exports = function (matcher, components, { Wrapper } = {}) {
  return function posthtmlStaticReact(tree) {
    tree.match(matchHelper(matcher), (node) => {
      if (isReactComponent(node.tag, components)) {
        let jsx = toReact(node, components);

        if (Wrapper != null) {
          jsx = React.createElement(Wrapper, {}, jsx);
        }

        return server.renderToStaticMarkup(jsx);
      } else {
        return node;
      }
    });
  };
};
