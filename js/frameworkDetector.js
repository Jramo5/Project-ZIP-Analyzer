/**
 * frameworkDetector.js
 * Responsabilidad única: ampliar la detección de frameworks del analyzer.js
 * base, incorporando evidencia estructural (carpetas, nombres de archivo),
 * no solo package.json/composer.json.
 */
export class FrameworkDetector {
    constructor(baseResult) {
        this.base = baseResult;
        this.paths = baseResult.fileList.map(f => f.path);
        this.pathsLower = this.paths.map(p => p.toLowerCase());
        this.baseFrameworks = baseResult.frameworks || [];
        this.dependencies = baseResult.dependencies || [];
    }

    has(pattern) {
        const re = pattern instanceof RegExp ? pattern : new RegExp(pattern, 'i');
        return this.pathsLower.some(p => re.test(p));
    }

    depIncludes(name) {
        return this.dependencies.some(d => d.name && d.name.toLowerCase().includes(name.toLowerCase()));
    }

    detect() {
        const found = new Set(this.baseFrameworks);
        const reasons = {};
        const mark = (name, reason) => {
            found.add(name);
            reasons[name] = reason;
        };

        // --- PHP ---
        if (this.has(/(^|\/)artisan$/) || this.has(/bootstrap\/app\.php$/) || this.depIncludes('laravel/framework')) {
            mark('Laravel', 'archivo artisan / bootstrap/app.php / dependencia laravel/framework');
        }
        if (this.has(/config\/bundles\.php$/) || this.has(/src\/kernel\.php$/i) || this.depIncludes('symfony/')) {
            mark('Symfony', 'config/bundles.php, src/Kernel.php o dependencia symfony/*');
        }
        if (this.has(/system\/core\/codeigniter\.php/i) || this.has(/application\/config\/config\.php/i)) {
            mark('CodeIgniter', 'estructura system/core y application/config detectada');
        }
        if (this.has(/config\/bootstrap\.php$/) && this.has(/webroot\/index\.php$/)) mark('CakePHP', 'config/bootstrap.php + webroot/index.php');
        if (this.has(/wp-config\.php$/) || this.has(/wp-includes\/version\.php$/)) mark('WordPress', 'wp-config.php o wp-includes/version.php');
        if (this.has(/core\/lib\/drupal\.php$/i) || this.has(/sites\/default\/settings\.php$/i)) mark('Drupal', 'core/lib/Drupal.php o sites/default/settings.php');
        if (this.has(/administrator\/index\.php$/i) || this.has(/includes\/defines\.php$/i)) mark('Joomla', 'administrator/index.php o includes/defines.php');

        // --- JS/Node ---
        if (this.depIncludes('express') || (this.has(/(^|\/)server\.js$/) && this.has(/routes\//))) mark('Express', 'dependencia express o server.js + routes/');
        if (this.depIncludes('@nestjs/core') || this.has(/nest-cli\.json$/)) mark('NestJS', 'nest-cli.json o dependencia @nestjs/core');
        if (this.depIncludes('next') || this.has(/next\.config\.(js|mjs|ts)$/) || this.has(/(^|\/)pages\/_app\.(js|tsx)$/) || this.has(/(^|\/)app\/layout\.(js|tsx)$/)) mark('NextJS', 'next.config.js, pages/_app o app/layout detectado');
        if (this.depIncludes('nuxt') || this.has(/nuxt\.config\.(js|ts)$/)) mark('Nuxt', 'nuxt.config detectado');
        if (this.depIncludes('react') || this.has(/src\/app\.(jsx|tsx)$/i) || this.has(/\.jsx$/)) mark('React', 'dependencia react o archivos .jsx detectados');
        if (this.depIncludes('vue') || this.has(/\.vue$/) || this.has(/vue\.config\.js$/)) mark('Vue', 'dependencia vue, archivos .vue o vue.config.js');
        if (this.depIncludes('@angular/core') || this.has(/angular\.json$/)) mark('Angular', 'angular.json o dependencia @angular/core');
        if (this.depIncludes('svelte') || this.has(/svelte\.config\.(js|ts)$/) || this.has(/\.svelte$/)) mark('Svelte', 'dependencia svelte, svelte.config o archivos .svelte');

        // --- Python ---
        if (this.depIncludes('fastapi') || (this.has(/main\.py$/) && this.has(/uvicorn/))) mark('FastAPI', 'dependencia fastapi detectada en requirements.txt');
        if (this.depIncludes('flask') || (this.hasFileLike('app.py') && this.has(/templates\//))) mark('Flask', 'dependencia flask o app.py + templates/');
        if (this.hasFileLike('manage.py') && this.has(/settings\.py$/)) mark('Django', 'manage.py + settings.py detectados');

        // --- Java / .NET ---
        if (this.has(/pom\.xml$/) || this.has(/src\/main\/java\//)) mark('Spring Boot', 'pom.xml o estructura src/main/java');
        if (this.has(/startup\.cs$/i) || this.has(/program\.cs$/i) || this.has(/appsettings\.json$/i)) mark('ASP.NET', 'Startup.cs / Program.cs / appsettings.json');

        // --- CSS frameworks (no estaban en analyzer.js base) ---
        if (this.depIncludes('bootstrap') || this.has(/bootstrap(\.min)?\.css$/)) mark('Bootstrap', 'dependencia bootstrap o archivo bootstrap.css incluido');
        if (this.depIncludes('tailwindcss') || this.has(/tailwind\.config\.(js|ts)$/)) mark('Tailwind', 'tailwind.config.js o dependencia tailwindcss');
        if (this.depIncludes('bulma') || this.has(/bulma(\.min)?\.css$/)) mark('Bulma', 'dependencia bulma o archivo bulma.css incluido');
        if (this.depIncludes('foundation-sites') || this.has(/foundation(\.min)?\.css$/)) mark('Foundation', 'dependencia foundation-sites o archivo foundation.css incluido');

        return {
            frameworks: Array.from(found),
            newlyDetected: Array.from(found).filter(f => !this.baseFrameworks.includes(f)),
            reasons,
        };
    }

    hasFileLike(name) {
        return this.pathsLower.some(p => p.split('/').pop() === name.toLowerCase());
    }
}
