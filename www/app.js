'use strict';

/* ---------- данные ---------- */
const KEY = 'dz.v1';

const DEFAULT_SUBJECTS = [
  // Front
  { id: 'f1', name: 'HTML 5 API', short: 'HTML5 API', color: '#e9e1fa',
    dn: ['html 5 api', 'html5'], kw: ['html5', 'html 5', 'api'] },
  { id: 'f2', name: 'HTML/CSS', short: 'HTML/CSS', color: '#d8f2e4',
    dn: ['html/css'], kw: ['html', 'css', 'верстк', 'flex', 'grid'] },
  { id: 'f3', name: 'Web-компоненты', short: 'Web-компоненты', color: '#fff1bf',
    dn: ['web-компонент', 'веб-компонент', 'компонент'], kw: ['web-компонент', 'веб-компонент', 'компонент', 'shadow', 'custom element'] },
  { id: 'f4', name: 'Архитектура информационной системы предприятия', short: 'Архитектура ИС', color: '#dbeafe',
    dn: ['архитектура информационной'], kw: ['архитектур', 'информационн', 'предприят', 'uml', 'bpmn'] },
  { id: 'f5', name: 'Введение в фреймворки JavaScript', short: 'Фреймворки JS', color: '#ffe8d1',
    dn: ['введение в фреймворки', 'фреймворки javascript'], kw: ['фреймворк', 'framework', 'react', 'vue', 'angular', 'svelte', 'js', 'javascript'] },
  { id: 'f6', name: 'Учебная практика Front', short: 'Практика Front', color: '#d9f1f5',
    dn: ['практика front'], kw: ['практик', 'front', 'фронт'] },
  // общие
  { id: 'b3', name: 'Английский язык А2-В1', short: 'Английский', color: '#fde0e4',
    dn: ['английский'], kw: ['англ', 'english', 'eng'] },
  { id: 'b5', name: 'Основы работы с технической документацией', short: 'Техдокументация', color: '#e4f5c8',
    dn: ['технической документацией', 'техническ'], kw: ['техдок', 'документац', 'техническ', 'тз'] },
  { id: 'b7', name: 'Тестирование. Проектирование тестов', short: 'Тестирование', color: '#f6dcf3',
    dn: ['тестирование'], kw: ['тест', 'qa', 'чек-лист', 'баг'] },
  { id: 'b9', name: 'Физическая культура', short: 'Физра', color: '#ece7dc',
    dn: ['физическая культура', 'физическая'], kw: ['физ', 'физра', 'физкульт', 'спорт', 'норматив'] },
  // Backend
  { id: 'b1', name: 'Автоматизация развёртывания и управления приложениями', short: 'Автоматизация', color: '#e9e1fa',
    dn: ['автоматизация развертывания'], kw: ['автоматизац', 'развертыван', 'deploy', 'docker', 'докер', 'ci/cd', 'ansible'] },
  { id: 'b2', name: 'Алгоритмы и структуры данных', short: 'Алгоритмы', color: '#d8f2e4',
    dn: ['алгоритмы и структуры'], kw: ['алгоритм', 'структур', 'сортировк', 'дерево', 'деревья', 'асд'] },
  { id: 'b4', name: 'Основы Linux', short: 'Linux', color: '#fff1bf',
    dn: ['основы linux', 'linux'], kw: ['linux', 'линукс', 'bash', 'терминал', 'shell'] },
  { id: 'b6', name: 'Разработка на Node.js с использованием фреймворков', short: 'Node.js', color: '#dbeafe',
    dn: ['node.js', 'разработка на node'], kw: ['node', 'нод', 'express', 'nest', 'фреймворк', 'framework', 'npm'] },
  { id: 'b8', name: 'Учебная практика Back', short: 'Практика Back', color: '#d9f1f5',
    dn: ['практика back'], kw: ['практик', 'back', 'бэк', 'бек', 'бекенд', 'бэкенд'] },
  { id: 'b10', name: 'Язык программирования Go on web', short: 'Go', color: '#ffe8d1',
    dn: ['go on web', 'программирования go', 'язык программирования'], kw: ['golang', 'go', 'горутин'] },
];

const PALETTE_EXTRA = ['#e9e1fa', '#d8f2e4', '#fff1bf', '#fde0e4', '#dbeafe', '#ffe8d1'];

