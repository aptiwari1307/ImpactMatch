
const DATA_URL = './data/ngos.json';
let _cache = null;

async function fetchNGOs() {
  if (_cache) return _cache;
  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    _cache = await res.json();
    return _cache;
  } catch (err) {
    console.error('[api] Failed to load NGO data:', err);
    return [];
  }
}

async function getCategories() {
  const list = await fetchNGOs();
  return [...new Set(list.map(n => n.category))].sort();
}

async function getAllSkills() {
  const list = await fetchNGOs();
  const set = new Set();
  list.forEach(n => n.skills.forEach(s => set.add(s)));
  return [...set].sort();
}

function getUserSkills() {
  try { 
    const val = JSON.parse(localStorage.getItem('im_user_skills'));
    return Array.isArray(val) ? val : [];
  } catch { return []; }
}

function saveUserSkills(skills) {
  localStorage.setItem('im_user_skills', JSON.stringify(skills));
}

function isNGOSaved(id) {
  try { 
    const val = JSON.parse(localStorage.getItem('im_saved_ngos'));
    return Array.isArray(val) && val.includes(id);
  } catch { return false; }
}
function computeMatch(userSkills, ngo) {
  const required = ngo.skills || [];
  if (required.length === 0) return { score: 0, matchedSkills: [], gapSkills: [] };

  const normalise = s => s.trim().toLowerCase();
  const userSet   = new Set(userSkills.map(normalise));

  const matchedSkills = required.filter(s => userSet.has(normalise(s)));
  const gapSkills     = required.filter(s => !userSet.has(normalise(s)));
  const score         = Math.round((matchedSkills.length / required.length) * 100);

  return { score, matchedSkills, gapSkills };
}

function rankNGOs(userSkills, ngos, minScore = 0) {
  return ngos
    .map(ngo => ({ ngo, ...computeMatch(userSkills, ngo) }))
    .filter(r => r.score >= minScore)
    .sort((a, b) => b.score - a.score || (b.ngo.isUrgent ? 1 : 0) - (a.ngo.isUrgent ? 1 : 0));
}

function scoreClass(pct) {
  if (pct >= 70) return 'high';
  if (pct >= 40) return 'mid';
  return 'low';
}

function scoreLabel(pct) {
  if (pct >= 70) return 'Great Match';
  if (pct >= 40) return 'Good Match';
  return 'Partial Match';
}

