// Fetches entries/index.json which contains all the markdown filenames, then fetch and parse each markdown file to build the timeline.
// To add a new entry, save a yyyymmdd.md file in the entries folder and add the filename to index.json in the entries folder.

fetch('entries/index.json')
  .then(response => response.json())
  .then(filenames => {
    filenames.sort();
    return Promise.all(filenames.map(filename => loadEntry(filename)));
  })
  .then(entries => {
    buildTimeline(entries);
    buildTableOfContents(entries);
  })
  .catch(err => {
    console.error('Could not load index.json:', err);
  });

// Load Entry function

function loadEntry(filename) {
  return fetch(`entries/${filename}`)
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

// Converting Markdown to HTML Tags

function markdownToHtml(markdown) {
  const paragraphs = markdown
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  return paragraphs.map(p => {
    const html = p
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');

    return `<p>${html}</p>`;
  }).join('');
}


  // ── Build Timeline ────────────────────────────────────────────────────────────

function buildTimeline(entries) {
  const container = document.getElementById('timeline-container');
  if (!container || !entries) return;

  entries.forEach((entry, index) => {
    const article = document.createElement('article');
    article.className = 'timeline-entry';
    article.id = `entry-${index}`;

    article.innerHTML = `
      <p class="entry-date">${entry.date}</p>
      <h2 class="entry-title">${entry.title}</h2>
      <div class="entry-body">${entry.bodyHtml}</div>
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
  const li = document.createElement('li');
  const a  = document.createElement('a');
  a.href = `#entry-${entries.length-1}`
  a.textContent = 'Jump to latest';
  li.appendChild(a);
  list.appendChild(li);
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

// Shrink header font when scrolled

const header = document.getElementById('header');
const nav = document.querySelector('nav');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.classList.add('header-shrink');
  } else {
    header.classList.remove('header-shrink');
  }
});

header.addEventListener('transitionend', () => {
  document.documentElement.style.setProperty('--header-height', header.getBoundingClientRect().height + "px")
  document.documentElement.style.setProperty('--sticky-offset', header.getBoundingClientRect().height + nav.getBoundingClientRect().height + "px")
  console.log('offsetHeight:', header.offsetHeight);
  console.log('getBoundingClientRect:', header.getBoundingClientRect().height);
});