function load() {
  const fresh = () => DEFAULT_SUBJECTS.map(s => ({ ...s }));
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && Array.isArray(s.subjects) && Array.isArray(s.tasks)) {
      const vis = s.visible;
      s.subjects = fresh().filter(x => !vis || vis.includes(x.id)).concat(s.subjects.filter(x => x.extra));
      s.grades = s.grades || { 3: 50, 4: 70, 5: 90 };
      s.diary = s.diary || {};
      return s;
    }
  } catch (e) { /* пусто или битые данные */ }
  return { subjects: fresh(), tasks: [], grades: { 3: 50, 4: 70, 5: 90 }, diary: {} };
}
const state = load();
const save = () => localStorage.setItem(KEY, JSON.stringify(state));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

/* ---------- даты ---------- */
const pad = n => String(n).padStart(2, '0');
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const today = () => ymd(new Date());
const parseYmd = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = parseYmd(s); d.setDate(d.getDate() + n); return ymd(d); };
const diffDays = (a, b) => Math.round((parseYmd(a) - parseYmd(b)) / 864e5);
const fmtShort = s => { const d = parseYmd(s); return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}`; };

/* ---------- разбор быстрой строки ---------- */
const norm = s => s.toLowerCase().replace(/ё/g, 'е');
const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const WD = { пн: 1, вт: 2, ср: 3, чт: 4, пт: 5, сб: 6, вс: 0 };

function detectSubject(str) {
  const t = norm(str);
  let best = null, bestLen = 0;
  for (const s of state.subjects) {
    for (const k of s.kw) {
      const kk = norm(k);
      const re = new RegExp(`(^|[^а-яa-z0-9])${reEsc(kk)}${kk.length <= 3 ? '(?![а-яa-z0-9])' : ''}`);
      if (re.test(t) && kk.length > bestLen) { best = s; bestLen = kk.length; }
    }
  }
  return best;
}

function extractDue(text) {
  const base = today();
  const cut = (m, due) => ({ due, rest: (text.slice(0, m.index) + ' ' + text.slice(m.index + m[0].length)).replace(/\s+/g, ' ').trim() });
  let m;

  // «до 15.10», «к 15.10.26»
  if ((m = /(?:^|\s)(?:до|к)\s+(\d{1,2})\.(\d{1,2})(?:\.(\d{2,4}))?(?=\s|$|[.,])/i.exec(text))) {
    const now = new Date();
    let y = m[3] ? Number(m[3]) : now.getFullYear();
    if (y < 100) y += 2000;
    let d = new Date(y, Number(m[2]) - 1, Number(m[1]));
    if (!m[3] && diffDays(ymd(d), base) < -30) d = new Date(y + 1, d.getMonth(), d.getDate());
    return cut(m, ymd(d));
  }
  // «до пт», «к пятнице»
  if ((m = /(?:^|\s)(?:до|к|на)\s+(пн|вт|ср|чт|пт|сб|вс)[а-я]*(?=\s|$|[.,])/i.exec(text))) {
    const target = WD[m[1].toLowerCase()];
    const delta = (target - new Date().getDay() + 7) % 7 || 7;
    return cut(m, addDays(base, delta));
  }
  // «завтра», «до завтра», «послезавтра», «сегодня»
  if ((m = /(?:^|\s)(?:до|на|к)?\s*(сегодня|завтра|послезавтра)(?=\s|$|[.,])/i.exec(text))) {
    const w = m[1].toLowerCase();
    return cut(m, addDays(base, w === 'сегодня' ? 0 : w === 'завтра' ? 1 : 2));
  }
  return { due: null, rest: text };
}

function parseQuick(raw) {
  let text = raw.trim();
  if (!text) return null;
  const { due, rest } = extractDue(text);
  text = rest || text;

  let left = null, title = text;
  const sep = /\s+[-–—]\s+|\s*:\s+/.exec(text);
  if (sep) {
    left = text.slice(0, sep.index).trim();
    title = text.slice(sep.index + sep[0].length).trim();
  }
  let subj = left ? detectSubject(left) : null;
  if (!subj) { subj = detectSubject(text); title = text; }
  if (!title) title = text;
  return { subjectId: subj ? subj.id : null, title, due };
}

/* ---------- вспомогательное ---------- */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const subj = id => state.subjects.find(s => s.id === id) || { short: 'Без предмета', name: 'Без предмета', color: '#eeeaf5' };

function dueLabel(x) {
  if (!x.due) return '';
  const d = diffDays(x.due, today());
  let txt, cls = '';
  if (x.done) txt = 'до ' + fmtShort(x.due);
  else if (d < 0) { txt = `просрочено на ${-d} дн.`; cls = 'bad'; }
  else if (d === 0) { txt = 'сегодня'; cls = 'warn'; }
  else if (d === 1) { txt = 'завтра'; cls = 'warn'; }
  else txt = 'до ' + fmtShort(x.due) + (d <= 3 ? ` (через ${d} дн.)` : '');
  return `<span class="due ${cls}">${txt}</span>`;
}

function card(x) {
  const s = subj(x.subjectId);
  const pts = (x.score != null || x.max != null) ? `<span class="pts">${x.score ?? '–'}/${x.max ?? '–'}</span>` : '';
  return `<div class="task${x.done ? ' done' : ''}" data-id="${x.id}">
    <button class="chk" data-act="toggle" aria-label="Готово">${x.done ? '✓' : ''}</button>
    <div class="tb">
      <div class="tt">${esc(x.title)}</div>
      <div class="meta"><span class="chip" style="background:${s.color}">${esc(s.short)}</span>${dueLabel(x)}${pts}</div>
    </div></div>`;
}

const section = (title, cls, list) =>
  list.length ? `<section class="sec ${cls}"><h2>${title} · ${list.length}</h2>${list.map(card).join('')}</section>` : '';

/* ---------- экран «Сегодня» ---------- */
function renderToday() {
  const t = today();
  const g = { over: [], today: [], soon: [], later: [], none: [] };
  state.tasks.filter(x => !x.done)
    .sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999') || a.created - b.created)
    .forEach(x => {
      if (!x.due) return g.none.push(x);
      const d = diffDays(x.due, t);
      (d < 0 ? g.over : d === 0 ? g.today : d <= 3 ? g.soon : g.later).push(x);
    });
  const done = state.tasks.filter(x => x.done).sort((a, b) => (b.doneAt || 0) - (a.doneAt || 0)).slice(0, 15);
  const openCount = state.tasks.length - state.tasks.filter(x => x.done).length;

  const d0 = new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
  const dateStr = d0.charAt(0).toUpperCase() + d0.slice(1);
  const stats = [
    g.over.length ? `<span class="stat bad">просрочено: ${g.over.length}</span>` : '',
    g.today.length ? `<span class="stat warn">на сегодня: ${g.today.length}</span>` : '',
    g.soon.length ? `<span class="stat">ближайшие 3 дня: ${g.soon.length}</span>` : '',
  ].join('');

  $('#screen').innerHTML = `
    <div class="head"><h1>${dateStr}</h1><div class="sub">Домашка на сегодня · <button class="upd" data-act="upd">проверить обновление</button> · сборка ${window.BUILD || 0}</div>
      <div class="stats">${stats}</div></div>
    ${openCount === 0 ? `<div class="empty"><b>Всё сдано 🎉</b>Добавь задание строкой внизу</div>` : ''}
    ${section('Просрочено', 'over', g.over)}
    ${section('Сегодня', 'today', g.today)}
    ${section('Ближайшие 3 дня', 'soon', g.soon)}
    ${section('Позже', 'later', g.later)}
    ${section('Без срока', 'none', g.none)}
    ${done.length ? `<details class="sec"><summary>Сделано · ${done.length}</summary>${done.map(card).join('')}</details>` : ''}`;
}

const STUBS = {
  week: ['Неделя', 'Задания по дням — следующий шаг'],
  points: ['Баллы', 'Баллы по предметам и синхронизация с дневником — позже'],
  grades: ['Оценки', 'Предварительные оценки и границы — позже'],
};
function renderStub(tab) {
  $('#screen').innerHTML = `<div class="head"><h1>${STUBS[tab][0]}</h1></div><div class="empty"><b>Скоро</b>${STUBS[tab][1]}</div>`;
}

/* ---------- навигация ---------- */
let tab = 'today';
function render() {
  document.querySelectorAll('#nav button').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
  $('#quick').hidden = tab !== 'today';
    ({ today: renderToday, points: renderPoints, grades: renderGrades }[tab] || (() => renderStub(tab)))();
}
$('#nav').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (b) { tab = b.dataset.tab; render(); window.scrollTo(0, 0); }
});

/* ---------- действия с заданиями ---------- */
$('#screen').addEventListener('click', e => {
  const el = e.target.closest('.task');
  if (!el) return;
  const id = el.dataset.id;
  if (e.target.closest('[data-act="toggle"]')) toggle(id); else openEditor(id);
});

function toggle(id) {
  const x = state.tasks.find(t => t.id === id);
  if (!x) return;
  x.done = !x.done;
  x.doneAt = x.done ? Date.now() : null;
  save(); render();
}

function openEditor(id) {
  const x = state.tasks.find(t => t.id === id);
  if (!x) return;
  const opts = ['<option value="">Без предмета</option>']
    .concat(state.subjects.map(s => `<option value="${s.id}"${s.id === x.subjectId ? ' selected' : ''}>${esc(s.name)}</option>`)).join('');
  $('#sheet').innerHTML = `<div class="panel">
    <h3>Задание</h3>
    <label>Название<input id="e-title" value="${esc(x.title)}"></label>
    <label>Предмет<select id="e-subj">${opts}</select></label>
    <div class="row2">
      <label>Выдано<input id="e-issued" type="date" value="${x.issued || ''}"></label>
      <label>Срок сдачи<input id="e-due" type="date" value="${x.due || ''}"></label>
    </div>
    <div class="row2">
      <label>Мои баллы<input id="e-score" type="number" step="any" inputmode="decimal" value="${x.score ?? ''}"></label>
      <label>Максимум<input id="e-max" type="number" step="any" inputmode="decimal" value="${x.max ?? ''}"></label>
    </div>
    <div class="btns">
      <button class="btn-del" id="e-del">Удалить</button>
      <button class="btn-x" id="e-x">Отмена</button>
      <button class="btn-save" id="e-ok">Сохранить</button>
    </div></div>`;
  $('#sheet').hidden = false;

  const num = v => (v === '' ? null : Number(v));
  $('#e-ok').onclick = () => {
    x.title = $('#e-title').value.trim() || x.title;
    x.subjectId = $('#e-subj').value || null;
    x.issued = $('#e-issued').value || x.issued;
    x.due = $('#e-due').value || null;
    x.score = num($('#e-score').value);
    x.max = num($('#e-max').value);
    save(); closeEditor(); render();
  };
  $('#e-del').onclick = () => {
    if (!confirm('Удалить задание?')) return;
    state.tasks = state.tasks.filter(t => t.id !== id);
    save(); closeEditor(); render();
  };
  $('#e-x').onclick = closeEditor;
}
function closeEditor() { $('#sheet').hidden = true; $('#sheet').innerHTML = ''; }
$('#sheet').addEventListener('click', e => { if (e.target.id === 'sheet') closeEditor(); });

/* ---------- быстрый ввод ---------- */
const qin = $('#qin');
qin.addEventListener('input', () => {
  const p = parseQuick(qin.value);
  if (!p) { $('#qprev').innerHTML = ''; return; }
  const s = subj(p.subjectId);
  $('#qprev').innerHTML =
    `<span class="chip" style="background:${s.color}">${esc(s.short)}</span>` +
    (p.due ? `<span class="chip warn">срок ${fmtShort(p.due)}</span>` : '');
});
$('#quick').addEventListener('submit', e => {
  e.preventDefault();
  const p = parseQuick(qin.value);
  if (!p) return;
  state.tasks.push({
    id: uid(), subjectId: p.subjectId, title: p.title,
    issued: today(), due: p.due, done: false, score: null, max: null,
    created: Date.now(),
  });
  save();
  qin.value = ''; $('#qprev').innerHTML = '';
  /* ---------- обновление приложения ---------- */
const REPO = 'lvannikov22/dz-tracker'; // замени на свой логин GitHub

async function checkUpdate() {
  const cur = Number(window.BUILD || 0);
  try {
    const r = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`);
    if (!r.ok) throw new Error('GitHub ответил ' + r.status);
    const rel = await r.json();
    const n = Number(String(rel.tag_name).replace(/\D/g, ''));
    const asset = (rel.assets || []).find(a => a.name.endsWith('.apk'));
    if (!asset || !(n > cur)) { alert(`У тебя последняя версия (сборка ${cur}).`); return; }
    if (confirm(`Есть новая сборка ${n} (у тебя ${cur}). Скачать?`)) location.href = asset.browser_download_url;
  } catch (e) {
    alert('Не удалось проверить обновление: ' + e.message);
  }
}
document.addEventListener('click', e => {
  if (e.target.closest('[data-act="upd"]')) checkUpdate();
});
  render();
});
/* ---------- расчёт баллов и оценок ---------- */
const fmtN = n => Math.round(n * 10) / 10;
const pct = (s, m) => (m > 0 && s != null ? (s / m) * 100 : null);

