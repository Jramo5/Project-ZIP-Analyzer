/**
 * qualityAnalyzer.js
 * Responsabilidad única: calcular indicadores de calidad (0-100) a partir
 * de evidencia estructural ya disponible (fileList, structure, statistics).
 */
export class QualityAnalyzer {
    constructor(baseResult) {
        this.base = baseResult;
        this.paths = baseResult.fileList.map(f => f.path);
        this.pathsLower = this.paths.map(p => p.toLowerCase());
        this.stats = baseResult.statistics || {};
        this.fileList = baseResult.fileList || [];
    }

    has(pattern) {
        const re = pattern instanceof RegExp ? pattern : new RegExp(pattern, 'i');
        return this.pathsLower.some(p => re.test(p));
    }

    clamp(n) {
        return Math.max(0, Math.min(100, Math.round(n)));
    }

    detect() {
        const indicators = {};

        // --- Estructura: separación clara en carpetas reconocibles ---
        let structureScore = 40;
        const structureFolders = ['src', 'public', 'config', 'app', 'lib', 'controllers', 'models', 'views', 'routes'];
        const foundFolders = structureFolders.filter(f => this.has(new RegExp(`(^|/)${f}/`)));
        structureScore += foundFolders.length * 8;
        indicators.structure = {
            score: this.clamp(structureScore),
            explanation: foundFolders.length
                ? `Se identificaron carpetas de organización estándar: ${foundFolders.join(', ')}.`
                : 'No se identificaron carpetas de organización estándar (src, public, config, etc.).',
        };

        // --- Organización: profundidad razonable, sin archivos sueltos en raíz en exceso ---
        const depths = this.paths.map(p => p.split('/').length - 1);
        const maxDepth = depths.length ? Math.max(...depths) : 0;
        const rootFiles = this.fileList.filter(f => !f.path.includes('/')).length;
        let organizationScore = 100;
        if (maxDepth > 10) organizationScore -= 20;
        if (maxDepth === 0) organizationScore -= 30;
        if (rootFiles > 15) organizationScore -= 15;
        indicators.organization = {
            score: this.clamp(organizationScore),
            explanation: `Profundidad máxima de ${maxDepth} niveles y ${rootFiles} archivo(s) en la raíz.`,
        };

        // --- Modularidad: componentes de responsabilidad separada ---
        const modularSignals = ['services', 'repositories', 'controllers', 'models', 'middleware', 'components', 'modules'];
        const foundModular = modularSignals.filter(f => this.has(new RegExp(`(^|/)${f}s?/`)));
        indicators.modularity = {
            score: this.clamp(30 + foundModular.length * 12),
            explanation: foundModular.length
                ? `Responsabilidades separadas en: ${foundModular.join(', ')}.`
                : 'No se detectaron carpetas que separen responsabilidades (services, controllers, models, etc.).',
        };

        // --- Documentación ---
        const hasReadme = this.has(/(^|\/)readme(\.md)?$/);
        const hasChangelog = this.has(/(^|\/)changelog(\.md)?$/);
        const hasDocs = this.has(/(^|\/)docs?\//);
        let docScore = 20;
        if (hasReadme) docScore += 40;
        if (hasChangelog) docScore += 15;
        if (hasDocs) docScore += 25;
        indicators.documentation = {
            score: this.clamp(docScore),
            explanation: `README: ${hasReadme ? 'sí' : 'no'}, CHANGELOG: ${hasChangelog ? 'sí' : 'no'}, carpeta docs/: ${hasDocs ? 'sí' : 'no'}.`,
        };

        // --- Configuración ---
        const hasEnvExample = this.has(/\.env\.example$/);
        const hasGitignore = this.has(/(^|\/)\.gitignore$/);
        const hasEditorconfig = this.has(/(^|\/)\.editorconfig$/);
        let configScore = 25;
        if (hasEnvExample) configScore += 25;
        if (hasGitignore) configScore += 30;
        if (hasEditorconfig) configScore += 20;
        indicators.configuration = {
            score: this.clamp(configScore),
            explanation: `.env.example: ${hasEnvExample ? 'sí' : 'no'}, .gitignore: ${hasGitignore ? 'sí' : 'no'}, .editorconfig: ${hasEditorconfig ? 'sí' : 'no'}.`,
        };

        // --- Mantenibilidad: promedio de las anteriores, penalizando archivos enormes ---
        const avgOfOthers = (indicators.structure.score + indicators.organization.score + indicators.modularity.score + indicators.documentation.score + indicators.configuration.score) / 5;
        const hasHugeFiles = this.fileList.some(f => f.size > 1024 * 1024 * 2); // >2MB
        let maintainability = avgOfOthers - (hasHugeFiles ? 10 : 0);
        indicators.maintainability = {
            score: this.clamp(maintainability),
            explanation: hasHugeFiles
                ? 'Promedio de otros indicadores, penalizado por archivos individuales mayores a 2MB.'
                : 'Promedio de estructura, organización, modularidad, documentación y configuración.',
        };

        const overall = this.clamp(
            (indicators.structure.score + indicators.organization.score + indicators.modularity.score +
                indicators.documentation.score + indicators.configuration.score + indicators.maintainability.score) / 6
        );

        return {
            overallScore: overall,
            indicators,
        };
    }
}
