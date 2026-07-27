/**
 * Archivo principal: orquesta toda la aplicación
 */
import { ProjectAnalyzer } from './analyzer.js';
import { renderTree } from './tree.js';
import { displayJson, copyJson, downloadJson } from './json.js';
import { renderCharts } from './charts.js';
import { formatBytes } from './utils.js';
import { SmartAnalyzer } from './smartAnalyzer.js';

// ====== REFERENCIAS DOM ======
const fileInput = document.getElementById('fileInput');
const btnSelect = document.getElementById('btnSelectZip');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const progressLabel = document.getElementById('progressLabel');
const progressPercent = document.getElementById('progressPercent');
const progressTime = document.getElementById('progressTime');

const fileNameEl = document.getElementById('fileName');
const fileSizeEl = document.getElementById('fileSize');
const fileCountEl = document.getElementById('fileCount');
const folderCountEl = document.getElementById('folderCount');

const fileTableBody = document.getElementById('fileTableBody');
const fileSearch = document.getElementById('fileSearch');
const filterLanguage = document.getElementById('filterLanguage');
const filterExtension = document.getElementById('filterExtension');
const filterType = document.getElementById('filterType');

const treeContainer = document.getElementById('treeContainer');
const jsonDisplay = document.getElementById('jsonDisplay');
const summaryContent = document.getElementById('summaryContent');
const securityContent = document.getElementById('securityContent');
const smartAnalysisContent = document.getElementById('smartAnalysisContent');

// ====== ESTADO ======
let currentAnalysis = null;
let currentSmartAnalysis = null;
let currentFileList = [];
let sortColumn = 'name';
let sortAsc = true;
const smartAnalyzer = new SmartAnalyzer();

// ====== TOAST ======
const toastEl = document.getElementById('liveToast');
const toastMessage = document.getElementById('toastMessage');
const toast = new bootstrap.Toast(toastEl, { delay: 3000 });

function showToast(msg, type = 'info') {
    toastMessage.textContent = msg;
    toast.show();
}

// ====== SELECCIÓN DE ARCHIVO ======
btnSelect.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith('.zip')) {
        showToast('Por favor selecciona un archivo ZIP', 'warning');
        return;
    }
    await analyzeZip(file);
    fileInput.value = ''; // permitir re-seleccionar el mismo
});

// ====== DRAG & DROP ======
document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].name.endsWith('.zip')) {
        analyzeZip(files[0]);
    } else {
        showToast('Solo se aceptan archivos ZIP', 'warning');
    }
});

// ====== ANÁLISIS ======
async function analyzeZip(file) {
    // Mostrar progreso
    progressContainer.style.display = 'block';
    updateProgress(0, 'Iniciando análisis...');

    const analyzer = new ProjectAnalyzer();

    // Simular progreso real (JSZip no da progreso, pero podemos estimar)
    const startTime = Date.now();

    try {
        const result = await analyzer.analyze(file);

        // Capa 2: Intelligent Analysis Engine.
        // Recibe el JSON base (sin tocarlo) y devuelve una copia ENRIQUECIDA:
        // conserva metadata/statistics/languages/frameworks/dependencies/
        // security/entryPoints/analysis/fileList/structure originales y
        // agrega summary, components, recommendations, quality, y amplía
        // frameworks/security/entryPoints/analysis. Este objeto enriquecido
        // es el que se muestra en la pestaña JSON (superset, no reemplazo).
        const enrichedResult = smartAnalyzer.enrich(result);
        currentAnalysis = enrichedResult;
        currentSmartAnalysis = enrichedResult;
        currentFileList = enrichedResult.fileList || [];

        // Actualizar UI (paneles originales, funcionamiento sin cambios)
        updateSummary(enrichedResult);
        updateFileTable(currentFileList);
        populateFilters(currentFileList);
        renderTree(treeContainer, enrichedResult.structure);
        displayJson(enrichedResult, jsonDisplay, false);
        renderCharts(enrichedResult);
        updateSecurity(enrichedResult.security);

        // Nuevo panel: Smart Analysis
        renderSmartAnalysisTab(enrichedResult);

        // Ocultar progreso
        progressContainer.style.display = 'none';

        showToast('Análisis completado exitosamente', 'success');

        // Guardar en variable global para otros módulos
        window.__analysisResult = result;
        window.__smartAnalysisResult = enrichedResult;

    } catch (error) {
        console.error(error);
        showToast('Error al analizar el archivo: ' + error.message, 'danger');
        progressContainer.style.display = 'none';
    }
}