function myStats(subjectId) {
  let score = 0, max = 0, n = 0;
  state.tasks.forEach(t => {
    if (t.subjectId !== subjectId || t.score == null || !(t.max > 0)) return;
    score += t.score; max += t.max; n++;
  });
  return { score, max, n, pct: pct(score, max) };
}

function diaryStats(subjectId) {
  const d = state.diary[subjectId];
  return d ? { score: d.score, max: d.max, att: d.attendance, pct: pct(d.score, d.max) } : null;
}

function gradeFor(p) {
  if (p == null) return null;
  const g = state.grades;
  return p >= g[5] ? 5 : p >= g[4] ? 4 : p >= g[3] ? 3 : 2;
}

function subjectResult(subjectId) {
  const my = myStats(subjectId), di = diaryStats(subjectId);
  const a = my.pct, b = di ? di.pct : null;
  let best = null, source = null;
  if (a != null && (b == null || a >= b)) { best = a; source = 'мои баллы'; }
  else if (b != null) { best = b; source = 'дневник'; }
  return { my, di, pct: best, source, grade: gradeFor(best) };
}

const gradeBadge = g => `<span class="grade ${g ? 'g' + g : 'g0'}">${g ?? '—'}</span>`;
const bar = p => `<span class="bar"><i style="width:${Math.min(100, Math.max(0, p ?? 0))}%"></i></span>`;

