import { motos } from './motos.js';
import './style.css';

const app = document.querySelector('#app');
const marcas = [...new Set(motos.map((moto) => moto.marca))].sort((a, b) => a.localeCompare(b, 'es'));
const coloresMarca = {
  Aprilia: '#e34b3b',
  BMW: '#66a7dc',
  Ducati: '#d3433d',
  Honda: '#e4433d',
  Kawasaki: '#72bd59',
  KTM: '#f18735',
  Suzuki: '#6f9bd1',
  Triumph: '#d7d2c3',
  Yamaha: '#e94c45',
};

const leerFavoritos = () => {
  try {
    const guardados = JSON.parse(localStorage.getItem('speedmoto-favoritos') || '[]');
    return Array.isArray(guardados) ? guardados.filter((id) => motos.some((moto) => moto.id === id)) : [];
  } catch {
    return [];
  }
};

const state = {
  screen: 'home',
  detailId: null,
  query: '',
  brand: 'todas',
  range: 'todas',
  sort: 'potencia',
  favorites: leerFavoritos(),
  compareIds: [motos[0].id, motos[1].id],
};

const escapar = (valor) => String(valor).replace(/[&<>"']/g, (caracter) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
})[caracter]);

const moneda = (valor) => new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
}).format(valor);

const encontrarMoto = (id) => motos.find((moto) => moto.id === id);
const esFavorita = (id) => state.favorites.includes(id);
const estaEnComparador = (id) => state.compareIds.includes(id);

function crearTarjeta(moto) {
  const favorita = esFavorita(moto.id);
  const comparar = estaEnComparador(moto.id);
  const color = coloresMarca[moto.marca] || '#e6493d';

  return `
    <article class="bike-card" style="--bike-color: ${color}">
      <div class="bike-art" aria-label="Tarjeta gráfica de ${escapar(moto.marca)} ${escapar(moto.modelo)}">
        <span class="bike-art-index">SM / ${String(moto.anio).slice(-2)}</span>
        <span class="bike-art-brand">${escapar(moto.marca)}</span>
        <span class="bike-art-model">${escapar(moto.modelo)}</span>
        <span class="bike-art-cc">${moto.cilindrada}<small> CC</small></span>
      </div>
      <div class="bike-card-body">
        <div class="bike-card-title">
          <div>
            <p class="eyebrow">${escapar(moto.marca)} · ${moto.anio}</p>
            <h3>${escapar(moto.modelo)}</h3>
          </div>
          <button class="icon-button favorite-button ${favorita ? 'is-favorite' : ''}" data-favorite="${moto.id}" aria-label="${favorita ? 'Quitar de' : 'Añadir a'} favoritos" aria-pressed="${favorita}" title="${favorita ? 'Quitar de favoritos' : 'Añadir a favoritos'}">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/></svg>
          </button>
        </div>
        <div class="bike-stats">
          <span><strong>${moto.potencia}</strong><small>HP</small></span>
          <span><strong>${moto.velocidadMaxima}</strong><small>KM/H</small></span>
          <span><strong>${moto.peso}</strong><small>KG</small></span>
        </div>
        <div class="bike-card-bottom">
          <span class="bike-price">${moneda(moto.precio)}</span>
          <button class="text-button" data-detail="${moto.id}">Ver ficha <span aria-hidden="true">↗</span></button>
        </div>
        <button class="compare-toggle ${comparar ? 'is-selected' : ''}" data-compare="${moto.id}" aria-pressed="${comparar}">
          <span aria-hidden="true">${comparar ? '−' : '+'}</span>${comparar ? 'Quitar del comparador' : 'Añadir a comparar'}
        </button>
      </div>
    </article>`;
}