function updateProgress(percent, label) {
    progressBar.style.width = percent + '%';
    progressPercent.textContent = percent + '%';
    progressLabel.textContent = label;
}

// ====== ACTUALIZAR RESUMEN ======
function updateSummary(data) {
    const meta = data.metadata;
    const stats = data.statistics;

    fileNameEl.textContent = meta.fileName || '—';
    fileSizeEl.textContent = meta.fileSizeFormatted || '—';
    fileCountEl.textContent = stats.totalFiles ?? '—';
    folderCountEl.textContent = stats.totalFolders ?? '—';

    // Resumen detallado
    let html = `
        <div class="row g-3">
            <div class="col-md-6">
                <h6 class="text-secondary">Frameworks detectados</h6>
                <p>${data.frameworks.length ? data.frameworks.join(', ') : 'Ninguno'}</p>
                <h6 class="text-secondary mt-3">Puntos de entrada</h6>
                <p>${data.entryPoints.length ? data.entryPoints.join('<br>') : 'No detectados'}</p>
                <h6 class="text-secondary mt-3">Tipo de proyecto</h6>
                <p>${data.analysis.projectType}</p>
                <h6 class="text-secondary mt-3">Arquitectura</h6>
                <p>${data.analysis.architecture}</p>
            </div>
            <div class="col-md-6">
                <h6 class="text-secondary">Dependencias (${data.dependencies.length})</h6>
                ${data.dependencies.length ? `<ul class="list-unstyled small">${data.dependencies.slice(0, 10).map(d => `<li>${d.name} ${d.version} (${d.manager})</li>`).join('')}${data.dependencies.length > 10 ? `<li>... y ${data.dependencies.length - 10} más</li>` : ''}</ul>` : '<p>Ninguna</p>'}
                <h6 class="text-secondary mt-3">Líneas totales</h6>
                <p>${stats.totalLines?.toLocaleString() || 0}</p>
                <h6 class="text-secondary mt-3">Archivo más grande</h6>
                <p>${stats.largestFile ? `${stats.largestFile.name} (${stats.largestFile.sizeFormatted})` : '—'}</p>
            </div>
        </div>
    `;
    summaryContent.innerHTML = html;
}

// ====== TABLA DE ARCHIVOS ======
function updateFileTable(files) {
    const search = fileSearch.value.toLowerCase();
    const langFilter = filterLanguage.value;
    const extFilter = filterExtension.value;
    const typeFilter = filterType.value;

    let filtered = files.filter(f => {
        const nameMatch = f.name.toLowerCase().includes(search) || f.path.toLowerCase().includes(search);
        const langMatch = !langFilter || f.language === langFilter;
        const extMatch = !extFilter || f.extension === extFilter;
        const typeMatch = !typeFilter || f.type === typeFilter;
        return nameMatch && langMatch && extMatch && typeMatch;
    });

    // Ordenar
    filtered.sort((a, b) => {
        let valA = a[sortColumn] || '';
        let valB = b[sortColumn] || '';
        if (sortColumn === 'size') {
            valA = a.size || 0;
            valB = b.size || 0;
            return sortAsc ? valA - valB : valB - valA;
        }
        valA = valA.toString().toLowerCase();
        valB = valB.toString().toLowerCase();
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

    if (filtered.length === 0) {
        fileTableBody.innerHTML = '<tr><td colspan="7" class="text-secondary">No hay archivos que coincidan</td></tr>';
        return;
    }

    let html = '';
    for (const f of filtered) {
        html += `<tr>
            <td><span class="text-light">${f.name}</span></td>
            <td class="text-secondary" style="font-size:0.8rem;">${f.path}</td>
            <td><span class="badge bg-secondary">${f.extension || '—'}</span></td>
            <td>${formatBytes(f.size)}</td>
            <td>${f.lines || 0}</td>
            <td><span class="badge bg-info text-dark">${f.language}</span></td>
            <td><span class="badge bg-secondary">${f.type}</span></td>
        </tr>`;
    }
    fileTableBody.innerHTML = html;
}

function populateFilters(files) {
    // Lenguajes
    const langs = new Set(files.map(f => f.language).filter(Boolean));
    filterLanguage.innerHTML = '<option value="">Todos los lenguajes</option>' +
        Array.from(langs).sort().map(l => `<option value="${l}">${l}</option>`).join('');

    // Extensiones
    const exts = new Set(files.map(f => f.extension).filter(Boolean));
    filterExtension.innerHTML = '<option value="">Todas las extensiones</option>' +
        Array.from(exts).sort().map(e => `<option value="${e}">${e}</option>`).join('');
}

// ====== EVENTOS DE FILTRO Y ORDEN ======
fileSearch.addEventListener('input', () => updateFileTable(currentFileList));
filterLanguage.addEventListener('change', () => updateFileTable(currentFileList));
filterExtension.addEventListener('change', () => updateFileTable(currentFileList));
filterType.addEventListener('change', () => updateFileTable(currentFileList));

document.querySelectorAll('#fileTable th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
        const col = th.dataset.sort;
        if (sortColumn === col) {
            sortAsc = !sortAsc;
        } else {
            sortColumn = col;
            sortAsc = true;
        }
        updateFileTable(currentFileList);
    });
});

