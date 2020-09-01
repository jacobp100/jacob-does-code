{::options parse_block_html="true" /}

<div class="block {% if include.reverse %}block--reverse{% endif %}">

{% include picture.html baseUrl=include.baseUrl alt=include.alt class="preview" %}

<div class="block__content">

{{ include.content }}

</div>

</div>