function filtrarMotos() {
  let resultado = motos.filter((moto) => {
    const texto = `${moto.marca} ${moto.modelo}`.toLocaleLowerCase('es');
    const coincideTexto = texto.includes(state.query.trim().toLocaleLowerCase('es'));
    const coincideMarca = state.brand === 'todas' || moto.marca === state.brand;
    const coincideRango = state.range === 'todas'
      || (state.range === 'hasta400' && moto.cilindrada <= 400)
      || (state.range === '400a800' && moto.cilindrada > 400 && moto.cilindrada <= 800)
      || (state.range === 'mas800' && moto.cilindrada > 800);
    const coincideFavorito = state.screen !== 'favorites' || esFavorita(moto.id);
    return coincideTexto && coincideMarca && coincideRango && coincideFavorito;
  });

  const propiedades = { potencia: 'potencia', velocidad: 'velocidadMaxima', precio: 'precio' };
  resultado = [...resultado].sort((a, b) => b[propiedades[state.sort]] - a[propiedades[state.sort]]);
  return resultado;
}

function filtrosCatalogo() {
  return `
    <section class="filter-panel" aria-label="Filtros del catálogo">
      <label class="search-field">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16 16 4 4"/></svg>
        <input id="search-input" type="search" value="${escapar(state.query)}" placeholder="Buscar modelo o marca" autocomplete="off" />
        <kbd>⌕</kbd>
      </label>
      <div class="filter-row">
        <label class="select-field">
          <span>Marca</span>
          <select id="brand-filter">
            <option value="todas" ${state.brand === 'todas' ? 'selected' : ''}>Todas</option>
            ${marcas.map((marca) => `<option value="${escapar(marca)}" ${state.brand === marca ? 'selected' : ''}>${escapar(marca)}</option>`).join('')}
          </select>
        </label>
        <label class="select-field sort-field">
          <span>Ordenar por</span>
          <select id="sort-filter">
            <option value="potencia" ${state.sort === 'potencia' ? 'selected' : ''}>Potencia</option>
            <option value="velocidad" ${state.sort === 'velocidad' ? 'selected' : ''}>Velocidad</option>
            <option value="precio" ${state.sort === 'precio' ? 'selected' : ''}>Precio</option>
          </select>
        </label>
      </div>
      <div class="range-row" role="group" aria-label="Filtrar por cilindrada">
        <span class="range-label">Cilindrada</span>
        <div class="range-options">
          <button data-range="todas" class="range-chip ${state.range === 'todas' ? 'active' : ''}" aria-pressed="${state.range === 'todas'}">Todas</button>
          <button data-range="hasta400" class="range-chip ${state.range === 'hasta400' ? 'active' : ''}" aria-pressed="${state.range === 'hasta400'}">Hasta 400</button>
          <button data-range="400a800" class="range-chip ${state.range === '400a800' ? 'active' : ''}" aria-pressed="${state.range === '400a800'}">400–800</button>
          <button data-range="mas800" class="range-chip ${state.range === 'mas800' ? 'active' : ''}" aria-pressed="${state.range === 'mas800'}">+800</button>
        </div>
      </div>
    </section>`;
}

function pantallaCatalogo(esFavoritos = false) {
  const lista = filtrarMotos();
  const titulo = esFavoritos ? 'Mis favoritas' : 'Catálogo deportivo';
  const subtitulo = esFavoritos ? 'Tu selección personal.' : 'Máquinas diseñadas para ir más allá.';
  const tarjetas = lista.length
    ? `<div class="bike-grid">${lista.map(crearTarjeta).join('')}</div>`
    : `<div class="empty-state"><span class="empty-mark">${esFavoritos ? '♡' : '⌕'}</span><h2>${esFavoritos ? 'Todavía no tienes favoritas' : 'No encontramos resultados'}</h2><p>${esFavoritos ? 'Guarda una moto con el corazón para verla aquí.' : 'Prueba otra búsqueda o ajusta los filtros.'}</p>${esFavoritos ? '' : '<button class="secondary-button" data-reset-filters>Limpiar filtros</button>'}</div>`;

  return `
    <header class="topbar">
      <a class="wordmark" href="#inicio" data-screen="home" aria-label="SpeedMoto, inicio"><span class="wordmark-mark">S</span><span>SPEED<span class="wordmark-accent">MOTO</span></span></a>
      <span class="topbar-note">MOTO / INDEX <i></i></span>
    </header>
    ${!esFavoritos ? `
      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow"><span class="live-dot"></span> ARCHIVO DE MOTOS DEPORTIVAS</p>
          <h1>Encuentra tu<br /><em>siguiente</em> máquina.</h1>
          <p class="hero-description">Doce máquinas. Tres cifras que importan. La próxima historia empieza aquí.</p>
          <a class="hero-link" href="#catalogo">EXPLORAR CATÁLOGO <span aria-hidden="true">↓</span></a>
        </div>
        <div class="hero-graphic" aria-hidden="true">
          <div class="graphic-ring ring-one"></div><div class="graphic-ring ring-two"></div>
          <div class="graphic-cross">SM<br />24</div>
          <div class="graphic-slash"></div>
          <span class="graphic-caption">FULL THROTTLE<br />EST. 2024</span>
          <span class="graphic-number">01</span>
        </div>
      </section>` : ''}
    <main class="catalog-section" id="catalogo">
      <div class="section-heading">
        <div><p class="eyebrow">${esFavoritos ? 'TU GARAJE' : 'LA COLECCIÓN'}</p><h2>${titulo}</h2><p class="section-subtitle">${subtitulo}</p></div>
        <span class="result-count">${String(lista.length).padStart(2, '0')} <small>MODELOS</small></span>
      </div>
      ${filtrosCatalogo()}
      ${tarjetas}
    </main>
    ${piePagina()}`;
}