// ====== BOTONES JSON ======
document.getElementById('btnCopyJson').addEventListener('click', () => copyJson(jsonDisplay));
document.getElementById('btnDownloadJson').addEventListener('click', downloadJson);
document.getElementById('btnMinifyJson').addEventListener('click', () => {
    if (currentAnalysis) {
        const isMin = jsonDisplay.querySelector('code').textContent.includes('\n');
        displayJson(currentAnalysis, jsonDisplay, isMin);
    }
});

// ====== SEGURIDAD ======
function updateSecurity(sec) {
    let html = '<div class="row g-3">';
    html += `<div class="col-md-6"><h6 class="text-secondary">Archivos .env</h6><ul class="list-unstyled">${sec.envFiles.length ? sec.envFiles.map(f => `<li>${f}</li>`).join('') : '<li>Ninguno</li>'}</ul></div>`;
    html += `<div class="col-md-6"><h6 class="text-secondary">Certificados</h6><ul class="list-unstyled">${sec.certs.length ? sec.certs.map(f => `<li>${f}</li>`).join('') : '<li>Ninguno</li>'}</ul></div>`;
    html += `<div class="col-md-6"><h6 class="text-secondary">Llaves privadas</h6><ul class="list-unstyled">${sec.privateKeys.length ? sec.privateKeys.map(f => `<li>${f}</li>`).join('') : '<li>Ninguna</li>'}</ul></div>`;
    html += `<div class="col-md-6"><h6 class="text-secondary">Archivos ocultos</h6><ul class="list-unstyled">${sec.hiddenFiles.length ? sec.hiddenFiles.map(f => `<li>${f}</li>`).join('') : '<li>Ninguno</li>'}</ul></div>`;
    html += `<div class="col-md-6"><h6 class="text-secondary">Vendor</h6><p>${sec.vendor ? '✅ Detectado' : '❌ No detectado'}</p></div>`;
    html += `<div class="col-md-6"><h6 class="text-secondary">node_modules</h6><p>${sec.nodeModules ? '✅ Detectado' : '❌ No detectado'}</p></div>`;
    html += `<div class="col-md-12"><h6 class="text-secondary">Archivos sospechosos</h6><ul class="list-unstyled">${sec.suspicious.length ? sec.suspicious.map(f => `<li class="text-warning">${f}</li>`).join('') : '<li>Ninguno</li>'}</ul></div>`;
    html += '</div>';
    securityContent.innerHTML = html;
}

// ====== SMART ANALYSIS (Intelligent Analysis Engine) ======
function severityBadge(sev) {
    const map = { critical: 'bg-danger', warning: 'bg-warning text-dark', info: 'bg-info text-dark' };
    const label = { critical: 'Crítico', warning: 'Aviso', info: 'Info' };
    return `<span class="badge ${map[sev] || 'bg-secondary'}">${label[sev] || sev}</span>`;
}

