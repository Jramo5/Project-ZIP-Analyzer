/**
 * summaryBuilder.js
 * Responsabilidad única: construir el resumen ejecutivo ("summary") a
 * partir de los resultados ya calculados por el resto de los analizadores
 * (no vuelve a leer el ZIP ni recalcula nada por su cuenta).
 */
export class SummaryBuilder {
    /**
     * @param {object} baseResult - JSON base de analyzer.js
     * @param {object} extras - { projectType, architecture, frameworks, entryPoints, quality, dependencies }
     */
    constructor(baseResult, extras) {
        this.base = baseResult;
        this.extras = extras;
    }

    detectPackageManager() {
        const deps = this.base.dependencies || [];
        if (deps.some(d => d.manager === 'composer')) return 'Composer';
        if (deps.some(d => d.manager === 'npm')) return 'npm';
        if (deps.some(d => d.manager === 'pip')) return 'pip';
        const paths = this.base.fileList.map(f => f.path.toLowerCase());
        if (paths.includes('yarn.lock')) return 'Yarn';
        if (paths.includes('pnpm-lock.yaml')) return 'pnpm';
        if (paths.includes('cargo.toml')) return 'Cargo';
        if (paths.includes('go.mod')) return 'Go Modules';
        return 'No determinado';
    }

    projectName() {
        const raw = this.base.metadata?.fileName || '';
        return raw.replace(/\.zip$/i, '') || 'No determinado';
    }

    dominantLanguage() {
        const langs = this.base.statistics?.languages || {};
        const entries = Object.entries(langs).filter(([k]) => k !== 'Desconocido');
        if (!entries.length) return 'No determinado';
        entries.sort((a, b) => b[1] - a[1]);
        return entries[0][0];
    }

    estimateComplexity(qualityScore) {
        const files = this.base.statistics?.totalFiles || 0;
        const frameworksCount = (this.extras.frameworks || []).length;
        let points = 0;
        if (files > 500) points += 2;
        else if (files > 150) points += 1;
        if (frameworksCount > 2) points += 1;
        if ((this.extras.architecture?.candidates || []).length > 2) points += 1;
        if (qualityScore < 40) points += 1;

        if (points >= 4) return 'Alta';
        if (points >= 2) return 'Media';
        return 'Baja';
    }

    build(qualityScore) {
        return {
            projectName: this.projectName(),
            projectType: this.extras.projectType?.primaryType || 'No determinado',
            allProjectTypes: this.extras.projectType?.types || [],
            size: this.base.metadata?.fileSizeFormatted || 'No determinado',
            files: this.base.statistics?.totalFiles ?? 'No determinado',
            folders: this.base.statistics?.totalFolders ?? 'No determinado',
            mainLanguage: this.dominantLanguage(),
            mainFramework: (this.extras.frameworks && this.extras.frameworks[0]) || 'Ninguno detectado',
            packageManager: this.detectPackageManager(),
            architecture: this.extras.architecture?.primaryArchitecture || 'No determinado',
            estimatedComplexity: this.estimateComplexity(qualityScore),
            mainEntryPoint: (this.extras.entryPoints && this.extras.entryPoints[0]) || 'No determinado',
        };
    }
}
