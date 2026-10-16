(() => {
  "use strict";
  const grid = document.getElementById("review-grid");
  const featured = document.getElementById("featured");
  const count = document.getElementById("results-count");
  const search = document.getElementById("search");
  const noResults = document.getElementById("no-results");
  const filters = [...document.querySelectorAll("[data-filter]")];
  const mediumNames = {film:"Film",television:"Television",book:"Book",music:"Music",stage:"Stage"};
  let reviews = [];
  let activeFilter = "all";

  const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const scoreText = entry => entry.score === null ? "Unrated" : Number(entry.score).toString();
  const detailUrl = entry => "./?review=" + encodeURIComponent(entry.slug);
  const mediumName = entry => mediumNames[entry.medium] || entry.medium;
  const label = entry => [mediumName(entry),entry.status].join(" / ");
  const formatDate = value => new Date(value + "T00:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});

  function renderFeatured() {
    const entry = reviews.find(item => item.featured) || reviews[0];
    if (!entry) return;
    featured.innerHTML = '<article class="feature-card"><div class="feature-copy">'+
      '<div class="feature-metadata">'+esc(mediumName(entry))+'<span class="feature-meta-dot"></span>'+esc(entry.status)+'</div>'+
      '<h2>'+esc(entry.title)+'</h2><p>'+esc(entry.excerpt)+'</p>'+
      '<a class="feature-action" href="'+detailUrl(entry)+'">Read the first impression <span aria-hidden="true">↗</span></a></div>'+
      '<div class="feature-art" role="img" aria-label="Abstract illustrated city skyline and sky, not a film still"><span class="feature-art-caption">A VISUAL NOTE, NOT A FINAL VERDICT</span></div></article>';
  }

  function renderCard(entry) {
    const score = entry.score === null ? '<span class="score unrated">Watching</span>' : '<span class="score">'+esc(scoreText(entry))+'<small>/10</small></span>';
    return '<a class="review-card" href="'+detailUrl(entry)+'" aria-label="Read '+esc(entry.title)+' review">'+
      '<div class="card-top"><span>'+esc(mediumName(entry))+'</span><span>'+esc(entry.status)+'</span></div>'+
      '<div class="card-cover palette-'+esc(entry.palette || "moss")+'"><span>'+esc(entry.title)+'</span></div>'+
      '<div class="card-title-row"><h3 class="card-title">'+esc(entry.title)+'</h3>'+score+'</div>'+
      '<p class="card-excerpt">'+esc(entry.excerpt)+'</p><div class="card-foot">'+esc(entry.tags[0] || "Personal note")+' · '+esc(formatDate(entry.date))+' ↗</div></a>';
  }

  function renderArchive() {
    const q = search.value.trim().toLowerCase();
    const matched = reviews.filter(entry =>
      (activeFilter === "all" || entry.medium === activeFilter) &&
      (!q || [entry.title,entry.excerpt,...(entry.tags || [])].join(" ").toLowerCase().includes(q))
    );
    grid.innerHTML = matched.map(renderCard).join("");
    count.textContent = matched.length + (matched.length === 1 ? " entry" : " entries");
    noResults.hidden = matched.length !== 0;
  }

  function renderDetail(slug) {
    document.getElementById("home-view").hidden = true;
    const detailView = document.getElementById("detail-view");
    detailView.hidden = false;
    const entry = reviews.find(item => item.slug === slug);
    if (!entry) {
      document.title = "Not found — The Long Take";
      document.getElementById("detail-content").innerHTML = '<h1>That note is not here.</h1><p>Try the archive.</p>';
      return;
    }
    document.title = entry.title + " — The Long Take";
    const score = entry.score === null ? "Not scored yet" : esc(scoreText(entry)) + "<small>/10</small>";
    const body = entry.body.map(paragraph => "<p>"+esc(paragraph)+"</p>").join("");
    const tags = (entry.tags || []).map(esc).join(", ");
    document.getElementById("detail-content").innerHTML =
      '<header class="detail-head"><div class="detail-meta"><span>'+esc(mediumName(entry))+'</span><span class="detail-label-dot"></span><span>'+esc(entry.status)+'</span></div>'+
      '<h1>'+esc(entry.title)+'</h1><p class="detail-summary">'+esc(entry.excerpt)+'</p><p class="detail-score">'+score+'</p></header>'+
      '<div class="detail-body"><aside class="detail-sidebar"><strong>Published</strong><br>'+esc(formatDate(entry.date))+
      '<br><br><strong>Filed under</strong><br>'+esc(tags)+'<br><br><strong>By</strong><br>Marko</aside>'+
      '<div class="detail-copy">'+body+
      '<p class="detail-notice">'+(entry.status==="First impression"?"First impression only; a full-film rating will follow after viewing.":"A short, personal notebook entry based on an actual viewing opinion. More detail may be added later.")+
      '</p></div></div>';
  }

  filters.forEach(filter => filter.addEventListener("click", () => {
    activeFilter = filter.dataset.filter;
    filters.forEach(button => {
      const selected = button === filter;
      button.classList.toggle("active",selected);
      button.setAttribute("aria-pressed",String(selected));
    });
    renderArchive();
  }));
  search.addEventListener("input", renderArchive);
  document.getElementById("year").textContent = String(new Date().getFullYear());

  fetch("./reviews.json")
    .then(response => { if(!response.ok) throw new Error("Could not load notes"); return response.json(); })
    .then(entries => {
      if(!Array.isArray(entries)) throw new Error("Invalid notes");
      reviews = entries;
      const slug = new URLSearchParams(window.location.search).get("review");
      if (slug) renderDetail(slug);
      else { renderFeatured(); renderArchive(); }
    })
    .catch(() => {
      const slug = new URLSearchParams(window.location.search).get("review");
      if(slug) document.getElementById("detail-view").hidden = false;
      grid.innerHTML = '<p role="alert">Reviews could not load. Please refresh the page.</p>';
      count.textContent = "Unavailable";
    });
})();
