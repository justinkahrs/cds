import { circularOffset, searchMatches, wrapIndex, casePose, surpriseDistance, spinProgress } from '../lib/carousel.mjs';

const root = document.querySelector<HTMLElement>('[data-collection]');
if (root) {
  const get = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
  const changer = get('disc-changer');
  const stage = get('carousel-stage');
  const grid = get('album-grid');
  const empty = get('empty-state');
  const search = get<HTMLInputElement>('catalog-search');
  const dial = get<HTMLButtonElement>('jog-dial');
  const cases = Array.from(root.querySelectorAll<HTMLButtonElement>('.jewel-case'));
  const cards = Array.from(grid.querySelectorAll<HTMLElement>('.album-card'));
  let filtered = [...cases];
  let selected = Number(changer.dataset.initialIndex) || 0;
  let view = location.hash === '#albums' ? 'grid' : 'changer';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const selectionCopy = root.querySelector<HTMLElement>('.selection-copy')!;
  let spinning = false;
  let frame = 0;
  let activeCase: HTMLButtonElement | undefined;
  let dragX = 0;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragging = false;
  let moved = false;
  let suppressClickUntil = 0;

  try {
    const saved = sessionStorage.getItem('cd-selected-album');
    const savedIndex = cases.findIndex((item) => item.dataset.path === saved);
    if (savedIndex >= 0) selected = savedIndex;
  } catch { /* Storage is optional in private browser contexts. */ }

  let position = selected;
  let destination = selected;
  const initialPosition = position;

  const showView = () => {
    changer.hidden = view !== 'changer' || !filtered.length;
    grid.hidden = view !== 'grid' || !filtered.length;
    empty.hidden = filtered.length > 0;
    for (const button of root.querySelectorAll<HTMLButtonElement>('[data-view]')) {
      button.setAttribute('aria-pressed', String(button.dataset.view === view));
    }
  };

  const renderScene = () => {
    filtered.forEach((item, index) => {
      const offset = circularOffset(index, position, filtered.length);
      const pose = casePose(offset, filtered.length);
      item.hidden = pose.opacity === 0;
      if (item.hidden) return;
      item.style.setProperty('--case-x', `${pose.x}px`);
      item.style.setProperty('--case-y', `${pose.y}px`);
      item.style.setProperty('--case-z', `${pose.z}px`);
      item.style.setProperty('--case-angle', `${pose.angle}deg`);
      item.style.setProperty('--case-brightness', String(pose.brightness));
      item.style.opacity = String(pose.opacity);
      item.style.zIndex = String(Math.round(1000 + pose.z));
      if (Math.abs(offset) <= 2) item.querySelector('img')?.setAttribute('loading', 'eager');
    });
    const rotation = position - initialPosition;
    get('drum-grooves').style.transform = `rotate(${rotation * 30}deg)`;
    dial.style.setProperty('--dial-rotation', `${rotation * 24}deg`);
    stage.dataset.position = String(position);
  };

  const renderSelection = () => {
    selected = wrapIndex(selected, filtered.length);
    const active = filtered[selected];
    if (active !== activeCase) {
      if (activeCase) { activeCase.tabIndex = -1; activeCase.setAttribute('aria-pressed', 'false'); }
      activeCase = active;
      if (active) { active.tabIndex = 0; active.setAttribute('aria-pressed', 'true'); }
      selectionCopy.scrollTop = 0;
    }
    if (active) {
      const data = active.dataset;
      const values: Record<string, string | undefined> = {
        'selected-slot': data.slot,
        'display-artist': data.artist,
        'selected-title': data.title,
        'selected-artist': data.artist,
        'selected-year': data.year,
        'selected-label': data.label,
        'carousel-position': `${String(selected + 1).padStart(3, '0')} / ${filtered.length}`,
      };
      for (const [id, text] of Object.entries(values)) get(id).textContent = text || '—';
      get('selected-slot').classList.toggle('multi-slot', (data.slot?.length || 0) > 5);
      get<HTMLAnchorElement>('selected-link').href = data.path!;
      get<HTMLAnchorElement>('selected-artist-link').href = data.artistPath || '/artists/';
      dial.setAttribute('aria-description', `${data.title} by ${data.artist}. Slot ${data.slot}.`);
      if (!spinning) {
        try { sessionStorage.setItem('cd-selected-album', data.path!); } catch { /* Optional persistence. */ }
      }
    }
    for (const id of ['previous-disc', 'next-disc', 'random-disc', 'jog-dial']) {
      get<HTMLButtonElement>(id).disabled = filtered.length < 2;
    }
    get<HTMLButtonElement>('random-disc').disabled = spinning || filtered.length < 2;
  };

  const setSpinning = (value: boolean) => {
    spinning = value;
    changer.classList.toggle('is-spinning', value);
    changer.setAttribute('aria-busy', String(value));
    selectionCopy.setAttribute('aria-live', value ? 'off' : 'polite');
    get('random-label').textContent = value ? 'Spinning…' : 'Surprise me';
  };

  const render = () => {
    renderScene();
    renderSelection();
    showView();
  };

  const stopMotion = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    setSpinning(false);
  };

  const settle = () => {
    stopMotion();
    position = destination;
    selected = wrapIndex(Math.round(destination), filtered.length);
    render();
  };

  const animateTo = (target: number, surprise = false) => {
    stopMotion();
    destination = target;
    if (reducedMotion.matches || document.hidden) { settle(); return; }
    const from = position;
    const distance = target - from;
    const duration = surprise ? Math.min(4800, 2800 + Math.abs(distance) * 10) : Math.min(700, 320 + Math.sqrt(Math.abs(distance)) * 55);
    const started = performance.now();
    setSpinning(surprise);
    renderSelection();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - started) / duration);
      const eased = surprise ? spinProgress(progress) : 1 - Math.pow(1 - progress, 3);
      position = from + distance * eased;
      if (surprise) {
        const nearest = wrapIndex(Math.round(position), filtered.length);
        if (nearest !== selected) { selected = nearest; renderSelection(); }
      }
      renderScene();
      if (progress < 1) frame = requestAnimationFrame(tick);
      else settle();
    };
    frame = requestAnimationFrame(tick);
  };

  const move = (amount: number) => {
    if (filtered.length < 2) return;
    const target = (spinning ? Math.round(position) : destination) + amount;
    selected = wrapIndex(target, filtered.length);
    animateTo(target);
  };

  for (const item of cases) {
    item.addEventListener('click', (event) => {
      if (performance.now() < suppressClickUntil) { event.preventDefault(); return; }
      const index = filtered.indexOf(item);
      if (index < 0) return;
      move(circularOffset(index, selected, filtered.length));
    });
    const img = item.querySelector('img');
    const fallback = () => { if (img) img.hidden = true; };
    img?.addEventListener('error', fallback);
    if (img?.complete && !img.naturalWidth) fallback();
  }

  get('previous-disc').addEventListener('click', () => move(-1));
  get('next-disc').addEventListener('click', () => move(1));
  get('random-disc').addEventListener('click', () => {
    if (spinning || filtered.length < 2) return;
    const start = Math.round(destination);
    const target = wrapIndex(start + 1 + Math.floor(Math.random() * (filtered.length - 1)), filtered.length);
    changer.dataset.spinTarget = filtered[target].dataset.path;
    // Preload the destination even if the high-speed middle of the spin skips its image.
    filtered[target].querySelector('img')?.setAttribute('loading', 'eager');
    animateTo(start + surpriseDistance(start, target, filtered.length), true);
  });
  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches && frame) settle(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && frame) settle(); });
  changer.addEventListener('keydown', (event) => {
    if (event.target instanceof HTMLInputElement) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      move(event.key === 'ArrowRight' ? 1 : -1);
      if ((event.target as HTMLElement).closest('.jewel-case')) stage.focus({ preventScroll: true });
    } else if (event.target === stage && event.key === 'Home') {
      event.preventDefault(); move(-selected);
    } else if (event.target === stage && event.key === 'End') {
      event.preventDefault(); move(filtered.length - 1 - selected);
    }
  });

  stage.addEventListener('pointerdown', (event) => {
    if (!event.isPrimary || event.button !== 0) return;
    dragging = true; moved = false;
    dragX = dragStartX = event.clientX; dragStartY = event.clientY;
  });
  stage.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    const distance = event.clientX - dragStartX;
    if (!moved && Math.abs(event.clientY - dragStartY) > Math.abs(distance) + 10) {
      dragging = false; return;
    }
    if (Math.abs(distance) > 8) {
      moved = true;
      stage.setPointerCapture(event.pointerId);
      stage.classList.add('is-dragging');
    }
    const steps = Math.trunc((dragX - event.clientX) / 52);
    if (steps) { move(steps); dragX -= steps * 52; }
  });
  const endDrag = () => {
    if (moved) suppressClickUntil = performance.now() + 250;
    dragging = false; stage.classList.remove('is-dragging');
  };
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);
  // Touch initially captures the child under the finger. Transferring capture
  // to the stage emits a bubbling loss on that child, not the end of our drag.
  stage.addEventListener('lostpointercapture', (event) => { if (event.target === stage) endDrag(); });
  stage.addEventListener('pointerleave', () => { if (!moved) dragging = false; });

  let wheelAt = 0;
  stage.addEventListener('wheel', (event) => {
    if (Math.abs(event.deltaX) < Math.abs(event.deltaY) || Math.abs(event.deltaX) < 8) return;
    event.preventDefault();
    if (performance.now() - wheelAt > 150) { move(Math.sign(event.deltaX)); wheelAt = performance.now(); }
  }, { passive: false });

  let dialAngle: number | null = null;
  let dialTravel = 0;
  let dialMoved = false;
  const angleAt = (event: PointerEvent) => {
    const rect = dial.getBoundingClientRect();
    return Math.atan2(event.clientY - rect.top - rect.height / 2, event.clientX - rect.left - rect.width / 2) * 180 / Math.PI;
  };
  dial.addEventListener('pointerdown', (event) => {
    if (!event.isPrimary || event.button !== 0) return;
    dialAngle = angleAt(event); dialTravel = 0; dialMoved = false;
    dial.setPointerCapture(event.pointerId);
  });
  dial.addEventListener('pointermove', (event) => {
    if (dialAngle === null) return;
    const angle = angleAt(event);
    const delta = ((angle - dialAngle + 540) % 360) - 180;
    dialTravel += delta; dialAngle = angle;
    if (Math.abs(dialTravel) > 20) {
      const steps = Math.trunc(dialTravel / 20);
      dialMoved = true; move(steps); dialTravel -= steps * 20;
    }
  });
  dial.addEventListener('pointerup', () => { dialAngle = null; });
  dial.addEventListener('pointercancel', () => { dialAngle = null; dialMoved = true; });
  dial.addEventListener('lostpointercapture', (event) => { if (event.target === dial) dialAngle = null; });
  dial.addEventListener('click', () => { if (!dialMoved) move(1); dialMoved = false; });

  const updateSearch = () => {
    const current = filtered[selected];
    stopMotion();
    const query = search.value;
    cases.forEach((item) => { item.hidden = true; });
    filtered = cases.filter((item) => searchMatches(item.dataset.search || '', query));
    for (const card of cards) card.parentElement!.hidden = !searchMatches(card.dataset.search || '', query);
    selected = Math.max(0, filtered.indexOf(current));
    position = destination = selected;
    get('result-count').textContent = `${filtered.length} ${filtered.length === 1 ? 'album' : 'albums'}${query.trim() ? ' found' : ' in the collection'}`;
    render();
  };
  search.addEventListener('input', updateSearch);
  get('clear-search').addEventListener('click', () => { search.value = ''; updateSearch(); search.focus(); });
  for (const button of root.querySelectorAll<HTMLButtonElement>('[data-view]')) {
    button.addEventListener('click', () => {
      if (frame) { destination = Math.round(position); settle(); }
      view = button.dataset.view!; showView();
    });
  }
  document.addEventListener('keydown', (event) => {
    const target = event.target as HTMLElement;
    if (event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey && !target.closest('input, textarea, [contenteditable]')) {
      event.preventDefault(); search.focus();
    }
  });
  window.addEventListener('hashchange', () => {
    if (location.hash === '#albums') {
      if (frame) { destination = Math.round(position); settle(); }
      view = 'grid'; showView();
    }
  });
  root.querySelectorAll<HTMLElement>('[data-enhanced]').forEach((item) => { item.hidden = false; });
  root.classList.add('is-enhanced');
  render();
}
