/**
 * securityAnalyzer.js
 * Responsabilidad única: ampliar el bloque "security" ya calculado por
 * analyzer.js con hallazgos adicionales y un nivel de riesgo justificado.
 * No elimina ni reemplaza los campos originales (envFiles, certs,
 * privateKeys, vendor, nodeModules, hiddenFiles, suspicious).
 */
export class SecurityAnalyzer {
    constructor(baseResult) {
        this.base = baseResult;
        this.paths = baseResult.fileList.map(f => f.path);
        this.pathsLower = this.paths.map(p => p.toLowerCase());
        this.baseSecurity = baseResult.security || {};
    }

    matchAll(re) {
        return this.paths.filter(p => re.test(p));
    }

    detect() {
        const backups = this.matchAll(/\.(bak|backup|old)$|~$/i);
        const logs = this.matchAll(/\.log$|(^|\/)logs?\//i);
        const sqlDumps = this.matchAll(/\.(sql|sqlite|sqlite3|db)$/i);
        const sensitiveConfig = this.matchAll(/(database|db)\.(php|json|yml|yaml)$|wp-config\.php$|settings\.py$/i);
        const tokensOrCreds = this.matchAll(/(secret|password|token|credential|apikey|api_key)/i);

        const envFiles = this.baseSecurity.envFiles || [];
        const certs = this.baseSecurity.certs || [];
        const privateKeys = this.baseSecurity.privateKeys || [];
        const vendor = !!this.baseSecurity.vendor;
        const nodeModules = !!this.baseSecurity.nodeModules;

        // Sistema de puntuación de riesgo (aditivo, basado en evidencia)
        let points = 0;
        const reasons = [];

        const realEnvFiles = envFiles.filter(f => !f.toLowerCase().includes('.example'));
        if (realEnvFiles.length) { points += 2; reasons.push(`${realEnvFiles.length} archivo(s) .env incluido(s) en el ZIP (posibles credenciales)`); }
        if (privateKeys.length) { points += 3; reasons.push(`${privateKeys.length} llave(s) privada(s) detectada(s)`); }
        if (certs.length) { points += 2; reasons.push(`${certs.length} certificado(s) incluido(s)`); }
        if (sqlDumps.length) { points += 2; reasons.push(`${sqlDumps.length} archivo(s) de base de datos/dump SQL incluido(s)`); }
        if (tokensOrCreds.length) { points += 2; reasons.push(`${tokensOrCreds.length} archivo(s) con nombres que sugieren credenciales/tokens`); }
        if (sensitiveConfig.length) { points += 1; reasons.push(`${sensitiveConfig.length} archivo(s) de configuración sensible detectado(s)`); }
        if (backups.length) { points += 1; reasons.push(`${backups.length} archivo(s) de respaldo (.bak/.old) detectado(s)`); }
        if (vendor) { points += 1; reasons.push('carpeta vendor/ incluida en el ZIP (aumenta el tamaño y expone dependencias)'); }
        if (nodeModules) { points += 1; reasons.push('carpeta node_modules/ incluida en el ZIP (aumenta el tamaño y expone dependencias)'); }

        let riskLevel;
        if (points >= 7) riskLevel = 'Crítico';
        else if (points >= 4) riskLevel = 'Alto';
        else if (points >= 2) riskLevel = 'Medio';
        else riskLevel = 'Bajo';

        const riskReason = reasons.length
            ? reasons.join('; ')
            : 'No se detectaron archivos sensibles, credenciales ni dependencias empaquetadas en el ZIP.';

        return {
            // Campos originales se conservan sin tocar en smartAnalyzer (merge),
            // aquí solo se agregan los nuevos:
            backups,
            logs,
            sqlDumps,
            sensitiveConfig,
            tokensOrCreds,
            riskLevel,
            riskReason,
            riskScore: points,
        };
    }
}
