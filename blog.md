---
title: Jacob Does Code
layout: page
css: blog
---

# Blog

{% for post in site.posts %}

<li>
    <a href="{{ post.url }}">{{ post.title }}</a>
</li>
{% endfor %}