/* ---------- экран «Баллы» ---------- */
function renderPoints() {
  const cards = state.subjects.map(s => {
    const r = subjectResult(s.id);
    const tasks = state.tasks
      .filter(t => t.subjectId === s.id && (t.score != null || t.max != null))
      .sort((a, b) => (b.due || b.issued || '').localeCompare(a.due || a.issued || ''));
    const myLine = r.my.n
      ? `мои: ${fmtN(r.my.score)} из ${fmtN(r.my.max)} · ${Math.round(r.my.pct)}%`
      : 'мои: пока нет баллов';
    const diLine = r.di
      ? `дневник: ${fmtN(r.di.score)} из ${fmtN(r.di.max)} · ${Math.round(r.di.pct)}%` +
        (r.di.att != null ? ` · посещаемость ${Math.round(r.di.att)}%` : '')
      : 'дневник: не подключён';
    const rows = tasks.length
      ? tasks.map(t => `<div class="srow"><span>${esc(t.title)}</span><b>${t.score ?? '–'}/${t.max ?? '–'}</b></div>`).join('')
      : '<div class="srow muted">Заданий с баллами пока нет</div>';
    return `<details class="subj"><summary>
      <span class="chip" style="background:${s.color}">${esc(s.short)}</span>${gradeBadge(r.grade)}
      <span class="sl">${myLine}</span><span class="sl">${diLine}</span>${bar(r.pct)}
    </summary>${rows}</details>`;
  }).join('');
  $('#screen').innerHTML = `
    <div class="head"><h1>Баллы</h1>
      <div class="sub">Баллы вносятся в карточке задания: нажми на задание</div></div>
    <div class="subjs">${diaryCard()}${cards}</div>`;
}

