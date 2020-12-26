# Jacob Does Code

> [http://jacobdoescode.com](http://jacobdoescode.com)

Custom static site builder. Laid out very similar to Jekyll, but uses React heavily under the hook. It has the following advantages:

- Assets get tree shaken (for better or worse)
- Optimises assets
- Assets get renamed to their hashes for long-term caching
- Can use React components in Markdown
- Generally more React-based - no `{% if blocks %}`
- No more \_includes hacks
- Granular control of assets - including inlining critical CSS/JS if required

It's not perfect, but it's good enough for this site. Firstly, the issues that just need work to fix.

Rendering React components can be a bit flaky. This is because I can't find a markdown parser that works properly with these, so there's regexp to fix them.

JS and CSS assets don't have a proper bundler, so asset references are hacked in (regexp). But they are minified.

Each page is rendered synchronously. This is because react-dom/server doesn't support suspense yet. When it does, I'd expect a decent build perf win, since asset optimisation is currently a waterfall dependency graph. Also because of this, I've tended to prefer build tools that are synchronous to the best available.

And just to note,

If you wanted to re-use this work, there's zero config for all the optimisations. Every optimisation I wanted to include is always on. Just fork and remove as necessary.

CSS classname and variable names are minified via utility functions in `/core/css`. You need to call these functions in your custom React components. JS assets get a set of global variables (`CSS_CLASSES` and `CSS_VARS`) that you'll need to use.