function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileNav = document.querySelector('.nav-mobile');

  window.addEventListener('scroll', () => {
    navbar?.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  hamburger?.addEventListener('click', () => {
    mobileNav?.classList.toggle('open');
  });

  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar-links a, .nav-mobile a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
}

function formatNumber(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString();
}

function initCounters(selector = '[data-count]') {
  document.querySelectorAll(selector).forEach(el => {
    el.textContent = formatNumber(parseFloat(el.dataset.count)) + (el.dataset.suffix || '');
  });
}

function renderNGOCard(ngo, userSkills = []) {
  const { score } = computeMatch(userSkills, ngo);
  const cls = scoreClass(score);

  const matchBadge = userSkills.length
    ? `<div class="match-score match-${cls}">${score}%</div>`
    : '';

  const skillTags = ngo.skills.slice(0, 4).map(s => {
    const isMatch = userSkills.some(u => u.toLowerCase() === s.toLowerCase());
    return `<span class="skill-tag ${isMatch ? 'matched' : ''}">${s}</span>`;
  }).join('');

  const card = document.createElement('div');
  card.className = `ngo-card${ngo.isUrgent ? ' is-urgent' : ''}`;
  card.innerHTML = `
    <div class="ngo-card-img-wrap">
      <img src="${ngo.image}" alt="${ngo.name}" loading="lazy">
      <div class="ngo-card-badges">
        ${ngo.isUrgent ? '<span class="badge badge-urgent">Urgent</span>' : ''}
        <span class="badge badge-blue">${ngo.category}</span>
      </div>
    </div>
    <div class="ngo-card-body">
      <div class="ngo-card-name">${ngo.name}</div>
      <p class="ngo-card-desc">${ngo.description}</p>
      <div class="ngo-card-skills">${skillTags}</div>
      <div class="ngo-card-footer">
        <div class="ngo-impact-num">
          <strong>${formatNumber(ngo.impact.peopleHelped)}</strong>
          <span>people helped</span>
        </div>
        ${matchBadge}
      </div>
    </div>
    <div class="ngo-card-action-row">
      <a href="dashboard.html" class="btn btn-primary btn-sm">Match Now</a>
      <a href="impact.html" class="btn btn-outline btn-sm">Impact</a>
    </div>
  `;
  return card;
}

function renderMatchCard(result) {
  const { ngo, score, matchedSkills, gapSkills } = result;
  const cls = scoreClass(score);

  const matchedHtml = matchedSkills.map(s => `<span class="skill-tag matched">${s}</span>`).join('');

  const card = document.createElement('div');
  card.className = 'match-card';
  card.innerHTML = `
    <div class="match-card-top">
      <img class="match-card-img" src="${ngo.image}" alt="${ngo.name}" loading="lazy">
      <div class="match-card-info">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap: 16px;">
           <div>
             <div class="match-card-name">${ngo.name}</div>
             <div class="badge badge-blue" style="display:inline-block; margin-top:4px;">${ngo.category}</div>
           </div>
           <div style="text-align:right;">
             <span class="match-score-label">Match Score</span>
             <div class="match-score match-${cls}">${score}%</div>
           </div>
        </div>
        <p class="ngo-card-desc" style="margin-top:12px;">${ngo.description}</p>
      </div>
    </div>
    <div style="padding:20px; background:var(--bg); border-top:1px solid var(--border);">
      <div style="font-size:0.75rem; font-weight:800; text-transform:uppercase; margin-bottom:12px; color:var(--text-muted);">Why You Match</div>
      <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:16px;">${matchedHtml || 'No matches'}</div>
      
      <div class="score-bar-track">
        <div class="score-bar-fill ${cls}" style="width:${score}%"></div>
      </div>
      <div style="font-size:0.85rem; font-weight:800; color:var(--${cls === 'high' ? 'primary' : cls === 'mid' ? 'warning' : 'danger'})">
        ${scoreLabel(score)}
      </div>
    </div>
    <div class="match-card-actions">
      <a href="impact.html" class="btn btn-outline btn-sm">Impact</a>
      <a href="explore.html" class="btn btn-primary btn-sm">Volunteer</a>
    </div>
  `;
  return card;
}

function showToast(message, type = 'success') {
  const existing = document.querySelector('.im-toast');
  existing?.remove();
  const toast = document.createElement('div');
  toast.className = 'im-toast';
  toast.style.cssText = `position:fixed;bottom:24px;right:24px;z-index:9999;background:${type === 'success' ? 'var(--primary)' : 'var(--danger)'};color:#fff;padding:12px 20px;border-radius:var(--radius);font-weight:600;font-size:.88rem;box-shadow:0 4px 12px rgba(0,0,0,0.1);`;
  toast.innerHTML = message;
  document.body.appendChild(toast);
  setTimeout(() => { toast.remove(); }, 3000);
}
async function initLanding() {
  initCounters('[data-count]');
  const ngos = await fetchNGOs();
  const grid  = document.getElementById('featuredGrid');
  if (!grid) return;
  grid.innerHTML = ''; // Clear loader
  ngos.filter(n => n.isUrgent).slice(0, 3).forEach(ngo => grid.appendChild(renderNGOCard(ngo)));
}

async function initExplore() {
  const ngos       = await fetchNGOs();
  const categories = await getCategories();
  const allSkills  = await getAllSkills();
  const userSkills = getUserSkills();

  const grid        = document.getElementById('exploreGrid');
  const searchInput = document.getElementById('searchInput');
  const catSelect   = document.getElementById('catFilter');
  const skillSelect = document.getElementById('skillFilter');
  const countEl     = document.getElementById('resultCount');
  const urgentChip  = document.getElementById('urgentChip');

  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat; opt.textContent = cat;
    catSelect?.appendChild(opt);
  });

  allSkills.forEach(skill => {
    const opt = document.createElement('option');
    opt.value = skill; opt.textContent = skill;
    skillSelect?.appendChild(opt);
  });

  let urgentOnly = false;
  urgentChip?.addEventListener('click', () => {
    urgentOnly = !urgentOnly;
    urgentChip.classList.toggle('active', urgentOnly);
    render();
  });

  const render = () => {
    const q       = searchInput?.value.toLowerCase() || '';
    const cat     = catSelect?.value;
    const skill   = skillSelect?.value;

    let filtered = ngos.filter(n => {
      const matchQ    = !q || n.name.toLowerCase().includes(q) || n.description.toLowerCase().includes(q);
      const matchCat  = !cat  || n.category === cat;
      const matchSkill = !skill || n.skills.includes(skill);
      const matchUrg  = !urgentOnly || n.isUrgent;
      return matchQ && matchCat && matchSkill && matchUrg;
    });

    if (countEl) countEl.innerHTML = `<strong>${filtered.length}</strong> NGOs found`;
    grid.innerHTML = '';
    filtered.forEach(n => grid.appendChild(renderNGOCard(n, userSkills)));
  };

  searchInput?.addEventListener('input', render);
  catSelect?.addEventListener('change', render);
  skillSelect?.addEventListener('change', render);
  render();
}

