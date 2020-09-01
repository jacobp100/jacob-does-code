# {{ include.title }}

{:.lead}
{{ include.subtitle }}

{:.store-links}
<a title="App Store" href="{{ include.app-store-href }}">
{%- include store-badges/app-store.svg -%}
</a>
{% if include.google-play-href -%}
<a title="Google Play" href="{{ include.google-play-href }}">
{%- include store-badges/google-play.svg -%}
</a>
{%- endif %}

{:.legal-links}
[Privacy Policy](/privacy)
