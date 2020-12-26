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

JS and CSS assets don't have proper bundlers, so asset references are hacked in (regexp). But they are minified.

CSS uses the url syntax. JS works out-of-the-box for import statements and expressions, and needs you to use `require.resolve` for urls not part of import statements or expressions.

Referencing assets from HTML is flaky too. Video elements work as-is. The elements `<script>`, `<style>`, `<link>`, and `<img>` equivalent React components that do optimisation. And finally, `<a href>` works as-is for pages, because page names don't get mangled - but won't work for asset links.

This last two point are less a time investment, and more a conceptual question. CSS works without any special extensions. JS relies special extensions. Markdown is half-and-half extensions via React components and some HTML elements working out the box. At what point do you extend languages?

And just to note,

If you wanted to re-use this work, there's zero config for all the optimisations. Every optimisation I wanted to include is always on. Just fork and remove as necessary.

CSS class and variable names are minified via utility functions in `/core/css`. You need to call these functions in your custom React components. JS assets get a set of global variables (`CSS_CLASSES` and `CSS_VARS`) that you'll need to use.
