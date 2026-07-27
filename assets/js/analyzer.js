import { formatBytes, getExtension, detectLanguage, detectType, countLines, getParentPath } from './utils.js';

/**
 * Clase principal que analiza el contenido del ZIP
 */
export class ProjectAnalyzer {
    constructor() {
        this.zipData = null;
        this.fileList = [];
        this.folderSet = new Set();
        this.stats = {
            totalFiles: 0,
            totalFolders: 0,
            totalSize: 0,
            totalLines: 0,
            extensions: {},
            languages: {},
            types: { file: 0, folder: 0 },
            largestFile: null,
            smallestFile: null,
            averageSize: 0,
        };
        this.detected = {
            frameworks: [],
            dependencies: [],
            entryPoints: [],
            security: {
                envFiles: [],
                certs: [],
                privateKeys: [],
                vendor: false,
                nodeModules: false,
                hiddenFiles: [],
                suspicious: [],
            },
            analysis: {
                architecture: 'Desconocida',
                projectType: 'Desconocido',
            },
            structure: {},
        };
        this.metadata = {
            fileName: '',
            fileSize: 0,
            fileModified: null,
        };
    }

    /**
     * Punto de entrada: carga un archivo ZIP desde un ArrayBuffer
     */
    async analyze(file) {
        this.reset();
        this.metadata.fileName = file.name;
        this.metadata.fileSize = file.size;
        this.metadata.fileModified = file.lastModified;

        // Leer ZIP con JSZip
        const arrayBuffer = await file.arrayBuffer();
        this.zipData = await JSZip.loadAsync(arrayBuffer);

        // Recorrer todos los archivos/carpetas
        await this.processEntries();

        // Calcular estadísticas finales
        this.computeFinalStats();

        // Detecciones avanzadas
        this.detectFrameworks();
        this.detectDependencies();
        this.detectEntryPoints();
        this.detectSecurity();
        this.inferProjectType();

        // Construir árbol
        this.buildTree();

        return this.exportJSON();
    }

    /**
     * Reinicia todas las propiedades
     */
    reset() {
        this.fileList = [];
        this.folderSet = new Set();
        this.stats = {
            totalFiles: 0,
            totalFolders: 0,
            totalSize: 0,
            totalLines: 0,
            extensions: {},
            languages: {},
            types: { file: 0, folder: 0 },
            largestFile: null,
            smallestFile: null,
            averageSize: 0,
        };
        this.detected = {
            frameworks: [],
            dependencies: [],
            entryPoints: [],
            security: {
                envFiles: [],
                certs: [],
                privateKeys: [],
                vendor: false,
                nodeModules: false,
                hiddenFiles: [],
                suspicious: [],
            },
            analysis: {
                architecture: 'Desconocida',
                projectType: 'Desconocido',
            },
            structure: {},
        };
    }

    /**
     * Procesa cada entrada del ZIP
     */
    async processEntries() {
        const entries = Object.keys(this.zipData.files);
        const total = entries.length;

        for (let i = 0; i < total; i++) {
            const path = entries[i];
            const entry = this.zipData.files[path];

            // Actualizar progreso (si se desea)
            // this.onProgress && this.onProgress(i, total);

            // Detectar si es carpeta (JSZip marca directorios con '/')
            if (entry.dir) {
                this.folderSet.add(path);
                this.stats.types.folder++;
                continue;
            }

            // Es archivo
            const fileInfo = await this.processFile(path, entry);
            this.fileList.push(fileInfo);
            this.stats.totalFiles++;
            this.stats.totalSize += fileInfo.size;
            this.stats.totalLines += fileInfo.lines;

            // Actualizar estadísticas por extensión
            const ext = fileInfo.extension;
            this.stats.extensions[ext] = (this.stats.extensions[ext] || 0) + 1;

            // Por lenguaje
            const lang = fileInfo.language;
            this.stats.languages[lang] = (this.stats.languages[lang] || 0) + 1;

            // Archivo más grande / más pequeño
            if (!this.stats.largestFile || fileInfo.size > this.stats.largestFile.size) {
                this.stats.largestFile = fileInfo;
            }
            if (!this.stats.smallestFile || fileInfo.size < this.stats.smallestFile.size) {
                this.stats.smallestFile = fileInfo;
            }
        }

        // Total carpetas únicas
        this.stats.totalFolders = this.folderSet.size;
        this.stats.types.folder = this.folderSet.size;

        // Promedio de tamaño
        this.stats.averageSize = this.stats.totalFiles > 0 ? this.stats.totalSize / this.stats.totalFiles : 0;
    }