/* ---------- экран «Оценки» ---------- */
function renderGrades() {
  const g = state.grades;
  const rows = state.subjects.map(s => {
    const r = subjectResult(s.id);
    let info = 'пока нет баллов';
    if (r.pct != null) {
      info = `${r.source}: ${Math.round(r.pct)}%`;
      if (r.grade < 5) info += ` · до «${r.grade + 1}» ещё ${fmtN(g[r.grade + 1] - r.pct)}%`;
    }
    return `<div class="subj grow"><div class="gi">
      <span class="chip" style="background:${s.color}">${esc(s.short)}</span>
      <span class="sl">${info}</span></div>${gradeBadge(r.grade)}</div>`;
  }).join('');
  $('#screen').innerHTML = `
    <div class="head"><h1>Оценки</h1>
      <div class="sub">Предварительные, по большему из двух: дневник или мои баллы</div></div>
    <div class="subjs">${rows}</div>
    <section class="sec"><h2>Границы оценок, %</h2>
      <div class="bounds">
        <label>«2» от<input value="0" disabled></label>
        <label>«3» от<input id="b3" data-b type="number" inputmode="decimal" value="${g[3]}"></label>
        <label>«4» от<input id="b4" data-b type="number" inputmode="decimal" value="${g[4]}"></label>
        <label>«5» от<input id="b5" data-b type="number" inputmode="decimal" value="${g[5]}"></label>
      </div></section>`;
}

