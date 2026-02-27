// Fetches entries.json and builds the timeline and status card dynamically.
// To add or edit content, only entries.json needs to be changed.

fetch('entries.json')
  .then(response => response.json())
  .then(data => {
    buildTimeline(data.entries);
    buildStatus(data.status);
  })
  .catch(err => {
    console.error('Could not load entries.json:', err);
  });


// ── Build Timeline ────────────────────────────────────────────────────────────

function buildTimeline(entries) {
  const container = document.getElementById('timeline-container');
  if (!container || !entries) return;

  entries.forEach(entry => {
    const article = document.createElement('article');
    article.className = 'timeline-entry';

    // Split body on newlines to create separate paragraphs
    const paragraphs = entry.body
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => `<p>${line}</p>`)
      .join('');

    article.innerHTML = `
      <p class="entry-date">${entry.date}</p>
      <span class="tag tag-${entry.tag}">${entry.tag}</span>
      <h2 class="entry-title">${entry.title}</h2>
      <div class="entry-body">${paragraphs}</div>
    `;

    container.appendChild(article);
  });
}


// ── Build Status Card ─────────────────────────────────────────────────────────

function buildStatus(status) {
  const card = document.getElementById('status-card');
  if (!card || !status) return;

  const paragraphs = status.body
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => `<p>${line}</p>`)
    .join('');

  card.className = 'status-card';
  card.innerHTML = `
    ${paragraphs}
    <p class="last-updated">Last updated: ${status.lastUpdated}</p>
  `;
}