function detalleMoto(moto) {
  const favorita = esFavorita(moto.id);
  const color = coloresMarca[moto.marca] || '#e6493d';
  const especificaciones = [
    ['Cilindrada', `${moto.cilindrada} cc`],
    ['Potencia', `${moto.potencia} hp`],
    ['Velocidad máxima', `${moto.velocidadMaxima} km/h`],
    ['Peso', `${moto.peso} kg`],
    ['Año', String(moto.anio)],
    ['Precio aproximado', moneda(moto.precio)],
  ];

  return `
    <header class="topbar detail-topbar">
      <button class="back-button" data-back><span aria-hidden="true">←</span> Catálogo</button>
      <a class="wordmark" href="#inicio" data-screen="home"><span class="wordmark-mark">S</span><span>SPEED<span class="wordmark-accent">MOTO</span></span></a>
      <span class="topbar-note">FICHA TÉCNICA <i></i></span>
    </header>
    <main class="detail-page" style="--bike-color: ${color}">
      <div class="detail-art">
        <span class="eyebrow">${escapar(moto.marca)} / ${moto.anio}</span>
        <span class="detail-art-cc">${moto.cilindrada}<small> CC</small></span>
        <p class="detail-art-model">${escapar(moto.modelo)}</p>
        <p class="detail-art-tag">SPORT / ROAD / TRACK</p>
      </div>
      <div class="detail-content">
        <div class="detail-heading">
          <div><p class="eyebrow">${escapar(moto.marca)} · MODELO ${moto.anio}</p><h1>${escapar(moto.modelo)}</h1></div>
          <button class="icon-button favorite-button large ${favorita ? 'is-favorite' : ''}" data-favorite="${moto.id}" aria-label="${favorita ? 'Quitar de' : 'Añadir a'} favoritos" aria-pressed="${favorita}">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/></svg>
          </button>
        </div>
        <p class="detail-description">${escapar(moto.descripcion)}</p>
        <div class="spec-grid">${especificaciones.map(([etiqueta, valor]) => `<div class="spec-cell"><span>${etiqueta}</span><strong>${valor}</strong></div>`).join('')}</div>
        <button class="primary-button detail-compare ${estaEnComparador(moto.id) ? 'is-selected' : ''}" data-compare="${moto.id}">${estaEnComparador(moto.id) ? 'Quitar del comparador' : 'Añadir al comparador'} <span aria-hidden="true">↗</span></button>
      </div>
    </main>
    ${piePagina()}`;
}

function opcionesComparador(seleccionado, opuesto) {
  const opcionVacia = `<option value="" ${!seleccionado ? 'selected' : ''} disabled>Elige una moto</option>`;
  return opcionVacia + motos.map((moto) => `<option value="${moto.id}" ${moto.id === seleccionado ? 'selected' : ''} ${moto.id === opuesto ? 'disabled' : ''}>${escapar(moto.marca)} ${escapar(moto.modelo)}</option>`).join('');
}

