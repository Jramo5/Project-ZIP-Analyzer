/**
 * Módulo para manejar la visualización y acciones del JSON
 */
let currentJsonData = null;
let isMinified = false;

/**
 * Muestra el JSON en el panel con resaltado de sintaxis
 */
export function displayJson(jsonData, container, minify = false) {
    currentJsonData = jsonData;
    isMinified = minify;

    let jsonStr;
    if (minify) {
        jsonStr = JSON.stringify(jsonData);
    } else {
        jsonStr = JSON.stringify(jsonData, null, 2);
    }

    // Resaltado básico
    const highlighted = syntaxHighlight(jsonStr);
    container.innerHTML = `<code>${highlighted}</code>`;
}

/**
 * Resalta sintaxis JSON con colores
 */
function syntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(
        /("(?:[^"\\]|\\.)*")(?=\s*:)|("(?:[^"\\]|\\.)*")|(\b\d+(\.\d+)?\b)|(\btrue\b|\bfalse\b|\bnull\b)/g,
        function(match, key, string, number, bool) {
            if (key) {
                return `<span class="key">${key}</span>`;
            } else if (string) {
                return `<span class="string">${string}</span>`;
            } else if (number) {
                return `<span class="number">${number}</span>`;
            } else if (bool) {
                return `<span class="boolean">${bool}</span>`;
            }
            return match;
        }
    );
}

/**
 * Copia el JSON al portapapeles
 */
export function copyJson(container) {
    if (!currentJsonData) {
        showToast('No hay JSON para copiar', 'warning');
        return;
    }
    const text = isMinified ? JSON.stringify(currentJsonData) : JSON.stringify(currentJsonData, null, 2);
    navigator.clipboard.writeText(text).then(() => {
        showToast('JSON copiado al portapapeles', 'success');
    }).catch(() => {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('JSON copiado', 'success');
    });
}

/**
 * Descarga el JSON como archivo
 */
export function downloadJson() {
    if (!currentJsonData) {
        showToast('No hay JSON para descargar', 'warning');
        return;
    }
    const text = isMinified ? JSON.stringify(currentJsonData) : JSON.stringify(currentJsonData, null, 2);
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project-analysis.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('JSON descargado', 'success');
}

/**
 * Toast simple usando Bootstrap
 */
function showToast(message, type = 'info') {
    const toastEl = document.getElementById('liveToast');
    const toastBody = document.getElementById('toastMessage');
    toastBody.textContent = message;
    const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
    toast.show();
}