$('#screen').addEventListener('change', e => {
  if (!e.target.matches('[data-b]')) return;
  const v = { 3: +$('#b3').value, 4: +$('#b4').value, 5: +$('#b5').value };
  const ok = [3, 4, 5].every(k => v[k] >= 0 && v[k] <= 100) && v[3] < v[4] && v[4] < v[5];
  if (!ok) { alert('Границы должны идти по возрастанию, от 0 до 100'); renderGrades(); return; }
  state.grades = v; save(); renderGrades();
});
/* ---------- дневник колледжа ---------- */
const API = 'https://api.newlxp.ru/graphql';
const AUTH_KEY = 'dz.auth';
const loadAuth = () => { try { return JSON.parse(localStorage.getItem(AUTH_KEY)) || {}; } catch (e) { return {}; } };
let auth = loadAuth();
const saveAuth = () => localStorage.setItem(AUTH_KEY, JSON.stringify(auth));

const Q_SIGNIN = `query SignIn($input: SignInInput!) { signIn(input: $input) { accessToken refreshToken } }`;
const Q_ME = `query GetMe { getMe { id student { id mainFormsEducation { currentForm { organizationId } } suborganizations_V2 { suborganization { organizationId } } } } }`;
const Q_PERIODS = `query GetStudyPeriodsForStudentDisciplinesTable($input: GetStudyPeriodsForStudentInput!) { getStudyPeriodsForStudent(input: $input) { id name startDate endDate status archivedAt } }`;
const Q_TABLE = `query SearchStudentDisciplinesForDisciplinesTableWithPeriod($input: SearchStudentDisciplinesInput!, $studyPeriodEndDate: String) {
  searchStudentDisciplines(input: $input) {
    disciplineId
    discipline { id name maxScore }
    disciplineAttendance { percent }
    scoreForAnsweredTasks
    maxScoreForAnsweredTasks
    disciplineGrade(studyPeriodEndDate: $studyPeriodEndDate)
  }
}`;

async function gql(operationName, query, variables, withToken = true) {
  const headers = { 'Content-Type': 'application/json' };
  if (withToken && auth.access) headers.Authorization = 'Bearer ' + auth.access;
  const res = await fetch(API, { method: 'POST', headers, body: JSON.stringify({ operationName, query, variables }) });
  let json = null;
  try { json = await res.json(); } catch (e) { /* не JSON */ }
  if (json && json.errors && json.errors.length) {
    const err = new Error(json.errors[0].message || 'ошибка сервера');
    err.auth = /auth|token|unauthor|forbidden|jwt/i.test(JSON.stringify(json.errors[0]));
    throw err;
  }
  if (!res.ok || !json) {
    const err = new Error('HTTP ' + res.status);
    err.auth = res.status === 401 || res.status === 403;
    throw err;
  }
  return json.data;
}