function pantallaComparar() {
  const idA = state.compareIds[0];
  const idB = state.compareIds[1];
  const motoA = encontrarMoto(idA);
  const motoB = encontrarMoto(idB);
  const filas = [
    { etiqueta: 'Cilindrada', clave: 'cilindrada', unidad: 'cc' },
    { etiqueta: 'Potencia', clave: 'potencia', unidad: 'hp' },
    { etiqueta: 'Velocidad máxima', clave: 'velocidadMaxima', unidad: 'km/h' },
    { etiqueta: 'Peso', clave: 'peso', unidad: 'kg', menorEsMejor: true },
    { etiqueta: 'Año', clave: 'anio', unidad: '' },
    { etiqueta: 'Precio aprox.', clave: 'precio', formato: moneda, menorEsMejor: true },
  ];

  return `
    <header class="topbar"><a class="wordmark" href="#inicio" data-screen="home" aria-label="SpeedMoto, inicio"><span class="wordmark-mark">S</span><span>SPEED<span class="wordmark-accent">MOTO</span></span></a><span class="topbar-note">COMPARADOR <i></i></span></header>
    <main class="compare-page">
      <div class="section-heading"><div><p class="eyebrow">CARA A CARA</p><h1>Compara máquinas.</h1><p class="section-subtitle">Elige dos modelos y deja que hablen las cifras.</p></div><span class="compare-index">SM / 02</span></div>
      <section class="compare-selectors" aria-label="Seleccionar motos">
        <label class="compare-select"><span>MOTO 01</span><select data-compare-select="0">${opcionesComparador(idA, idB)}</select></label>
        <span class="versus">VS</span>
        <label class="compare-select"><span>MOTO 02</span><select data-compare-select="1">${opcionesComparador(idB, idA)}</select></label>
      </section>
      <div class="compare-legend"><span><i></i> Ventaja relativa</span><span>Menor peso y precio son mejores.</span></div>
      ${motoA && motoB ? `<div class="comparison-table-wrap"><table class="comparison-table">
        <thead><tr><th>ESPECIFICACIÓN</th><th>${escapar(motoA.marca)}<strong>${escapar(motoA.modelo)}</strong></th><th>${escapar(motoB.marca)}<strong>${escapar(motoB.modelo)}</strong></th></tr></thead>
        <tbody>${filas.map((fila) => {
          const valorA = motoA[fila.clave];
          const valorB = motoB[fila.clave];
          const ganaA = fila.menorEsMejor ? valorA < valorB : valorA > valorB;
          const ganaB = fila.menorEsMejor ? valorB < valorA : valorB > valorA;
          const mostrar = (valor) => fila.formato ? fila.formato(valor) : `${valor.toLocaleString('es-ES')}${fila.unidad ? ` ${fila.unidad}` : ''}`;
          return `<tr><th scope="row">${fila.etiqueta}</th><td class="${ganaA ? 'winner' : ''}">${mostrar(valorA)}${ganaA ? '<span class="winner-mark" aria-label="ventaja">↑</span>' : ''}</td><td class="${ganaB ? 'winner' : ''}">${mostrar(valorB)}${ganaB ? '<span class="winner-mark" aria-label="ventaja">↑</span>' : ''}</td></tr>`;
        }).join('')}</tbody>
      </table></div>` : '<div class="empty-state compare-empty"><span class="empty-mark">VS</span><h2>Falta una máquina</h2><p>Elige dos modelos distintos para ver sus cifras lado a lado.</p></div>'}
    </main>
    ${piePagina()}`;
}

function piePagina() {
  return '<footer class="site-footer"><span>SPEEDMOTO <span class="wordmark-accent">/</span> CATÁLOGO INDEPENDIENTE</span><span>ESPECIFICACIONES Y PRECIOS APROXIMADOS</span></footer>';
}