    /**
     * Procesa un archivo individual: obtiene contenido, líneas, etc.
     */
    async processFile(path, entry) {
        const name = path.split('/').pop();
        const extension = getExtension(name);
        const language = detectLanguage(name);
        const type = 'file';
        const size = entry._data ? entry._data.uncompressedSize : 0;

        // Leer contenido como texto (solo si es texto)
        let content = '';
        let lines = 0;
        try {
            const data = await entry.async('string');
            content = data;
            lines = countLines(content);
        } catch (e) {
            // Archivo binario, no se puede leer como texto
            lines = 0;
        }

        return {
            path,
            name,
            extension,
            size,
            lines,
            language,
            type,
            content, // solo para archivos de texto
        };
    }

    /**
     * Calcula estadísticas finales adicionales
     */
    computeFinalStats() {
        // Ya calculado durante el procesamiento
    }

    /**
     * Detecta frameworks basados en archivos de configuración
     */
    detectFrameworks() {
        const frameworks = [];
        const files = this.fileList.map(f => f.path);

        // Lista de indicadores de frameworks
        const indicators = {
            'Laravel': ['vendor/bin', 'artisan', 'public/index.php', 'bootstrap/app.php'],
            'Symfony': ['bin/console', 'config/bundles.php', 'src/Kernel.php'],
            'CodeIgniter': ['system/core/CodeIgniter.php', 'application/config/config.php'],
            'CakePHP': ['config/bootstrap.php', 'webroot/index.php'],
            'WordPress': ['wp-config.php', 'wp-includes/version.php'],
            'Drupal': ['core/lib/Drupal.php', 'sites/default/settings.php'],
            'Joomla': ['administrator/index.php', 'includes/defines.php'],
            'Express': ['package.json', 'server.js', 'app.js'],
            'NestJS': ['nest-cli.json', 'src/main.ts'],
            'NextJS': ['next.config.js', 'pages/_app.js'],
            'Nuxt': ['nuxt.config.js', 'pages/index.vue'],
            'React': ['package.json', 'src/App.js', 'src/index.js'],
            'Vue': ['package.json', 'src/main.js', 'vue.config.js'],
            'Angular': ['angular.json', 'src/main.ts'],
            'Svelte': ['svelte.config.js', 'src/main.js'],
            'Flask': ['app.py', 'requirements.txt'],
            'Django': ['manage.py', 'settings.py'],
            'FastAPI': ['main.py', 'requirements.txt'],
            'Spring': ['pom.xml', 'build.gradle', 'src/main/java'],
            'ASP.NET': ['Startup.cs', 'Program.cs', 'appsettings.json'],
        };

        for (const [framework, patterns] of Object.entries(indicators)) {
            if (patterns.some(p => files.some(f => f.includes(p)))) {
                frameworks.push(framework);
            }
        }

        // Deduplicar
        this.detected.frameworks = [...new Set(frameworks)];
    }

