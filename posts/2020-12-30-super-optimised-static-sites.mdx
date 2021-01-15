---
title: Super Optimised Static Sites
layout: page
css: blog,blog-highlight
---

# Super Optimised Static Sites

If you use GitHub pages, there's a high chance you're also using Jekyll. The biggest thing Jekyll brings is templating &mdash; which is great both for developer speed and for getting consistency in your site.

Today, Jekyll is over 12 years old, and it does show its age in places. I wanted to see what was possible with today's more modern tooling.

The toolchain makes heavy use `react-dom/server` and leverages a powerful custom component system that handles the site's assets. While I'm not the first to do a static site system based on React, the custom component system is what sets it apart, and gives way to,

- React-based templating
- Does not include React on the client (or any JS unless you want it)
- Effortless compression/minification of images, CSS, and JS
- Simple long term caching of assets
- Granular control of how assets are used &mdash; including inlining critical CSS and JS
- The **best** CSS optimisation available &mdash; I've not seen anything that comes close here

Putting this all together makes the total page weight for the page you're currently on less than 100kb &mdash; and that's including a 50kb font.

Firstly, React-based templating. This is basically the same as [MDX](https://mdxjs.com). You can include HTML and JSX inside your markdown,

```markdown
Some _regular_ markdown

<ReactComponent>

Some more _regular_ markdown inside a React component

</ReactComponent>

<ReactComponentOnItsOwn />
```

This is run on the server at build-time and returns regular HTML, so the resulting file does not need JS to run, nor a server to pre-process it before sending it to a client.

## The Component System

The markdown system is not particularly new, but it leads the way to the built-in components. These function as (mostly) drop-in replacements for the standard HTML components. For example to render an image, it's as simple as,

```markdown
<Image src="/assets/some-image.png" />
```

But behind the scenes, this loads the image, compresses it, converts it into multiple formats (webp etc.), and returns a `<picture>` element.

```html
<picture>
  <source srcset="/res/b462ccd1.webp" type="image/webp" />
  <img src="/res/31f3d1bb.png" />
</picture>
```

You'll notice the returned `src`s are hashes. Everything in the `/res` folder can be safely set with an indefinite cache policy, because if the file changes, its filename will too.

This also has a few more tricks up its sleeve. You may want to set the `width` and `height` attributes on the image to avoid layout shifts ([article](https://www.smashingmagazine.com/2020/03/setting-height-width-images-important-again/)). This is as easy as,

```markdown
<Image src="/assets/some-image.png" width="compute" height="compute" />
```

(We try to maintain as much compatibility as possible with the original HTML elements here)

And if you know your image is probably too big, and you want to resize it to at most 1000px wide?

```markdown
<Image src="/assets/some-image.png" resize="1000w" />
```

As the components are standard React components, you're not limited to only using them in your markdown.You can also use them in your own React components or page layouts.

```jsx
// components/ExampleComponent.js

import { Image } from "../core/components";

export default ({ src, chlidren }) => (
  <div style={{ display: "flex" }}>
    <Image src="src" />
    {children}
  </div>
);
```

When you are doing your own page layout, you'll also find the following components useful:

- `<InlineCss>` and `<ExternalCss>` &mdash; renders `<style>` and `<link>` elements, respectively
- `<InlineJs>` and `<ExternalJs>` &mdash; both render `<script>` elements

```jsx
// layouts/example-layout.js

import { InlineCss, ExternalJs } from "../core/components";

export default ({ title, children }) => (
  <html>
    <head>
      <title>{title ?? "No title"}</title>
      <meta charSet="utf-8" />
      <InlineCss src="/assets/site.css" />
    </head>
    <body>
      {children}
      <ExternalJs src="/assets/site.js" />
    </body>
  </html>
);
```

As you'd expect, the CSS and JS you pass in are optimised with csso and terser, respectively. And like the images, the files generated from `<ExternalCss>` and `<ExternalJs>` are named using the output hash, so can be cached indefinitely.

These components make it super-simple to decide what assets you load in a page, and how they get loaded.

## CSS

For authoring CSS, it is all plain CSS. There's no CSS-in-JS or CSS modules. The focus here was to produce the best CSS output available.

For example, open your web inspector on this code block, and look at the highlighting below,

```html
<just-some random="code">
  to
  <!-- demonstrate highlighting -->
</just-some>
```

You could equally look anywhere else on the site. The class names are short... Too short...

The CSS wasn't written this way: class names (and CSS custom properties) get minified as part of the build process.

For your CSS files, this happens automatically as part of the minification process.

For HTML (not React components) in your markdown, this also happens automatically.

For React components, you'll need to use the `classNames` helper. It works similar to the [classnames](https://www.npmjs.com/package/classnames) package &mdash; but it also does the minification.

```js
// components/ExampleComponent.js

import { Image } from "../core/components";
import { classNames } from "../core/css";

export default ({ src, inverted }) => (
  <div
    className={classNames([
      "hero-section",
      inverted && "hero-section--inverted",
    ])}
  >
    <p className={classNames("paragraph paragraph--large")}>
      A large paragraph
    </p>
    {/*
     * Note that built-in components apply the `classNames` helper themselves
     * Make sure you don't double apply it!
     */}
    <Image src={src} className="hero-section__image" />
  </div>
);
```

If you reference class names or custom properties from your JS files, you'll need to use the global-like constants, `CSS_CLASSES` and `CSS_VARS`:

```js
// /assets/example.js

const heroSection = document.querySelector("." + CSS_CLASSES["hero-section"]);
const heroSection.style.setProperty(
  CSS_VARS["--some-css-var"],
  "some-value"
)
```

This approach has two benefits. The first is the compression already mentioned. The second is that by doing this, we build a list of where class names are defined and where they're used. After we've built the site, we can compare them to see if you've added a class that's not used, or used class that was never defined.

For example, on this site, I get a few warnings from the syntax highlighting:

```
The following classes were defined in CSS, but never used in any non-CSS files:

hljs-quote, hljs-doctag, hljs-formula, hljs-section, hljs-selector-tag, hljs-subst, hljs-regexp, hljs-attribute, hljs-variable, hljs-template-variable, hljs-type, hljs-selector-class, hljs-selector-attr, hljs-selector-pseudo, hljs-symbol, hljs-bullet, hljs-link, hljs-selector-id, hljs-emphasis, hljs-strong

The following classes used one more non-CSS files, but never defined in CSS:

hljs, language-diff, language-objc, language-objectivec, hljs-meta-keyword, twitter-tweet, language-jsx, hljs-function, xml, hljs-tag, hljs-params, language-xml, language-c#, language-reasonml, hljs-operator, hljs-module-access, hljs-module, hljs-identifier, hljs-constructor, hljs-pattern-match
```

That's quite a list! For the first set warnings, I could go through and remove them from the highlighting CSS &mdash; although there is a maintainance overhead for ensuring I add them back if they do become used.

For the second set of warnings, there's not much I can do, sice these are generated from the highlighter.

However, I can tell you that as soon as I implemented these warnings, I got one warning in each category that was down to my own code. It meant I could safely delete some code, resulting in an even smaller site. I would almost certainly not have realised the issues without the help of the warnings.

## Project Status

All the site generation code is contained in the repo for this site. It's not published as a stand-alone package.

[Jacob Does Code on GitHub](https://github.com/jacobp100/jacob-does-code)

If you wanted to use the code, you should be able to fork it, delete everything in all the folders except `/core`, and then add your own content as necessary.

Run `yarn build` to build the production version of the site. It's output to `/site`.

Run `yarn start` to run a development server. This will watch files for changes and rebuild when necessary, and you can press `r` to force a full rebuild. You can see your site on port `8080`. It skips most minification steps for performance or developer ergonomic reasons.

The development server is quite good at only compiling the things that changed. Half of this is down to aggressively checking dependencies for what was used on each page, then only rebuilding the pages that need to be rebuilt. The other half of this is down to caching, so if you render an `<Image>` component, the computationally-intensive parts get cached and re-used on subsequent page renders.

When writing this blog, each recompilation is completing in 0.1&ndash;0.2s on a 6 year old laptop.

The caveat to the change detection is any changes in React components need a restart of the server to clear Node's module cache. This is something that can probably be fixed, but I haven't done it.

I don't have too much interest in (or time for) publishing and maintaining this as a stand-alone project myself. However, if you are, you're absolutely free to. Consider all the code in `/core` under the MIT license &mdash; i.e. anything that's not my literal site. If you need any help with the code, you're more than welcome to reach out to me too.
