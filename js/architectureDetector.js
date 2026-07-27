/**
 * architectureDetector.js
 * Responsabilidad única: inferir el/los patrón(es) arquitectónico(s)
 * a partir de la estructura de carpetas ya conocida.
 */
export class ArchitectureDetector {
    constructor(baseResult) {
        this.base = baseResult;
        this.paths = baseResult.fileList.map(f => f.path);
        this.pathsLower = this.paths.map(p => p.toLowerCase());
    }

    has(pattern) {
        const re = pattern instanceof RegExp ? pattern : new RegExp(pattern, 'i');
        return this.pathsLower.some(p => re.test(p));
    }

    countTopLevelDirsWithOwnManifest(baseDir) {
        return this.pathsLower.filter(p => new RegExp(`^${baseDir}/[^/]+/(package\\.json|composer\\.json)$`).test(p)).length;
    }

    detect() {
        const candidates = [];
        const evidence = {};
        const add = (name, reason) => {
            candidates.push(name);
            evidence[name] = reason;
        };

        const hasControllers = this.has(/controllers?\//);
        const hasModels = this.has(/models?\//);
        const hasViews = this.has(/views?\//) || this.has(/templates?\//);
        const hasModules = this.has(/modules\/[^/]+\/controllers?\//);
        const hasDomain = this.has(/(^|\/)domain\//);
        const hasInfrastructure = this.has(/(^|\/)infrastructure\//);
        const hasApplication = this.has(/(^|\/)application\//);
        const hasUseCases = this.has(/usecases?\//) || this.has(/use-cases\//);
        const hasMicroservices = this.countTopLevelDirsWithOwnManifest('services') > 1 || this.countTopLevelDirsWithOwnManifest('microservices') > 1 || this.countTopLevelDirsWithOwnManifest('apps') > 1;
        const hasWorkspaces = this.has(/(^|\/)package\.json$/) && (this.has(/(^|\/)packages\//) || this.has(/(^|\/)apps\//));
        const isSPA = this.has(/(^|\/)index\.html$/) && (this.has(/src\/app\.(js|jsx|ts|tsx|vue)$/i) || this.has(/\.jsx$|\.tsx$|\.vue$/));
        const hasSSRHints = this.has(/getserversideprops/i) || this.has(/pages\/api\//) || this.has(/(^|\/)views\/.*\.(ejs|pug|hbs|blade\.php)$/);
        const hasApiOnly = this.has(/(^|\/)(routes|api)\//) && !hasViews;
        const hasJamstackHints = this.has(/(^|\/)content\//) && (this.has(/astro\.config/i) || this.has(/eleventy|_config\.yml/i) || this.has(/gatsby-config/i));

        if (hasModules) add('HMVC', 'controladores organizados por módulo (modules/*/controllers)');
        else if (hasControllers && hasModels && hasViews) add('MVC', 'carpetas controllers, models y views detectadas');

        if (hasDomain && hasInfrastructure && hasApplication) add('Clean Architecture', 'capas domain/, application/ e infrastructure/ detectadas');
        else if (hasDomain && hasInfrastructure) add('Hexagonal', 'capas domain/ e infrastructure/ detectadas (puertos y adaptadores)');
        if (hasDomain && hasUseCases) add('DDD', 'carpeta domain/ junto con casos de uso (useCases/)');

        if (hasMicroservices) add('Microservicios', 'múltiples subcarpetas de servicio con manifiesto propio');
        if (hasWorkspaces) add('Proyecto Monorepo', 'estructura packages/ o apps/ junto a package.json raíz');

        if (isSPA) add('SPA', 'index.html único con punto de montaje de framework frontend');
        if (hasSSRHints) add('SSR', 'indicios de renderizado en servidor (getServerSideProps / vistas de plantilla)');
        if (hasApiOnly) add('API First', 'carpeta routes/api sin vistas de frontend');
        if (hasJamstackHints) add('Jamstack', 'generador de sitio estático + carpeta content/ detectados');

        if (!hasMicroservices && !hasWorkspaces && (hasControllers || hasModels || this.has(/(^|\/)src\//))) {
            add('Monolito', 'aplicación única sin separación en servicios independientes');
        }

        if (this.has(/(^|\/)(modules|features)\/[^/]+\//)) add('Proyecto Modular', 'organización en carpetas modules/ o features/');

        if (!candidates.length) add('Cliente-Servidor', 'estructura genérica; no se detectó un patrón arquitectónico específico');

        const unique = Array.from(new Set(candidates));

        return {
            candidates: unique,
            primaryArchitecture: unique[0] || 'No determinado',
            evidence,
        };
    }
}
