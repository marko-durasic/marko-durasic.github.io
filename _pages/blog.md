---
layout: default
permalink: /blog/
title: "Writing & Notes | Marko Durasic"
description: "Engineering notes, essays and independent inquiries by Marko Durasic."
author_profile: false
---

<main class="studio-page" id="content">
  <p class="studio-page__eyebrow">WRITING / NOTES / ESSAYS</p>
  <h1 class="studio-page__title">Thinking<br><em>out loud.</em></h1>
  <p class="studio-page__lede">Practical engineering notes, things I've learned building software, and questions that deserve a longer look. Finished work and ongoing inquiries both have a place here.</p>

  <section class="studio-page__section">
    <h2>All writing</h2>
    <div><ul class="studio-page__itemlist">
      {% for post in site.posts %}
      <li><a href="{{ post.url | relative_url }}"><strong>{{ post.title | default: post.slug | escape }}</strong><small>{{ post.excerpt | strip_html | normalize_whitespace | truncate: 185 }}</small></a><span class="studio-item-arrow" aria-hidden="true">↗</span></li>
      {% endfor %}
    </ul></div>
  </section>
</main>
