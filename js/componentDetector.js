/**
 * componentDetector.js
 * Responsabilidad única: detectar qué módulos/componentes funcionales
 * están presentes en el proyecto, según nombres de carpetas y archivos.
 */
export class ComponentDetector {
    constructor(baseResult) {
        this.base = baseResult;
        this.paths = baseResult.fileList.map(f => f.path);
        this.pathsLower = this.paths.map(p => p.toLowerCase());
    }

    matches(patterns) {
        const found = [];
        for (const pattern of patterns) {
            const re = new RegExp(pattern, 'i');
            for (const p of this.pathsLower) {
                if (re.test(p)) {
                    found.push(p);
                    if (found.length >= 5) return found; // limitar evidencia
                }
            }
        }
        return found;
    }

    detect() {
        const definitions = {
            authentication: ['(^|/)auth(entication)?/', 'login\\.(php|js|py)$', 'passport', 'jwt'],
            authorization: ['(^|/)(acl|permissions|roles)/', 'authorization'],
            database: ['(^|/)(database|db|migrations)/', '\\.sql$'],
            installer: ['install(er)?\\.(php|js)$', '(^|/)installer/'],
            updater: ['update(r)?\\.(php|js)$', '(^|/)updater/'],
            api: ['(^|/)api/'],
            controllers: ['controllers?/'],
            models: ['models?/'],
            views: ['views?/', 'templates?/'],
            routes: ['routes?/', 'routes\\.(php|js)$'],
            middleware: ['middlewares?/'],
            services: ['services?/'],
            repositories: ['repositor(y|ies)/'],
            storage: ['(^|/)storage/'],
            cache: ['(^|/)cache/'],
            queue: ['(^|/)queue(s)?/'],
            notifications: ['notifications?/'],
            mail: ['(^|/)mail(ers)?/'],
            logs: ['(^|/)logs?/', '\\.log$'],
            scheduler: ['scheduler|cron'],
            jobs: ['(^|/)jobs?/'],
            cli: ['(^|/)(bin|cli|console)/', 'artisan$'],
            docker: ['dockerfile$', 'docker-compose'],
            tests: ['(^|/)tests?/', '(^|/)__tests__/', '\\.(spec|test)\\.(js|ts|php|py)$'],
            assets: ['(^|/)assets?/', '(^|/)public/(css|js|img)/'],
            uploads: ['(^|/)uploads?/'],
            downloads: ['(^|/)downloads?/'],
            plugins: ['(^|/)plugins?/'],
            themes: ['(^|/)themes?/'],
            vendor: ['(^|/)vendor/'],
            node_modules: ['(^|/)node_modules/'],
        };

        const components = {};
        for (const [name, patterns] of Object.entries(definitions)) {
            const examples = this.matches(patterns);
            components[name] = {
                detected: examples.length > 0,
                examples,
            };
        }

        const detectedList = Object.entries(components).filter(([, v]) => v.detected).map(([k]) => k);

        return { components, detectedList };
    }
}
