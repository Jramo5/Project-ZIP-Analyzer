/**
 * projectTypeDetector.js
 * Responsabilidad única: inferir el/los tipo(s) de proyecto a partir de la
 * evidencia ya recolectada por analyzer.js (fileList, frameworks, entryPoints).
 * No lee el ZIP de nuevo: solo reutiliza el JSON base.
 */
export class ProjectTypeDetector {
    constructor(baseResult) {
        this.base = baseResult;
        this.paths = baseResult.fileList.map(f => f.path);
        this.pathsLower = this.paths.map(p => p.toLowerCase());
        this.frameworks = baseResult.frameworks || [];
    }

    has(pattern) {
        const re = pattern instanceof RegExp ? pattern : new RegExp(pattern, 'i');
        return this.pathsLower.some(p => re.test(p));
    }

    hasFile(name) {
        return this.pathsLower.includes(name.toLowerCase());
    }

    detect() {
        const types = new Set();
        const evidence = {};

        const add = (type, reason) => {
            types.add(type);
            evidence[type] = evidence[type] || [];
            evidence[type].push(reason);
        };

        // --- Lenguaje / plataforma base ---
        if (this.hasFile('composer.json') || this.has(/\.php$/)) add('Proyecto PHP', 'composer.json o archivos .php detectados');
        if (this.hasFile('package.json') || this.has(/\.(js|ts|jsx|tsx)$/)) add('Proyecto Node', 'package.json o archivos JS/TS detectados');
        if (this.hasFile('requirements.txt') || this.hasFile('pipfile') || this.has(/\.py$/)) add('Proyecto Python', 'requirements.txt / archivos .py detectados');
        if (this.hasFile('pom.xml') || this.hasFile('build.gradle') || this.has(/\.java$/)) add('Proyecto Java', 'pom.xml / build.gradle / archivos .java detectados');
        if (this.hasFile('go.mod') || this.has(/\.go$/)) add('Proyecto Go', 'go.mod o archivos .go detectados');
        if (this.hasFile('cargo.toml') || this.has(/\.rs$/)) add('Proyecto Rust', 'Cargo.toml o archivos .rs detectados');
        if (this.has(/\.csproj$/) || this.has(/\.sln$/) || this.has(/\.cs$/)) add('Proyecto .NET', 'archivo .csproj/.sln/.cs detectado');
        if (this.hasFile('dockerfile') || this.has(/docker-compose\.ya?ml$/) || this.has(/(^|\/)dockerfile$/)) add('Proyecto Docker', 'Dockerfile / docker-compose detectado');

        // --- Naturaleza funcional ---
        const hasBackendCode = this.has(/\.(php|py|go|rs|java|cs|rb)$/);
        const hasFrontendMarkup = this.has(/\.(html|htm)$/);
        const hasFrontendScript = this.has(/\.(css|scss|less|jsx|tsx|vue|svelte)$/) || this.frameworks.some(f => ['React', 'Vue', 'Angular', 'Svelte'].includes(f));
        const hasApiRoutes = this.has(/(^|\/)(routes|api)(\/|$)/) || this.has(/\/api\//);
        const hasControllers = this.has(/controllers?\//);
        const hasCliEntry = this.hasFile('artisan') || this.has(/(^|\/)bin\//) || this.has(/cli\.(js|php|py)$/);
        const hasDbOnly = this.has(/(^|\/)(migrations|models)\//) && !hasFrontendMarkup && !hasFrontendScript;

        if (hasFrontendMarkup && !hasBackendCode && !this.frameworks.length) {
            add('Sitio web', 'HTML sin backend ni framework de aplicación detectado');
        }
        if (hasFrontendMarkup && (hasFrontendScript || this.frameworks.some(f => ['React', 'Vue', 'Angular', 'Svelte', 'NextJS', 'Nuxt'].includes(f)))) {
            add('Aplicación Web', 'Markup + lógica de frontend / framework SPA detectado');
        }
        if (hasBackendCode) add('Backend', 'código de servidor detectado (PHP/Python/Go/Java/C#/Ruby)');
        if (hasFrontendMarkup || hasFrontendScript) add('Frontend', 'archivos de interfaz (HTML/CSS/JS/framework) detectados');
        if (hasBackendCode && (hasFrontendMarkup || hasFrontendScript)) add('Full Stack', 'backend y frontend presentes en el mismo proyecto');
        if (hasApiRoutes && !hasFrontendMarkup) add('API REST', 'carpeta routes/api detectada sin vistas de frontend');
        if (hasCliEntry) add('CLI', 'punto de entrada de línea de comandos detectado (artisan/bin/cli)');
        if (this.has(/(^|\/)(src|lib)\//) && this.hasFile('package.json') && !this.has(/(^|\/)(public|views|pages)\//) && !hasFrontendMarkup) {
            add('Biblioteca', 'estructura src/lib sin puntos de entrada de aplicación (posible paquete reutilizable)');
        }
        if (this.pathsLower.some(p => p.includes('sdk'))) add('SDK', 'referencia a "sdk" en la ruta de archivos');
        if (this.has(/wp-config\.php|wp-includes\//)) add('CMS', 'estructura de WordPress detectada');
        if (this.has(/sites\/default\/settings\.php|core\/lib\/drupal\.php/i)) add('CMS', 'estructura de Drupal detectada');
        if (this.has(/administrator\/index\.php/i)) add('CMS', 'estructura de Joomla detectada');
        if (this.has(/(^|\/)themes?\//) && this.has(/style\.css$/)) add('Tema', 'carpeta themes/ con style.css detectada');
        if (this.has(/(^|\/)plugins?\//) || this.has(/(^|\/)wp-content\/plugins\//)) add('Plugin', 'carpeta plugins/ detectada');
        if (this.has(/install(er)?\.php$/) || this.has(/(^|\/)installer\//)) add('Instalador', 'archivo/carpeta de instalación detectado');
        if (this.has(/electron/i) || this.has(/(^|\/)main\/main\.(js|ts)$/)) add('Aplicación de escritorio', 'indicios de Electron detectados');
        if (this.has(/android\/|ios\/|\.gradle$/) && this.has(/react-native|flutter/i)) add('Aplicación móvil', 'estructura React Native/Flutter detectada');
        if (this.has(/(^|\/)(services|microservices)\//) && this.pathsLower.filter(p => /(^|\/)(services|microservices)\/[^/]+\/(package\.json|composer\.json)$/.test(p)).length > 1) {
            add('Microservicio', 'múltiples subcarpetas de servicio con manifiestos propios');
        }
        if (hasDbOnly) add('Backend', 'solo modelos/migraciones sin interfaz (capa de datos)');

        const list = Array.from(types);

        return {
            types: list.length ? list : ['No determinado'],
            primaryType: this.pickPrimary(list),
            evidence,
        };
    }

    pickPrimary(list) {
        if (!list.length) return 'No determinado';
        const priority = ['Full Stack', 'Aplicación Web', 'API REST', 'CMS', 'Backend', 'Frontend', 'Sitio web', 'CLI', 'SDK', 'Biblioteca'];
        for (const p of priority) {
            if (list.includes(p)) return p;
        }
        return list[0];
    }
}