    /**
     * Detecta dependencias desde package.json, composer.json, etc.
     */
    detectDependencies() {
        const deps = [];

        // Buscar package.json
        const pkgFile = this.fileList.find(f => f.path === 'package.json');
        if (pkgFile && pkgFile.content) {
            try {
                const pkg = JSON.parse(pkgFile.content);
                if (pkg.dependencies) {
                    for (const [name, version] of Object.entries(pkg.dependencies)) {
                        deps.push({ name, version, manager: 'npm', type: 'dependencies' });
                    }
                }
                if (pkg.devDependencies) {
                    for (const [name, version] of Object.entries(pkg.devDependencies)) {
                        deps.push({ name, version, manager: 'npm', type: 'devDependencies' });
                    }
                }
            } catch (e) { /* ignorar */ }
        }

        // Buscar composer.json
        const composerFile = this.fileList.find(f => f.path === 'composer.json');
        if (composerFile && composerFile.content) {
            try {
                const comp = JSON.parse(composerFile.content);
                if (comp.require) {
                    for (const [name, version] of Object.entries(comp.require)) {
                        deps.push({ name, version, manager: 'composer', type: 'require' });
                    }
                }
                if (comp['require-dev']) {
                    for (const [name, version] of Object.entries(comp['require-dev'])) {
                        deps.push({ name, version, manager: 'composer', type: 'require-dev' });
                    }
                }
            } catch (e) { /* ignorar */ }
        }

        // requirements.txt (Python)
        const reqFile = this.fileList.find(f => f.path === 'requirements.txt');
        if (reqFile && reqFile.content) {
            const lines = reqFile.content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
            for (const line of lines) {
                const parts = line.split('==');
                deps.push({ name: parts[0], version: parts[1] || 'latest', manager: 'pip', type: 'requirements' });
            }
        }

        this.detected.dependencies = deps;
    }

    /**
     * Detecta puntos de entrada comunes
     */
    detectEntryPoints() {
        const entries = [];
        const common = [
            'public/index.php',
            'index.php',
            'index.html',
            'main.js',
            'app.js',
            'server.js',
            'main.py',
            'Program.cs',
            'src/main.ts',
            'src/main.js',
            'src/index.js',
            'src/App.js',
        ];
        for (const candidate of common) {
            if (this.fileList.some(f => f.path === candidate)) {
                entries.push(candidate);
            }
        }
        this.detected.entryPoints = entries;
    }

    /**
     * Detecta aspectos de seguridad: .env, certificados, etc.
     */
    detectSecurity() {
        const sec = this.detected.security;

        for (const file of this.fileList) {
            const path = file.path;
            // .env
            if (path.includes('.env') || path === '.env' || path === '.env.example') {
                sec.envFiles.push(path);
            }
            // Certificados
            if (/\.(pem|key|p12|pfx|crt|cer)$/i.test(path)) {
                sec.certs.push(path);
            }
            // Llaves privadas
            if (/\.(pem|key|priv|private)$/i.test(path)) {
                sec.privateKeys.push(path);
            }
            // Archivos ocultos (empiezan con .)
            const name = path.split('/').pop();
            if (name.startsWith('.') && !['.', '..'].includes(name)) {
                sec.hiddenFiles.push(path);
            }
            // vendor / node_modules
            if (path.startsWith('vendor/')) sec.vendor = true;
            if (path.startsWith('node_modules/')) sec.nodeModules = true;
        }

        // Archivos sospechosos (sensibles)
        const sensitivePatterns = ['secret', 'password', 'token', 'key', 'credential'];
        for (const file of this.fileList) {
            const name = file.name.toLowerCase();
            if (sensitivePatterns.some(p => name.includes(p))) {
                sec.suspicious.push(file.path);
            }
        }
    }

    /**
     * Infiere el tipo de proyecto y arquitectura
     */
    inferProjectType() {
        const analysis = this.detected.analysis;
        const files = this.fileList.map(f => f.path);
        const hasBackend = files.some(f => /\.(php|py|go|rs|java|cs|cpp|rb|pl)$/i.test(f));
        const hasFrontend = files.some(f => /\.(html|css|js|ts|jsx|tsx|vue|svelte)$/i.test(f));
        const hasMVC = files.some(f => /controllers|models|views/i.test(f));
        const hasApi = files.some(f => /api|rest/i.test(f));
        const hasSPA = files.some(f => /src\/App\.(js|ts|vue|svelte)/i.test(f));

        if (hasBackend && hasFrontend) {
            analysis.projectType = 'FullStack';
        } else if (hasBackend) {
            analysis.projectType = 'Backend';
        } else if (hasFrontend) {
            analysis.projectType = 'Frontend';
        } else {
            analysis.projectType = 'Desconocido';
        }

        if (hasMVC) {
            analysis.architecture = 'MVC';
        } else if (hasApi) {
            analysis.architecture = 'API REST';
        } else if (hasSPA) {
            analysis.architecture = 'SPA';
        } else if (hasFrontend && !hasBackend) {
            analysis.architecture = 'Frontend (SPA/MPA)';
        } else if (hasBackend && !hasFrontend) {
            analysis.architecture = 'Backend (API/Microservicios)';
        } else {
            analysis.architecture = 'Monolito / Modular';
        }
    }