function navegacion() {
  return `
    <nav class="bottom-nav" aria-label="Navegación principal">
      <button data-screen="home" class="nav-item ${state.screen === 'home' || state.screen === 'detail' ? 'active' : ''}" aria-current="${state.screen === 'home' || state.screen === 'detail' ? 'page' : 'false'}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-6v-7h-4v7H4a1 1 0 0 1-1-1Z"/></svg><span>Inicio</span></button>
      <button data-screen="favorites" class="nav-item ${state.screen === 'favorites' ? 'active' : ''}" aria-current="${state.screen === 'favorites' ? 'page' : 'false'}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/></svg><span>Favoritos</span><b class="nav-count">${state.favorites.length || ''}</b></button>
      <button data-screen="compare" class="nav-item ${state.screen === 'compare' ? 'active' : ''}" aria-current="${state.screen === 'compare' ? 'page' : 'false'}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3v18M16 3v18M3 8h18M3 16h18"/></svg><span>Comparar</span><b class="nav-count">${state.compareIds.filter(Boolean).length || ''}</b></button>
    </nav>`;
}

function render() {
  if (state.screen === 'detail') {
    const moto = encontrarMoto(state.detailId);
    app.innerHTML = `${detalleMoto(moto)}${navegacion()}`;
    return;
  }
  const contenido = state.screen === 'favorites'
    ? pantallaCatalogo(true)
    : state.screen === 'compare'
      ? pantallaComparar()
      : pantallaCatalogo();
  app.innerHTML = `${contenido}${navegacion()}`;
}

function alternarFavorito(id) {
  state.favorites = esFavorita(id)
    ? state.favorites.filter((favorito) => favorito !== id)
    : [...state.favorites, id];
  try {
    localStorage.setItem('speedmoto-favoritos', JSON.stringify(state.favorites));
  } catch {
    // La app sigue siendo utilizable aunque el navegador bloquee el almacenamiento.
  }
  render();
}

function alternarComparacion(id) {
  const indiceActual = state.compareIds.indexOf(id);
  if (indiceActual !== -1) {
    state.compareIds[indiceActual] = null;
  } else {
    const indiceVacio = state.compareIds.findIndex((seleccionado) => !seleccionado);
    state.compareIds[indiceVacio === -1 ? 1 : indiceVacio] = id;
  }
  render();
}

app.addEventListener('click', (evento) => {
  const objetivo = evento.target.closest('button, a');
  if (!objetivo) return;

  if (objetivo.matches('[data-screen]')) {
    evento.preventDefault();
    state.screen = objetivo.dataset.screen;
    state.detailId = null;
    render();
  } else if (objetivo.matches('[data-favorite]')) {
    alternarFavorito(objetivo.dataset.favorite);
  } else if (objetivo.matches('[data-detail]')) {
    state.detailId = objetivo.dataset.detail;
    state.screen = 'detail';
    render();
    window.scrollTo(0, 0);
  } else if (objetivo.matches('[data-back]')) {
    state.screen = 'home';
    state.detailId = null;
    render();
  } else if (objetivo.matches('[data-range]')) {
    state.range = objetivo.dataset.range;
    render();
  } else if (objetivo.matches('[data-compare]')) {
    alternarComparacion(objetivo.dataset.compare);
  } else if (objetivo.matches('[data-reset-filters]')) {
    state.query = '';
    state.brand = 'todas';
    state.range = 'todas';
    render();
  }
});

app.addEventListener('input', (evento) => {
  if (evento.target.id !== 'search-input') return;
  state.query = evento.target.value;
  const cursor = evento.target.selectionStart;
  render();
  const nuevaBusqueda = app.querySelector('#search-input');
  nuevaBusqueda.focus();
  nuevaBusqueda.setSelectionRange(cursor, cursor);
});

app.addEventListener('change', (evento) => {
  if (evento.target.id === 'brand-filter') {
    state.brand = evento.target.value;
    render();
  } else if (evento.target.id === 'sort-filter') {
    state.sort = evento.target.value;
    render();
  } else if (evento.target.matches('[data-compare-select]')) {
    const indice = Number(evento.target.dataset.compareSelect);
    state.compareIds[indice] = evento.target.value;
    render();
  }
});

render();
