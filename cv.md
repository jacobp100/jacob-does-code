---
title: CV
layout: page
---

<style>
:root {
  --inset: 180px;
  -webkit-text-size-adjust: 100%;
}

h1 {
  margin: 0 0 72px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 5px;
}

h2 {
  border-top: 2px solid #333;
  padding-top: 4px;
  margin: 36px 0 12px;
  text-transform: uppercase;
  letter-spacing: 4px;
  font-weight: 580;
}

h3 {
  margin: 24px 0 0px;
  font-size: 1em;
  font-weight: 620;
  text-transform: uppercase;
  letter-spacing: 1.3px;
}

h3 time {
  margin-left: 12px;
  float: right;
}

h3::after {
  content: "";
  display: block;
  clear: both;
}

h4 {
  margin: 12px 0 8px;
  font-size: 1em;
  font-weight: 580;
  letter-spacing: 0.6px;
}

p,
ul {
  margin: 8px 0;
}

ul {
  position: relative;
  list-style-type: none;
  --padding: 36px;
  padding-left: var(--padding);
}

li::before {
  position: absolute;
  left: 0;
  content: "\27b5";
}

.timelist {
  padding: 0;
}

.timelist li::before {
  display: none;
}

.timelist time::before {
  content: "(";
}

.timelist time::after {
  content: ")";
}

.lead {
  font-size: inherit;
  line-height: inherit;
  font-style: italic;
  font-weight: 350;
}

.smcp {
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.85em;
  font-weight: 480;
}

@media (min-width: 768px) {
  h1 {
    letter-spacing: 20px;
  }

  h2 {
    margin-top: 64px;
    letter-spacing: 5px;
  }

  h1,
  h2,
  h3,
  p {
    margin-left: var(--inset);
  }

  h4 {
    position: absolute;
    width: calc(var(--inset) - 16px);
    margin: 0;
    text-align: right;
  }

  ul {
    margin-left: calc(var(--inset) - var(--padding));
  }

  .timelist {
    margin-left: var(--inset);
  }

  .timelist time {
    position: absolute;
    --padding: 12px;
    width: calc(var(--inset) - var(--padding));
    right: calc(100% + var(--padding));
    font-weight: 480;
    text-align: right;
    font-size: 14px;
  }

  .timelist time::before,
  .timelist time::after {
    content: none;
  }

  .lead {
    letter-spacing: 0.2px;
    font-weight: 250;
  }
}

@supports (hyphens: auto) or (-webkit-hyphens: auto) {
  p {
    text-align: justify;
    -webkit-hyphens: auto;
    hyphens: auto;
  }
}
</style>

# Jacob Parker

## Skills

{:.lead}
React and React Native developer. Contributor to React Native, familiar with Swift, Objective C, and some Java on Android

#### JavaScript

Specialist in <span class="smcp">javascript</span>, both in browser and with <span class="smcp">nodejs</span>. Fully up-to-date with everything from ES6 to ES2019, a user of <span class="smcp">typescript</span> and <span class="smcp">flow</span>, and I test with <span class="smcp">jest</span>.

Favourite libraries and tools include <span class="smcp">lodash fp</span>, <span class="smcp">react</span> and <span class="smcp">react native</span>, <span class="smcp">redux</span>, <span class="smcp">rxjs</span>, <span class="smcp">d3</span>, <span class="smcp">eslint</span>, <span class="smcp">webpack</span>, <span class="smcp">babel</span>, and <span class="smcp">gulp</span>. Author of many React, React Native and <span class="smcp">css</span> packages on <span class="smcp">npm</span>.

#### CSS

Skilled in vanilla <span class="smcp">css</span>, <span class="smcp">sass</span>, and <span class="smcp">postcss</span> setup. Also experienced with JavaScript solutions, including <span class="smcp">css modules</span>, and am a collaborator on <span class="smcp">styled components</span>. Experience in responsive design, bootstrap, foundation, <span class="smcp">bem</span>, and progressive enhancement.

#### Python

Knowledgable of python, with experience in web frameworks, including <span class="smcp">flask</span>, and data analysis libraries <span class="smcp">numpy</span> and <span class="smcp">scipy</span>. Contributed to <span class="smcp">pygments</span> syntax highlighting project, used by O&rsquo;Reily for their book publishing.

## Projects

- Github at [https://github.com/jacobp100](https://github.com/jacobp100)
- Apps at [https://jacobdoescode.com](https://jacobdoescode.com)

### Blog Posts

- [You Aren&rsquo;t Using Redux Middleware Enough](https://medium.com/@jacobp100/you-arent-using-redux-middleware-enough-94ffe991e6)
- [You Aren&rsquo;t Using Redux with Observables Enough](https://medium.com/@jacobp100/you-arent-using-redux-with-observables-enough-b59329c5a3af)

## Experience

### Zoopla, Tower Bridge<time>2018</time>

Full stack development on the new stack for the property search pages. Set the team up for React (Preact) components, including rendering both on the client and server, and internationalisation.

### Our Star Club, Fitzrovia<time>2018</time>

Architected React web and React Native applications for a sports-based social media platform. Set up key infrastructure and guided the team through native development. Implemented many native code libraries in both Swift and Java where existing React Native bindings were not available.

### Concentra, St Paul&rsquo;s<time>2017–2018</time>

Senior developer working on a web application specialising in visualising large organisational hierarchies with over 500,000 people, and making it fully interactive at 60fps. Used D3, React, Redux, among other libraries.

### Other Places

{:.timelist}

- Autotrip <time>2016–2017</time>
- Tido Music <time>2015–2016</time>
- Geneity <time>2014–2015</time>

## Education

### University of York<time>2011–2014</time>

First Class honours BSc in Theoretical Physics.
