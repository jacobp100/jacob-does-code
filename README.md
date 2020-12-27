# Jacob Does Code

> [http://jacobdoescode.com](http://jacobdoescode.com)

Custom static site builder. Laid out very similar to Jekyll, but uses React heavily under the hood. It has the following advantages:

- Assets get tree shaken (for better or worse)
- Optimises assets
- Assets get renamed to their hashes for long-term caching
- Can use React components in Markdown
- Generally more React-based - no `{% if blocks %}`
- No more \_includes hacks
- Granular control of how assets get used - including inlining critical CSS/JS if required

It's not perfect, but it's good enough for this site. Mostly, this is the issues that just need time investment to fix.

Rendering React components can be a bit flaky. This is because I can't find a markdown parser that works properly with these, so there's regexp applied on top to fix some quirks (and make more quicks in the process).

Each page is rendered synchronously, and asset optimisation does the same. It's not yet possible to optimise multiple assets at the same time because react-dom/server doesn't support suspense yet. When it does, I'd expect a decent build perf win if this gets fixed. Also because of this, I've tended to prefer build tools that are synchronous to the best tools available.

JS and CSS assets don't have "proper" bundlers - there's only ways to transform urls to point to the correct assets - not embed assets within them. CSS uses the url syntax. JS works out-of-the-box for import declarations and expressions, and needs you to use `require.resolve` for urls not part of import statements or expressions. Given enough time, `@import` in CSS and `import` declarations in JS would bundle the resources, and `url` functions and `import` expressions (or `require.resolve` calls) would map to asset references.

Referencing assets requires React components to do the lifting. The elements `<script>`, `<style>`, `<link>`, `<img>`, and `<video>` equivalent React components that do optimisation. And finally, `<a href>` works as-is for pages, because page names don't get mangled - but won't work for asset links.

This last point less a time investment, and more a conceptual question. CSS works without any special extensions. JS relies a few special extensions. Markdown is half-and-half extensions via React components and some HTML elements working out the box. Where should these asset references be handled?

And just to note,

If you wanted to re-use this work, there's zero config for all the optimisations. Every optimisation I wanted to include is always on. Just fork and remove as necessary.

CSS class and variable names are minified via utility functions in `/core/css`. You need to call these functions in your custom React components. JS assets get a set of global variables (`CSS_CLASSES` and `CSS_VARS`) that you'll need to use.
