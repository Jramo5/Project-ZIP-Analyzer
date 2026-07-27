/**
 * smartAnalyzer.js
 * Orquestador de la capa "Intelligent Analysis Engine".
 *
 * NO reemplaza el JSON generado por analyzer.js: lo recibe como entrada
 * y devuelve una copia ENRIQUECIDA con nuevos bloques (summary, components,
 * recommendations, quality, y ampliaciones de frameworks/security/
 * entryPoints/analysis). Todo se ejecuta 100% en el navegador.
 */
import { ProjectTypeDetector } from './projectTypeDetector.js';
import { FrameworkDetector } from './frameworkDetector.js';
import { ArchitectureDetector } from './architectureDetector.js';
import { ComponentDetector } from './componentDetector.js';
import { SecurityAnalyzer } from './securityAnalyzer.js';
import { QualityAnalyzer } from './qualityAnalyzer.js';
import { RecommendationEngine } from './recommendationEngine.js';
import { SummaryBuilder } from './summaryBuilder.js';

const EXTRA_ENTRY_POINT_CANDIDATES = [
    'bootstrap/app.php',
    'artisan',
    'public/index.html',
    'main.py',
    'manage.py',
    'Program.cs',
    'cmd/main.go',
    'src/main.rs',
];

export class SmartAnalyzer {
    /**
     * @param {object} baseResult - JSON producido por ProjectAnalyzer.exportJSON()
     */
    enrich(baseResult) {
        const paths = baseResult.fileList.map(f => f.path);

        // 1. Detectores independientes (SOLID: cada uno resuelve una única cosa)
        const projectType = new ProjectTypeDetector(baseResult).detect();
        const frameworkInfo = new FrameworkDetector(baseResult).detect();
        const architecture = new ArchitectureDetector(baseResult).detect();
        const componentInfo = new ComponentDetector(baseResult).detect();
        const securityExtra = new SecurityAnalyzer(baseResult).detect();
        const quality = new QualityAnalyzer(baseResult).detect();

        // 2. Puntos de entrada ampliados (se conserva el array original + nuevos hallazgos)
        const entryPoints = Array.from(new Set([
            ...(baseResult.entryPoints || []),
            ...EXTRA_ENTRY_POINT_CANDIDATES.filter(c => paths.includes(c)),
        ]));

        // 3. Recomendaciones (usa el JSON base, no depende de los otros detectores)
        const recommendations = new RecommendationEngine(baseResult).detect();

        // 4. Resumen ejecutivo (usa las salidas de los detectores anteriores)
        const summary = new SummaryBuilder(baseResult, {
            projectType,
            architecture,
            frameworks: frameworkInfo.frameworks,
            entryPoints,
        }).build(quality.overallScore);

        // 5. Estadísticas inteligentes (adicionales a "statistics")
        const smartStatistics = this.buildSmartStatistics(baseResult);

        // 6. Texto explicativo generado solo con evidencia disponible
        const analysisText = this.buildAnalysisText(baseResult, {
            projectType, architecture, frameworkInfo, componentInfo, summary,
        });

        // 7. Ensamblar el JSON final: se conserva TODO lo original y se amplía
        return {
            ...baseResult,
            summary,
            statistics: {
                ...baseResult.statistics,
                smart: smartStatistics,
            },
            frameworks: frameworkInfo.frameworks,
            components: componentInfo.components,
            security: {
                ...baseResult.security,
                ...securityExtra,
            },
            entryPoints,
            analysis: {
                ...baseResult.analysis,
                projectTypes: projectType.types,
                primaryProjectType: projectType.primaryType,
                architectureCandidates: architecture.candidates,
                primaryArchitecture: architecture.primaryArchitecture,
                text: analysisText,
            },
            recommendations,
            quality,
        };
    }

    buildSmartStatistics(baseResult) {
        const fileList = baseResult.fileList || [];
        if (!fileList.length) {
            return {
                maxDepth: 0,
                folderWithMostFiles: 'No determinado',
                dominantExtension: 'No determinado',
                dominantLanguage: 'No determinado',
                emptyFiles: 0,
                binaryFiles: 0,
                textFiles: 0,
            };
        }

        const BINARY_EXT = new Set([
            'png', 'jpg', 'jpeg', 'gif', 'ico', 'webp', 'bmp', 'ttf', 'woff', 'woff2',
            'eot', 'otf', 'pdf', 'zip', 'rar', 'gz', 'exe', 'dll', 'so', 'class', 'jar',
            'mp3', 'mp4', 'mov', 'avi', 'psd', 'sqlite', 'db',
        ]);

        const depths = fileList.map(f => f.path.split('/').length - 1);
        const maxDepth = Math.max(...depths);

        const folderCounts = {};
        for (const f of fileList) {
            const parts = f.path.split('/');
            const folder = parts.length > 1 ? parts.slice(0, -1).join('/') : '(raíz)';
            folderCounts[folder] = (folderCounts[folder] || 0) + 1;
        }
        const folderWithMostFiles = Object.entries(folderCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'No determinado';

        const extCounts = baseResult.statistics?.extensions || {};
        const dominantExtension = Object.entries(extCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'No determinado';

        const langCounts = baseResult.statistics?.languages || {};
        const dominantLangEntries = Object.entries(langCounts).filter(([k]) => k !== 'Desconocido').sort((a, b) => b[1] - a[1]);
        const dominantLanguage = dominantLangEntries[0]?.[0] || 'No determinado';

        const emptyFiles = fileList.filter(f => f.size === 0).length;
        const binaryFiles = fileList.filter(f => BINARY_EXT.has((f.extension || '').toLowerCase())).length;
        const textFiles = fileList.length - binaryFiles;

        return {
            maxDepth,
            folderWithMostFiles,
            dominantExtension,
            dominantLanguage,
            emptyFiles,
            binaryFiles,
            textFiles,
        };
    }

    /**
     * Construye un párrafo explicativo únicamente con evidencia detectada.
     * Si no hay evidencia suficiente para alguna parte, usa "No determinado"
     * en vez de inventar información.
     */
    buildAnalysisText(baseResult, { projectType, architecture, frameworkInfo, componentInfo, summary }) {
        const parts = [];

        const type = projectType.primaryType !== 'No determinado' ? projectType.primaryType : 'un tipo no determinado';
        const lang = summary.mainLanguage !== 'No determinado' ? `desarrollado principalmente en ${summary.mainLanguage}` : 'cuyo lenguaje principal no pudo determinarse con la evidencia disponible';
        parts.push(`El proyecto corresponde a: ${type}, ${lang}.`);

        if (architecture.primaryArchitecture !== 'No determinado') {
            parts.push(`Se infiere una arquitectura de tipo ${architecture.primaryArchitecture} a partir de la organización de carpetas detectada.`);
        } else {
            parts.push('No se encontró evidencia suficiente para inferir un patrón arquitectónico específico.');
        }

        if (frameworkInfo.frameworks.length) {
            parts.push(`Se detecta el uso de ${frameworkInfo.frameworks.join(', ')} como framework(s) principal(es).`);
        }

        if (summary.packageManager !== 'No determinado') {
            parts.push(`El gestor de dependencias identificado es ${summary.packageManager}.`);
        }

        const notableComponents = componentInfo.detectedList.filter(c => !['vendor', 'node_modules'].includes(c)).slice(0, 6);
        if (notableComponents.length) {
            parts.push(`Se identifican los siguientes módulos funcionales: ${notableComponents.join(', ')}.`);
        }

        return parts.join(' ');
    }
}
