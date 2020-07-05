---
title: Jacob Does Code
layout: page
css: blog
---

# Blog

<ul>
{% for post in site.posts %}

<li>
    <a href="{{ post.url }}">{{ post.title }}</a>
</li>
{% endfor %}
</ul>
