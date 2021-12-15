# Jacob Does Code

> [http://jacobdoescode.com](http://jacobdoescode.com)

Custom static site builder. Like Jekyll, but uses React heavily under the hood. It has the following advantages:

- Assets get tree shaken (for better or worse)
- Optimises assets, including automatic conversion of images to WebP
- Assets get renamed to their hashes for long-term caching
- MDX-based - sp you can use React components in Markdown
- Generally more React-based - no `{% if blocks %}`
- No more `_includes` hacks
- Granular control of how assets get used - including inlining critical CSS/JS if required

Using and referencing assets requires React components to do the lifting. The elements `<script>`, `<style>`, `<link>`, `<img>`, and `<video>` equivalent React components in `/core` that do asset optimisation. And finally, `<a href>` works as-is for pages, because page names don't get mangled - but won't work for asset links.

The main outstanding issue is JS and CSS assets don't have "proper" bundlers - there's only ways to transform urls to point to the correct assets. It works, but it's less efficient than what things like Webpack will achieve. CSS uses the url syntax to do this. JS works out-of-the-box for `import` declarations and expressions, and needs you to use `require.resolve` for urls not part of import statements or expressions. Given enough time, `@import` in CSS and `import` declarations in JS could/would bundle the resources, and `url()` functions in CSS and `import()` expressions in JS (or `require.resolve` calls) would map to asset references.

### Optimisations

- Images get compressed in their current format, and a WebP image is generated
  - Avif takes too long to generate (for now), so that is skipped
  - Use the `<Image>` component from `/core`
- CSS class names and variables are minified to 1 or 2 letters in prod
  - You need to use helper functions when referencing classes from JS/MDX
  - JS assets get a set of global variables (`CSS_CLASSES` and `CSS_VARS`) that you'll need to use to reference classes
- Assets are renamed to a hash of their content - you'll need to use the `useContent` hook to be able to read and write assets
  - This is also important because it's how the watcher works

If you wanted to re-use this work, there's zero options for all the optimisations: every optimisation I wanted to include is always on. Just fork and remove as necessary.