function riskBadge(level) {
    const map = { 'Bajo': 'bg-success', 'Medio': 'bg-warning text-dark', 'Alto': 'bg-danger', 'Crítico': 'bg-danger' };
    return `<span class="badge ${map[level] || 'bg-secondary'}">${level}</span>`;
}

function qualityGaugeSvg(score) {
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const color = score >= 70 ? '#198754' : score >= 40 ? '#ffc107' : '#dc3545';
    return `
    <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r="${radius}" fill="none" stroke="#334155" stroke-width="12" />
        <circle cx="70" cy="70" r="${radius}" fill="none" stroke="${color}" stroke-width="12"
            stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
            stroke-linecap="round" transform="rotate(-90 70 70)" />
        <text x="70" y="76" text-anchor="middle" font-size="28" font-weight="700" fill="#e2e8f0">${score}</text>
    </svg>`;
}

function renderSmartAnalysisTab(data) {
    const s = data.summary;
    const arch = data.analysis;
    const quality = data.quality;
    const sec = data.security;
    const recs = data.recommendations || [];
    const deps = data.dependencies || [];
    const componentsDetected = Object.entries(data.components || {}).filter(([, v]) => v.detected).map(([k]) => k);

    let html = '<div class="row g-3">';

    // Resumen
    html += `<div class="col-md-6 col-lg-4"><div class="card bg-dark-card text-white h-100">
        <div class="card-header"><i class="bi bi-clipboard-data me-1"></i>Resumen</div>
        <div class="card-body small">
            <p><strong>Proyecto:</strong> ${s.projectName}</p>
            <p><strong>Tipo:</strong> ${s.projectType}</p>
            <p><strong>Tamaño:</strong> ${s.size} · <strong>Archivos:</strong> ${s.files} · <strong>Carpetas:</strong> ${s.folders}</p>
            <p><strong>Lenguaje principal:</strong> ${s.mainLanguage}</p>
            <p><strong>Framework principal:</strong> ${s.mainFramework}</p>
            <p><strong>Gestor de paquetes:</strong> ${s.packageManager}</p>
            <p><strong>Punto de entrada:</strong> ${s.mainEntryPoint}</p>
        </div>
    </div></div>`;

    // Arquitectura
    html += `<div class="col-md-6 col-lg-4"><div class="card bg-dark-card text-white h-100">
        <div class="card-header"><i class="bi bi-diagram-3 me-1"></i>Arquitectura</div>
        <div class="card-body small">
            <p><strong>Principal:</strong> ${arch.primaryArchitecture}</p>
            <p><strong>Candidatas:</strong> ${arch.architectureCandidates?.length ? arch.architectureCandidates.join(', ') : 'No determinado'}</p>
            <p><strong>Tipos de proyecto:</strong> ${arch.projectTypes?.join(', ') || 'No determinado'}</p>
            <p><strong>Complejidad estimada:</strong> ${s.estimatedComplexity}</p>
        </div>
    </div></div>`;

    // Framework
    html += `<div class="col-md-6 col-lg-4"><div class="card bg-dark-card text-white h-100">
        <div class="card-header"><i class="bi bi-boxes me-1"></i>Framework</div>
        <div class="card-body small">
            <p>${data.frameworks.length ? data.frameworks.join(', ') : 'Ninguno detectado'}</p>
            <p><strong>Módulos detectados:</strong></p>
            <p class="text-secondary">${componentsDetected.length ? componentsDetected.join(', ') : 'No determinado'}</p>
        </div>
    </div></div>`;

    // Seguridad
    html += `<div class="col-md-6 col-lg-4"><div class="card bg-dark-card text-white h-100">
        <div class="card-header"><i class="bi bi-shield-exclamation me-1"></i>Seguridad</div>
        <div class="card-body small">
            <p><strong>Nivel de riesgo:</strong> ${riskBadge(sec.riskLevel)}</p>
            <p class="text-secondary">${sec.riskReason}</p>
        </div>
    </div></div>`;

    // Complejidad
    html += `<div class="col-md-6 col-lg-4"><div class="card bg-dark-card text-white h-100">
        <div class="card-header"><i class="bi bi-graph-up me-1"></i>Complejidad</div>
        <div class="card-body small">
            <p><strong>Estimada:</strong> ${s.estimatedComplexity}</p>
            <p><strong>Profundidad máxima:</strong> ${data.statistics.smart?.maxDepth ?? '—'}</p>
            <p><strong>Carpeta con más archivos:</strong> ${data.statistics.smart?.folderWithMostFiles ?? '—'}</p>
            <p><strong>Extensión predominante:</strong> ${data.statistics.smart?.dominantExtension ?? '—'}</p>
        </div>
    </div></div>`;

    // Calidad (medidor circular)
    html += `<div class="col-md-6 col-lg-4"><div class="card bg-dark-card text-white h-100">
        <div class="card-header"><i class="bi bi-speedometer2 me-1"></i>Calidad</div>
        <div class="card-body small d-flex align-items-center gap-3">
            <div>${qualityGaugeSvg(quality.overallScore)}</div>
            <div>
                ${Object.entries(quality.indicators).map(([k, v]) => `<div><strong>${k}:</strong> ${v.score}/100</div>`).join('')}
            </div>
        </div>
    </div></div>`;

    // Dependencias
    html += `<div class="col-md-6 col-lg-6"><div class="card bg-dark-card text-white h-100">
        <div class="card-header"><i class="bi bi-box-seam me-1"></i>Dependencias (${deps.length})</div>
        <div class="card-body small" style="max-height:220px; overflow:auto;">
            ${deps.length ? `<ul class="list-unstyled mb-0">${deps.map(d => `<li>${d.name} <span class="text-secondary">${d.version}</span> <span class="badge bg-secondary">${d.manager}</span></li>`).join('')}</ul>` : '<p class="text-secondary">Ninguna detectada</p>'}
        </div>
    </div></div>`;

    // Recomendaciones
    html += `<div class="col-md-6 col-lg-6"><div class="card bg-dark-card text-white h-100">
        <div class="card-header"><i class="bi bi-lightbulb me-1"></i>Recomendaciones (${recs.length})</div>
        <div class="card-body small" style="max-height:220px; overflow:auto;">
            ${recs.length ? `<ul class="list-unstyled mb-0">${recs.map(r => `<li class="mb-2">${severityBadge(r.severity)} ${r.message}</li>`).join('')}</ul>` : '<p class="text-secondary">Sin recomendaciones adicionales</p>'}
        </div>
    </div></div>`;

    // Análisis explicativo
    html += `<div class="col-12"><div class="card bg-dark-card text-white h-100">
        <div class="card-header"><i class="bi bi-file-text me-1"></i>Análisis</div>
        <div class="card-body small">${arch.text}</div>
    </div></div>`;

    html += '</div>';
    smartAnalysisContent.innerHTML = html;
}