async function syncDiary(setStatus) {
  setStatus('Получаю профиль…');
  const me = await gql('GetMe', Q_ME, {});
  const student = me.getMe && me.getMe.student;
  if (!student) throw new Error('в профиле не нашёл студента');
  const studentId = student.id;
  const cf = student.mainFormsEducation && student.mainFormsEducation.currentForm;
  const sub = (student.suborganizations_V2 || [])[0];
  const orgId = (cf && cf.organizationId) || (sub && sub.suborganization && sub.suborganization.organizationId);
  if (!orgId) throw new Error('не нашёл организацию в профиле');

  setStatus('Ищу текущий семестр…');
  const pd = await gql('GetStudyPeriodsForStudentDisciplinesTable', Q_PERIODS, { input: { studentId } });
  const now = Date.now();
  const periods = (pd.getStudyPeriodsForStudent || []).filter(p => !p.archivedAt);
  const period = periods.filter(p => p.status === 'STARTED').sort((a, b) => b.startDate.localeCompare(a.startDate))[0]
    || periods.find(p => Date.parse(p.startDate) <= now && now <= Date.parse(p.endDate));
  if (!period) throw new Error('не нашёл текущий семестр');

  setStatus('Загружаю баллы: ' + period.name + '…');
  const td = await gql('SearchStudentDisciplinesForDisciplinesTableWithPeriod', Q_TABLE, {
    input: { studentId, filters: { organizationIds: [orgId], studyPeriodId: period.id, withoutStudyPeriod: false, withAcademicDifference: false } },
    studyPeriodEndDate: period.endDate,
  });

  const list = td.searchStudentDisciplines || [];
  const diary = {}, added = [];
  list.forEach(x => {
    const name = x.discipline.name, n = norm(name);
    let s = state.subjects.find(t => t.diaryId === x.disciplineId)
      || state.subjects.find(t => t.dn && t.dn.some(k => n.includes(norm(k))));
    if (!s) {
      s = {
        id: 'x' + x.disciplineId.slice(0, 8), diaryId: x.disciplineId, extra: true, name,
        short: name.length > 22 ? name.slice(0, 21) + '…' : name,
        color: PALETTE_EXTRA[state.subjects.length % PALETTE_EXTRA.length],
        dn: [n], kw: [norm(name.split(/\s+/)[0])],
      };
      state.subjects.push(s); added.push(name);
    }
    diary[s.id] = {
      score: x.scoreForAnsweredTasks, max: x.maxScoreForAnsweredTasks, discMax: x.discipline.maxScore,
      attendance: x.disciplineAttendance ? x.disciplineAttendance.percent : null, grade: x.disciplineGrade, name,
    };
  });

  const matched = new Set(Object.keys(diary));
  if (matched.size) {
    state.visible = state.subjects.filter(s => !s.extra && matched.has(s.id)).map(s => s.id);
    state.subjects = state.subjects.filter(s => s.extra || matched.has(s.id));
  }
  state.diary = diary;
  state.diaryAt = Date.now();
  save();
  return { count: list.length, period: period.name, added };
}

const setStat = t => { const el = $('#dstat'); if (el) el.textContent = t; };

async function runSync() {
  try {
    const r = await syncDiary(setStat);
    renderPoints();
    alert(`Готово: ${r.count} дисциплин, ${r.period}` + (r.added.length ? `\nНовые предметы: ${r.added.join(', ')}` : ''));
  } catch (e) {
    if (e.auth) {
      auth = { email: auth.email }; saveAuth(); renderPoints();
      alert('Вход устарел, войди снова. Ответ сервера: ' + e.message);
    } else {
      setStat('Ошибка: ' + e.message);
      alert('Не удалось: ' + e.message);
    }
  }
}

function diaryCard() {
  const when = state.diaryAt
    ? new Date(state.diaryAt).toLocaleString('ru-RU', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })
    : null;
  if (auth.access) {
    return `<div class="subj dcard"><div class="sl">Дневник подключён${when ? ' · обновлено ' + when : ''}</div>
      <div class="btns2"><button class="mini" data-act="sync">Обновить баллы</button>
      <button class="mini ghost" data-act="logout">Выйти</button></div><div class="sl" id="dstat"></div></div>`;
  }
  return `<form class="subj dcard" id="diary-form" autocomplete="off">
    <div class="sl">Войти в дневник колледжа. Пароль нигде не сохраняется.</div>
    <input id="d-email" type="email" placeholder="Почта" value="${esc(auth.email || '')}">
    <input id="d-pass" type="password" placeholder="Пароль">
    <button class="mini" type="submit">Войти и загрузить баллы</button><div class="sl" id="dstat"></div></form>`;
}

$('#screen').addEventListener('submit', async e => {
  if (e.target.id !== 'diary-form') return;
  e.preventDefault();
  const email = $('#d-email').value.trim(), password = $('#d-pass').value;
  $('#d-pass').value = '';
  if (!email || !password) { setStat('Введи почту и пароль'); return; }
  setStat('Вхожу…');
  try {
    const d = await gql('SignIn', Q_SIGNIN, { input: { email, password } }, false);
    auth = { email, access: d.signIn.accessToken, refresh: d.signIn.refreshToken };
    saveAuth();
  } catch (err) { setStat('Не вошёл: ' + err.message); return; }
  await runSync();
});

$('#screen').addEventListener('click', e => {
  const b = e.target.closest('[data-act="sync"], [data-act="logout"]');
  if (!b) return;
  if (b.dataset.act === 'logout') { auth = { email: auth.email }; saveAuth(); renderPoints(); return; }
  b.disabled = true;
  runSync().finally(() => { b.disabled = false; });
});
render();
