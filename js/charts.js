import { formatBytes } from './utils.js';

let chartLanguages = null;
let chartExtensions = null;
let chartSize = null;

/**
 * Inicializa o actualiza los gráficos
 */
export function renderCharts(data) {
    renderLanguageChart(data.languages || {});
    renderExtensionChart(data.statistics?.extensions || {});
    renderSizeChart(data.fileList || []);
}

/**
 * Gráfico de lenguajes (pastel)
 */
function renderLanguageChart(languages) {
    const ctx = document.getElementById('chartLanguages').getContext('2d');
    const labels = Object.keys(languages);
    const values = Object.values(languages);

    if (chartLanguages) {
        chartLanguages.destroy();
    }

    chartLanguages = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels.length ? labels : ['Sin datos'],
            datasets: [{
                data: labels.length ? values : [1],
                backgroundColor: [
                    '#0d6efd', '#0dcaf0', '#ffc107', '#198754',
                    '#dc3545', '#6f42c1', '#fd7e14', '#20c997',
                    '#d63384', '#6610f2', '#0dcaf0', '#ff6b6b'
                ],
                borderColor: '#0f172a',
                borderWidth: 2,
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#e2e8f0', font: { size: 11 } }
                }
            }
        }
    });
}

/**
 * Gráfico de extensiones (pastel)
 */
function renderExtensionChart(extensions) {
    const ctx = document.getElementById('chartExtensions').getContext('2d');
    const labels = Object.keys(extensions);
    const values = Object.values(extensions);

    if (chartExtensions) {
        chartExtensions.destroy();
    }

    chartExtensions = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels.length ? labels : ['Sin datos'],
            datasets: [{
                data: labels.length ? values : [1],
                backgroundColor: [
                    '#0d6efd', '#0dcaf0', '#ffc107', '#198754',
                    '#dc3545', '#6f42c1', '#fd7e14', '#20c997',
                    '#d63384', '#6610f2', '#0dcaf0', '#ff6b6b'
                ],
                borderColor: '#0f172a',
                borderWidth: 2,
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#e2e8f0', font: { size: 11 } }
                }
            }
        }
    });
}

/**
 * Gráfico de tamaño por tipo (barras horizontales)
 */
function renderSizeChart(fileList) {
    const ctx = document.getElementById('chartSize').getContext('2d');

    // Agrupar por tipo (extensión) y sumar tamaño
    const sizeMap = {};
    for (const file of fileList) {
        const ext = file.extension || 'sin-extensión';
        sizeMap[ext] = (sizeMap[ext] || 0) + file.size;
    }

    // Ordenar por tamaño descendente y tomar top 10
    const sorted = Object.entries(sizeMap).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const labels = sorted.map(([ext]) => ext);
    const values = sorted.map(([, size]) => size);

    if (chartSize) {
        chartSize.destroy();
    }

    chartSize = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels.length ? labels : ['Sin datos'],
            datasets: [{
                label: 'Tamaño (bytes)',
                data: labels.length ? values : [0],
                backgroundColor: '#0d6efd',
                borderColor: '#0a58ca',
                borderWidth: 1,
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            plugins: {
                legend: { display: false },
            },
            scales: {
                x: {
                    ticks: { color: '#94a3b8' },
                    grid: { color: '#1e293b' },
                },
                y: {
                    ticks: { color: '#94a3b8' },
                    grid: { color: '#1e293b' },
                }
            }
        }
    });
}