// ====== EXPORTACIÓN DEL ANÁLISIS INTELIGENTE ======
function buildSmartExportPayload() {
    if (!currentSmartAnalysis) return null;
    const d = currentSmartAnalysis;
    return {
        metadata: d.metadata,
        summary: d.summary,
        frameworks: d.frameworks,
        dependencies: d.dependencies,
        components: d.components,
        security: d.security,
        entryPoints: d.entryPoints,
        analysis: d.analysis,
        recommendations: d.recommendations,
        quality: d.quality,
        statistics: d.statistics,
    };
}

document.getElementById('btnCopySmartAnalysis').addEventListener('click', () => {
    const payload = buildSmartExportPayload();
    if (!payload) {
        showToast('No hay análisis para copiar', 'warning');
        return;
    }
    const text = JSON.stringify(payload, null, 2);
    navigator.clipboard.writeText(text).then(() => {
        showToast('Análisis copiado al portapapeles', 'success');
    }).catch(() => {
        showToast('No se pudo copiar el análisis', 'danger');
    });
});

document.getElementById('btnDownloadSmartAnalysis').addEventListener('click', () => {
    const payload = buildSmartExportPayload();
    if (!payload) {
        showToast('No hay análisis para descargar', 'warning');
        return;
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analysis.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('analysis.json descargado', 'success');
});

// ====== INICIALIZACIÓN ======
console.log('Project ZIP Analyzer listo.');