async function initDashboard() {
  const ngos    = await fetchNGOs();
  const tagInputWrap  = document.getElementById('tagInputWrap');
  const tagInput      = document.getElementById('tagInput');
  const matchBtn      = document.getElementById('matchBtn');
  const resultsArea   = document.getElementById('resultsArea');
  const quickChips    = document.getElementById('quickChips');

  let currentTags = [...getUserSkills()];

  const popularSkills = ['Teaching', 'Medical', 'Web Development', 'Counseling', 'Content Writing', 'Social Media', 'Data Analysis', 'Logistics', 'Mentoring', 'UI/UX Design', 'Environmental Science', 'Community Outreach'];

  if (quickChips) {
    popularSkills.forEach(skill => {
      const chip = document.createElement('button');
      chip.className = `quick-chip${currentTags.includes(skill) ? ' selected' : ''}`;
      chip.textContent = skill;
      chip.addEventListener('click', () => {
        if (currentTags.includes(skill)) {
          currentTags = currentTags.filter(t => t !== skill);
          chip.classList.remove('selected');
        } else {
          currentTags.push(skill);
          chip.classList.add('selected');
        }
        renderTags();
      });
      quickChips.appendChild(chip);
    });
  }

  function renderTags() {
    if (!tagInputWrap) return;
    tagInputWrap.querySelectorAll('.input-tag').forEach(el => el.remove());
    currentTags.forEach((tag, i) => {
      const el = document.createElement('span');
      el.className = 'input-tag';
      el.innerHTML = `${tag}<button class="tag-remove" data-i="${i}">✕</button>`;
      el.querySelector('.tag-remove').addEventListener('click', () => {
        currentTags.splice(i, 1);
        document.querySelectorAll('.quick-chip').forEach(c => { if (c.textContent === tag) c.classList.remove('selected'); });
        renderTags();
      });
      tagInputWrap.insertBefore(el, tagInput);
    });
  }

  tagInput?.addEventListener('keydown', (e) => {
    const val = tagInput.value.trim();
    if ((e.key === 'Enter' || e.key === ',') && val) {
      e.preventDefault();
      if (!currentTags.includes(val)) currentTags.push(val);
      tagInput.value = '';
      renderTags();
    }
    if (e.key === 'Backspace' && !val && currentTags.length) { 
      currentTags.pop(); 
      document.querySelectorAll('.quick-chip').forEach(c => { if (c.textContent === currentTags[currentTags.length]) c.classList.remove('selected'); });
      renderTags(); 
    }
  });

  matchBtn?.addEventListener('click', () => {
    if (!currentTags.length) { showToast('Add at least one skill first!', 'error'); return; }
    const ranked = rankNGOs(currentTags, ngos);
    displayResults(ranked);
    saveUserSkills(currentTags);
  });

  function displayResults(ranked) {
    if (!resultsArea) return;
    resultsArea.innerHTML = '';
    if (!ranked.length) {
      resultsArea.innerHTML = '<div class="results-placeholder"><p>No matches found.</p></div>';
      return;
    }
    const header = document.createElement('div');
    header.className = 'results-header';
    header.innerHTML = `<h2>Your Matches (${ranked.length})</h2>`;
    resultsArea.appendChild(header);
    ranked.forEach(r => resultsArea.appendChild(renderMatchCard(r)));
  }

  if (currentTags.length) { renderTags(); displayResults(rankNGOs(currentTags, ngos)); }
}

async function initImpact() {
  const ngos = await fetchNGOs();
  initCounters('[data-count]');

  const totalPeople   = ngos.reduce((s, n) => s + n.impact.peopleHelped, 0);
  const totalProjects = ngos.reduce((s, n) => s + n.impact.projectsCompleted, 0);
  const totalNGOs     = ngos.length;

  const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.dataset.count = val; };
  setVal('totalPeople', totalPeople);
  setVal('totalProjects', totalProjects);
  setVal('totalNGOs', totalNGOs);
  setVal('totalCats', [...new Set(ngos.map(n => n.category))].length);

  const barCtx = document.getElementById('barChart');
  if (barCtx && window.Chart) {
    const sorted = [...ngos].sort((a, b) => b.impact.peopleHelped - a.impact.peopleHelped);
    new window.Chart(barCtx, {
      type: 'bar',
      data: {
        labels: sorted.map(n => n.name),
        datasets: [{ label: 'People Helped', data: sorted.map(n => n.impact.peopleHelped), backgroundColor: '#2ea673' }]
      },
      options: { animation: false, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { grid: { display: false } } } }
    });
  }

  const topGrid = document.getElementById('topNGOsGrid');
  if (topGrid) {
    topGrid.innerHTML = '';
    const sorted2 = [...ngos].sort((a, b) => b.impact.peopleHelped - a.impact.peopleHelped);
    sorted2.slice(0, 6).forEach((ngo, i) => {
      const card = document.createElement('div');
      card.className = 'top-ngo-card';
      card.innerHTML = `<div style="font-weight:800; color:var(--primary); margin-bottom:4px;">#${i+1}</div><div class="top-ngo-name">${ngo.name}</div><div class="top-ngo-cat" style="font-size:0.75rem; color:var(--text-muted);">${ngo.category}</div><div style="margin-top:12px; font-size:0.9rem;"><strong>${ngo.impact.peopleHelped.toLocaleString()}</strong> helped</div>`;
      topGrid.appendChild(card);
    });
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  initNavbar();
  const path = location.pathname.toLowerCase();
  
  if (path.includes('explore')) {
    await initExplore();
  } else if (path.includes('dashboard')) {
    await initDashboard();
  } else if (path.includes('impact')) {
    await initImpact();
  } else {
    await initLanding();
  }
});
