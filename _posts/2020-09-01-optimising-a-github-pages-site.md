---
title: Optimising a GitHub Pages Site
layout: page
css: blog
---

# Optimising a GitHub Pages Site

This site was never particularly slow to begin with. There's no trackers, cookie banners, popups, or other annoying things. It was already responsive. Nonetheless, there was some low hanging fruit for optimisation, so I decided to look into it.

For monitoring performance, I'm mostly using Lighthouse in Microsoft Edge (or Chrome, if you prefer). It's possible to run as you're developing, but your results will be different from the live site. But be careful: this is a benchmark, not a target &mdash; you don't need to have 100 in everything &mdash; especially if the things your losing points don't make sense fixing in your project! Other than Lighthouse, I'll use the network tab, and manual benchmarking.

For better or worse, this site is hosted on GitHub pages, so uses Jekyll (you don't get much choice here). By today's standards, Jekyll feels somewhat dated. Its core API is essentially interpolating strings into other strings - much like the infamous C macros. And Jekyll _only_ understands things strings &mdash; it never truly understands your content on a lower level, like how React understands HTML elements, or like how Webpack understands JavaScript. Errors are reported in the wrong locations, we don't have sourcemaps, and there's no static analysis for things like links. For Jekyll, modern build systems have largely gone under the radar.

About half of this will be specific to Jekyll and GitHub pages, but there should be a good amount of content that is generally useful for any project.

## Minification

The most glaring omission in GitHub pages is any form of minification. HTML is not minified. JavaScript is not minified. CSS is not minified. Also, GitHub Pages doesn't have any plugins for minification, and won't let you add some (if there were any maintained minification plugins to begin with). This is somewhat mitigated by serving content gzipped &mdash; but not entirely.

The first thing you can do is set up a free account on CloudFlare for their CDN. While it is _technically_ a CDN, it does so much more: it will minify your website for you &mdash; no build step required (but you do need to turn it on). You'll also now get analytics for visitors of your site.

More than just minification, you can (and should) enable HTTP/2, Brotli compression, and long term caching.

There's not much more to this: it's a very easy performance win with probably the most gains.

## Images

Since most of these pages are marketing pages, there's quite a few images. This was highlighted in Lighthouse as one of the biggest wins for performance. The first obvious steps were reducing the dimensions image of the image and running it through [tinypng](https://tinypng.com).

The next thing to do is add WebP versions. This is currently supported in every modern browser except Safari &mdash; where support is coming in iOS 14. I used [WebP Converter](https://webp-converter.com), and managed to get about a 33% win compared to the already compressed PNGs.

There is also the AVIF image format, which will perform better, but doesn't have much support yet. Keep an eye out for this!

To use WebP images, use the `<picture>` element like so,

```html
<picture>
  <source srcset="assetUrl.webp" type="image/webp" />
  <img src="assetUrl.png" alt="Description" />
</picture>
```

Next up is the layout of images can only be computed once some of the image has loaded. Browsers will either wait for the image to partially load, or will assume its size, then content will move around once it's loaded.

To fix this, manually set the `width` and `height` attributes to your `<img>` elements to the pixel width and height of the images. This change the layout of your images, so you'll need to add some CSS. For full-width images, you want something like this,

```css
.my-full-width-image {
  max-width: 100%;
  height: auto;
}
```

Unfortunately, this is all a manual process. It would be nice if Jekyll had ways to automate this.

## Inlining CSS

This is a much-hyped performance booster. The aim is to inline your critical CSS and JavaScript.

This site has a relatively small base CSS file, then each page has an additional stylesheet that's applied on top of that. All pages share the base CSS file, and then some pages will use the same additional stylesheet.

The strategy for whether to inline or not really depends on how big your CSS is, how frequently it's used, and how important it is for loading. The options available are inlining nothing, inlining the base CSS, and inlining everything.

- {:data-bullet="❌"}The base CSS file is included in every page &mdash; caching would help here
- {:data-bullet="✅"}The base CSS file contains font faces &mdash; it's very important to begin loading these as soon as possible
- {:data-bullet="✅"}The heaviest page's base CSS and additional stylesheet combined clocks in at 3.6kb (1.2kb gzipped)

Because of the font faces and the fact that even the heaviest page is still very lightweight, I decided to just inline _all_ the CSS.

In Jekyll, it's relatively easy to inline your files. It only requires that you put your CSS in the `_includes` folder.

However, CloudFlare will not minify inlined content. We could minify the CSS outside of Jekyll, then add it back to the project &mdash; and you may well need to do that if your CSS is large.

However, I did to find out that Jekyll supports SCSS, and you can update your config to have it output CSS with no whitespace. I don't use SCSS, but since valid CSS is also valid SCSS, I can use this technique to remove the whitespace from my CSS.

```yml
# _config.yml
sass:
  style: compressed
```

{% raw %}

```liquid
<!-- _layouts/page.html -->
<style>
  {%- capture css -%}
  {%- include base.css -%}
  {%- include {{ page.css }} -%}
  {%- endcapture -%}

  {{- css | scssify -}}
</style>
```

{% endraw %}

Again, this method _only_ removes whitespace. It might seem like a big step down from the likes of cssnano, so I tested this my largest CSS file, using [gzip-size-online](https://dafrok.github.io/gzip-size-online/) to get gzip sizes.

| --- | --- |
| Method | Size (gzipped) |
| --- | --- |
| cssnano (advanced mode) | 1,214 bytes |
| Compressed SCSS | 1,233 bytes |

So the difference 19 bytes: a very easy tradeoff, since using only what GitHub pages supports out the box significantly simplifies the build process. You should, however, benchmark on your code before considering this workaround.

## JavaScript

Only one page on this site has any JavaScript: inside the TechniCalc app, you can share an equation, and get a link like [https://jacobdoescode.com/technicalc/?elements=tbcdefrghijr](/technicalc/?elements=tbcdefrghijr). This is TechniCalc marketing page, and the equation is added via JavaScript.

The JavaScript behind this feature is heavy: it requires,

- Parsing the query string and formulating a value that can be computed (~100kb)
- A web worker to actually compute that value (using a web worker, as this could hang; ~100kb)
- MathJax to render the maths (~1.2mb)

We want to make this feature does not add weight when loading the page without an equation, but we also want it to be fast to load and not make the page jump as it loads.

To achieve this, all the JS and CSS for the equation section was split out into separate files that can be lazily loaded. The HTML has a lot of embedded SVGs, so this was split out too.

Then to the the main page, I added back a placeholder element for the computation, the critical CSS required if the equation is present (this is a single rule), and critical JS to lazy load the files that were split out.

Getting the critical JavaScript right is &mdash; itself &mdash; critical: you need the absolute minimum amount of code that will show the user something. It also needs to be executed synchronously so the content doesn't move about as stuff loads in. And because it's run synchronously, it needs to be fast so the page isn't blocked loading more.

The first thing the JavaScript will do is see if there is a query string. If there is, the placeholder element will immediately be made visible. After that, the files split out earlier will be lazy loaded. The end result looks something like this,

```html
<!-- technicalc.html -->
<div id="computation" class="computation" hidden></div>
<style>
  /* Takes up at least the full height of the screen */
  /* This both reduces the chance of content moving and looks better */
  .computation {
    min-height: 100vh;
  }
</style>
<script>
  if (location.search.length > 1) {
    const container = document.getElementById("computation");
    // Immediately show container with minimum required styling
    // This will happen before the content below has been displayed
    container.removeAttribute("hidden");

    const loadHtml = fetch("/equation.html").then((res) => res.text());
    const loadStyles = importStyleSheet("/equation.css");
    const loadFullJs = import("/equation.js");
    // Initialise the worker here rather than in equation.js
    // Otherwise all network requests from imports withinin equation.js would
    // have to be complete before the network request for the worker can start
    const worker = new Worker("/worker.js");

    // Show the full content only once the HTML and full styles are loaded
    // The full content has a loading spinner that is removed by the JS
    const loadContent = Promise.all([loadHtml, loadStyles]).then(([markup]) => {
      container.innerHTML = markup;
    });

    // Run the JS once the full content is loaded and the JS is ready
    Promise.all([loadFullJs, loadContent]).then(([jsModule]) => {
      jsModule.run({ container, worker });
    });
  }

  function importStyleSheet(url) {
    return new Promise((res) => {
      const styles = document.createElement("link");
      styles.setAttribute("rel", "stylesheet");
      styles.setAttribute("href", url);
      styles.addEventListener("load", () => res());
      document.head.append(styles);
    });
  }
</script>
```

Now the critical JS is inlined, there's have the same problem as for CSS for minification. However, since there's no JavaScript processing available in Jekyll, so I had to make do with removing indentation and new lines.

{% raw %}

```liquid
<!-- technicalc.html -->
<script>
  {%- capture css -%}
  {%- include technicalc/critical-js.js -%}
  {%- endcapture -%}

  {{- js | remove: "  " | strip_newlines -}}
</script>
```

{% endraw %}

This is a hack. It has the ability to break code. Be careful using anything like this!

However, Benchmarking this using the same process as in the CSS section and UglifyJS yielded the following results,

| --- | --- |
| Method | Size (gzipped) |
| --- | --- |
| UglifyJS | 425 bytes |
| Indentation and new lines stripped | 496 bytes |

It's not quite as good compared to CSS minification &mdash; both in terms of bytes and percentage difference. Some spaces still remain (around brackets and `=` signs etc.). It would be possible to remove some of these spaces too in Jekyll. However, the potential win is tiny here, and the chance for breaking code is high.

However, I still feel like &mdash; for me at least &mdash; the tradeoff for a simpler build process here wins. All-in-all, this feature added about 0.5kb of weight to the page when it's not used. When it is used, it's progressively loaded in, and avoids large content shifts.

## Conclusion

Making these changes made me go from a performance score about 60 on mobile to around 95, and on desktop from 80 to 100.

The missing points on mobile are from not having images that are too high-res for mobile screens. However, I think it's important to have the full-res image so the user can zoom in to see more detail &mdash; and I would only save about 200kb anyway. Again, Lighthouse is a benchmark, not a target, so I opted to leave this as-is.

If you want to look more into the internals of this site, it's [open source on GitHub](https://github.com/jacobp100/jacob-does-code).
