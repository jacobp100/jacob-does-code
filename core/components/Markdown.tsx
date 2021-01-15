// @ts-ignore
import MDX from "@mdx-js/runtime";
import useContent, { getComponentNames } from "../useContent";
import { classNames } from "../css";
import htmlTags from "./_htmlTags";
import * as builtInComponents from ".";

const styleStringToReact = (style: string) =>
  style
    .split(";")
    .map((declaration) => declaration.split(":"))
    .filter((pair) => pair.length === 2)
    .map(([key, value]) => [key.trim(), value.trim()])
    .reduce((accum, [key, value]) => {
      accum[key] = value;
      return accum;
    }, {} as Record<string, string>);

const htmlComponents = htmlTags.reduce((accum, TagName) => {
  accum[TagName] = ({ class: className, ...props }: any) => {
    return (
      <TagName
        {...props}
        className={classNames(className ?? props.className)}
        style={
          typeof props.style === "string"
            ? styleStringToReact(props.style)
            : props.style
        }
      />
    );
  };

  return accum;
}, {} as Record<string, any>);

const emptyScope = {};

type Props = {
  markdown: string;
};

export default ({ markdown }: Props) => {
  const content = useContent();

  const userComponents = getComponentNames().reduce((accum, TagName) => {
    accum[TagName] = (props: any) => {
      const Component = content.component(TagName);
      return <Component {...props} />;
    };

    return accum;
  }, {} as Record<string, any>);

  const components = {
    ...htmlComponents,
    ...builtInComponents,
    ...userComponents,
  };

  // @ts-ignore
  return (
    <MDX components={components} scope={emptyScope}>
      {markdown}
    </MDX>
  );
};
