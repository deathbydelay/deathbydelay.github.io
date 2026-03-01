// Fetches entries.json and builds the timeline and status card dynamically.
// To add or edit content, only entries.json needs to be changed.

fetch('entries.json')
  .then(response => response.json())
  .then(data => {
    buildTimeline(data.entries);
    buildStatus(data.status);
    buildTableOfContents(data.entries);
  })
  .catch(err => {
    console.error('Could not load entries.json:', err);
  });


// ── Build Timeline ────────────────────────────────────────────────────────────

function buildTimeline(entries) {
  const container = document.getElementById('timeline-container');
  if (!container || !entries) return;

  entries.forEach((entry, index) => {
    const article = document.createElement('article');
    article.className = 'timeline-entry';
    article.id = `entry-${index}`;

    // Body can be an array of paragraphs (from new-entry.html)
    // or a plain string — handle both gracefully
    const lines = Array.isArray(entry.body)
      ? entry.body
      : entry.body.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const paragraphs = lines.map(line => `<p>${line}</p>`).join('');

    article.innerHTML = `
      <p class="entry-date">${entry.date}</p>
      <h2 class="entry-title">${entry.title}</h2>
      <div class="entry-body">${paragraphs}</div>
    `;

    container.appendChild(article);
  });
}


// ── Build Table of Contents ───────────────────────────────────────────────────

function buildTableOfContents(entries) {
  const toggle = document.getElementById('toc-toggle');
  const list   = document.getElementById('toc-list');
  if (!toggle || !list || !entries) return;

  // Build the list items
  entries.forEach((entry, index) => {
    const li = document.createElement('li');
    const a  = document.createElement('a');
    a.href = `#entry-${index}`;
    a.innerHTML = `<span class="toc-date">${entry.date}</span>${entry.title}`;

    // Close the TOC when an item is clicked
    a.addEventListener('click', () => {
      list.classList.remove('toc-open');
      toggle.setAttribute('aria-expanded', 'false');
    });

    li.appendChild(a);
    list.appendChild(li);
  });

  // Toggle open/close
  toggle.addEventListener('click', () => {
    const isOpen = list.classList.toggle('toc-open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // Close if clicking outside
  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !list.contains(e.target)) {
      list.classList.remove('toc-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}


// ── Build Status Card ─────────────────────────────────────────────────────────

function buildStatus(status) {
  const card = document.getElementById('status-card');
  if (!card || !status) return;

  const lines = Array.isArray(status.body)
    ? status.body
    : status.body.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const paragraphs = lines.map(line => `<p>${line}</p>`).join('');

  card.className = 'status-card';
  card.innerHTML = `
    ${paragraphs}
    <p class="last-updated">Last updated: ${status.lastUpdated}</p>
  `;
}
