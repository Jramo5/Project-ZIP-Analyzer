/**
 * Módulo de utilidades comunes
 */

/**
 * Formatea un número de bytes a una cadena legible (KB, MB, GB)
 */
export function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Retorna la extensión de un archivo (sin punto)
 */
export function getExtension(filename) {
    const i = filename.lastIndexOf('.');
    return i > 0 ? filename.slice(i + 1).toLowerCase() : '';
}

/**
 * Determina el lenguaje según la extensión o nombre de archivo
 */
export function detectLanguage(filename) {
    const ext = getExtension(filename);
    const name = filename.toLowerCase();

    // Mapeo de extensiones a lenguajes
    const map = {
        'php': 'PHP',
        'js': 'JavaScript',
        'mjs': 'JavaScript',
        'cjs': 'JavaScript',
        'ts': 'TypeScript',
        'tsx': 'TypeScript',
        'jsx': 'JavaScript',
        'html': 'HTML',
        'htm': 'HTML',
        'css': 'CSS',
        'scss': 'SCSS',
        'sass': 'SCSS',
        'less': 'LESS',
        'json': 'JSON',
        'md': 'Markdown',
        'markdown': 'Markdown',
        'xml': 'XML',
        'yaml': 'YAML',
        'yml': 'YAML',
        'sql': 'SQL',
        'py': 'Python',
        'go': 'Go',
        'rs': 'Rust',
        'java': 'Java',
        'cs': 'C#',
        'cpp': 'C++',
        'c': 'C',
        'h': 'C/C++',
        'sh': 'Shell',
        'bash': 'Shell',
        'zsh': 'Shell',
        'Dockerfile': 'Dockerfile',
        'dockerignore': 'Dockerfile',
        'yml': 'YAML',
        'yaml': 'YAML',
        'toml': 'TOML',
        'ini': 'INI',
        'env': 'Env',
        'conf': 'Config',
        'config': 'Config',
        'xml': 'XML',
        'svg': 'SVG',
        'png': 'Image',
        'jpg': 'Image',
        'jpeg': 'Image',
        'gif': 'Image',
        'ico': 'Image',
        'webp': 'Image',
        'ttf': 'Font',
        'woff': 'Font',
        'woff2': 'Font',
        'eot': 'Font',
        'otf': 'Font',
        'svg': 'SVG',
        'pdf': 'PDF',
        'txt': 'Text',
        'log': 'Log',
        'gitignore': 'Git',
        'gitattributes': 'Git',
    };

    // Archivos especiales sin extensión
    const specials = {
        'dockerfile': 'Dockerfile',
        'makefile': 'Makefile',
        'readme': 'Markdown',
        'license': 'Text',
        'changelog': 'Text',
        'contributing': 'Markdown',
        '.env': 'Env',
        '.env.example': 'Env',
        '.gitignore': 'Git',
        '.gitattributes': 'Git',
        '.htaccess': 'Apache',
        'nginx.conf': 'Nginx',
        'apache.conf': 'Apache',
    };

    if (specials[name]) return specials[name];
    return map[ext] || 'Desconocido';
}

/**
 * Detecta el tipo de archivo (file o folder) basado en el nombre
 */
export function detectType(filename) {
    // Si termina con '/' es carpeta (JSZip lo trata así)
    return filename.endsWith('/') ? 'folder' : 'file';
}

/**
 * Cuenta líneas de un string de texto (aproximado)
 */
export function countLines(content) {
    if (!content) return 0;
    return content.split('\n').length;
}

/**
 * Obtiene una ruta padre para construir árbol
 */
export function getParentPath(path) {
    const parts = path.split('/');
    parts.pop();
    return parts.join('/');
}

/**
 * Escapa caracteres HTML para evitar inyección
 */
export function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