    /**
     * Construye un árbol jerárquico a partir de las rutas
     */
    buildTree() {
        const root = { name: 'root', type: 'folder', children: {} };

        // Añadir carpetas
        for (const folder of this.folderSet) {
            const parts = folder.split('/').filter(p => p);
            let current = root;
            for (const part of parts) {
                if (!current.children[part]) {
                    current.children[part] = { name: part, type: 'folder', children: {} };
                }
                current = current.children[part];
            }
        }

        // Añadir archivos
        for (const file of this.fileList) {
            const parts = file.path.split('/');
            const fileName = parts.pop();
            let current = root;
            for (const part of parts) {
                if (!current.children[part]) {
                    current.children[part] = { name: part, type: 'folder', children: {} };
                }
                current = current.children[part];
            }
            // Añadir archivo como hoja
            current.children[fileName] = { name: fileName, type: 'file', size: file.size, lines: file.lines, language: file.language };
        }

        // Convertir children a array para facilitar renderizado
        this.detected.structure = this.treeToArray(root);
    }

    /**
     * Convierte el árbol a un array plano con children
     */
    treeToArray(node) {
        const result = {
            name: node.name,
            type: node.type,
            size: node.size,
            lines: node.lines,
            language: node.language,
        };
        if (node.children) {
            const children = Object.values(node.children).map(child => this.treeToArray(child));
            if (children.length) {
                result.children = children;
            }
        }
        return result;
    }

    /**
     * Exporta el JSON final con todos los datos
     */
    exportJSON() {
        return {
            metadata: {
                fileName: this.metadata.fileName,
                fileSize: this.metadata.fileSize,
                fileSizeFormatted: formatBytes(this.metadata.fileSize),
                fileModified: new Date(this.metadata.fileModified).toISOString(),
            },
            statistics: {
                totalFiles: this.stats.totalFiles,
                totalFolders: this.stats.totalFolders,
                totalSize: this.stats.totalSize,
                totalSizeFormatted: formatBytes(this.stats.totalSize),
                totalLines: this.stats.totalLines,
                averageSize: this.stats.averageSize,
                averageSizeFormatted: formatBytes(this.stats.averageSize),
                largestFile: this.stats.largestFile ? {
                    name: this.stats.largestFile.name,
                    path: this.stats.largestFile.path,
                    size: this.stats.largestFile.size,
                    sizeFormatted: formatBytes(this.stats.largestFile.size),
                } : null,
                smallestFile: this.stats.smallestFile ? {
                    name: this.stats.smallestFile.name,
                    path: this.stats.smallestFile.path,
                    size: this.stats.smallestFile.size,
                    sizeFormatted: formatBytes(this.stats.smallestFile.size),
                } : null,
                extensions: this.stats.extensions,
                languages: this.stats.languages,
            },
            languages: this.stats.languages,
            frameworks: this.detected.frameworks,
            dependencies: this.detected.dependencies,
            security: this.detected.security,
            entryPoints: this.detected.entryPoints,
            analysis: this.detected.analysis,
            fileList: this.fileList.map(f => ({
                path: f.path,
                name: f.name,
                extension: f.extension,
                size: f.size,
                sizeFormatted: formatBytes(f.size),
                lines: f.lines,
                language: f.language,
                type: f.type,
            })),
            structure: this.detected.structure,
        };
    }
}
