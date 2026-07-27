/**
 * recommendationEngine.js
 * Responsabilidad única: generar recomendaciones automáticas basadas en
 * ausencias/presencias detectadas en el proyecto.
 */
export class RecommendationEngine {
    constructor(baseResult) {
        this.base = baseResult;
        this.fileList = baseResult.fileList || [];
        this.paths = this.fileList.map(f => f.path);
        this.pathsLower = this.paths.map(p => p.toLowerCase());
    }

    has(pattern) {
        const re = pattern instanceof RegExp ? pattern : new RegExp(pattern, 'i');
        return this.pathsLower.some(p => re.test(p));
    }

    findDuplicates() {
        const seen = new Map();
        const duplicates = [];
        for (const f of this.fileList) {
            const key = `${f.name}::${f.size}`;
            if (seen.has(key)) {
                duplicates.push(f.path);
            } else {
                seen.set(key, f.path);
            }
        }
        return duplicates;
    }

    detect() {
        const recs = [];
        const add = (severity, message) => recs.push({ severity, message });

        if (!this.has(/(^|\/)readme(\.md)?$/)) add('warning', 'No existe README: se recomienda documentar propósito, instalación y uso del proyecto.');
        if (!this.has(/(^|\/)license(\.md|\.txt)?$/)) add('info', 'No existe archivo LICENSE: conviene declarar los términos de uso del código.');
        if (!this.has(/(^|\/)\.gitignore$/)) add('warning', 'No existe .gitignore: archivos innecesarios podrían terminar versionados.');
        if (!this.has(/(^|\/)\.editorconfig$/)) add('info', 'No existe .editorconfig: podría ayudar a mantener consistencia de estilo entre editores.');
        if (!this.has(/(^|\/)tests?\//) && !this.has(/\.(spec|test)\.(js|ts|php|py)$/)) add('warning', 'No existe carpeta de pruebas (tests): no se detectaron pruebas automatizadas.');
        if (this.has(/(^|\/)vendor\//)) add('critical', 'La carpeta vendor/ está incluida en el ZIP: aumenta el peso y normalmente no debería distribuirse ni versionarse.');
        if (this.has(/(^|\/)node_modules\//)) add('critical', 'La carpeta node_modules/ está incluida en el ZIP: aumenta considerablemente el peso y es regenerable con el gestor de paquetes.');
        if (this.has(/\.(tmp|temp)$|~$/i)) add('info', 'Se detectaron archivos temporales que podrían eliminarse antes de distribuir el proyecto.');
        if (this.findDuplicates().length) add('info', `Se detectaron ${this.findDuplicates().length} archivo(s) con nombre y tamaño duplicados; conviene revisarlos.`);
        const bigFiles = this.fileList.filter(f => f.size > 1024 * 1024 * 5); // >5MB
        if (bigFiles.length) add('warning', `Se detectaron ${bigFiles.length} archivo(s) mayores a 5MB, lo cual puede indicar binarios o assets pesados innecesarios.`);
        if (!this.has(/(^|\/)docs?\//) && !this.has(/(^|\/)readme(\.md)?$/)) add('info', 'No se encontró documentación adicional (carpeta docs/) ni README.');
        if (!this.has(/dockerfile$/) && !this.has(/docker-compose/i) && this.has(/(^|\/)(server\.js|public\/index\.php|manage\.py)$/)) {
            add('info', 'No existe Dockerfile: podría facilitar la contenerización del proyecto detectado como aplicación/servidor.');
        }

        return recs;
    }
}
