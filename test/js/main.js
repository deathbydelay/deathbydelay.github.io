// Fetches entries/index.json which contains all the markdown filenames, then fetch and parse each markdown file to build the timeline.
// To add a new entry, save a yyyymmdd.md file in the entries folder and add the filename to index.json in the entries folder.

fetch('entries/index.json')
  .then(response => response.json())
  .then(filenames => {
    filenames.sort();
    console.log(filenames);
    return Promise.all(filenames.map(filename => loadEntry(filename)));
  })
  .then(entries => {
    buildTimeline(data.entries);
    buildTableOfContents(data.entries);
  })
  .catch(err => {
    console.error('Could not load index.json:', err);
  });

// Load Entry function

function loadEntry(filename) {
  return fetch('entries/${filename}')
    .then(response => response.text())
    .then(markdown => parseEntry (markdown, filename));
}

// Parsing a markdown file

function parseEntry(markdown, filename) {
  const lines = markdown.split('\n');

  let date = '';
  let title = '';
  let bodyStartIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('# ')) {
      date = line.replace('# ','');
    }

    if (line.startsWith('## ')) {
      title = line.replace('## ', '');
      bodyStartIndex = i + 1;
    }
  }

  const bodyLines = lines.slice(bodyStartIndex);
  const bodyMarkdown = bodyLines.join('\n');

  return {
    date: date,
    title: title,
    bodyHtml: markdownToHtml(bodyMarkdown)
  };
}


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