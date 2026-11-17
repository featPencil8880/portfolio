// Loads the ordered classic-script modules; shared page state remains compatible.
(function () {
    'use strict';

    const modules = [
        'js/portfolio/foundation.js',
        'js/portfolio/views.js',
        'js/portfolio/editor.js',
        'js/portfolio/photos.js',
        'js/portfolio/resume.js',
        'js/portfolio/notes-survey.js',
        'js/portfolio/content-admin.js',
        'js/portfolio/boot.js'
    ];
    const root = new URL('.', document.currentScript.src);

    function loadModule(index) {
        if (index >= modules.length) return;

        const script = document.createElement('script');
        const url = new URL(modules[index], root).href;
        script.src = url;
        script.onload = () => loadModule(index + 1);
        script.onerror = () => {
            console.error(`Could not load portfolio module: ${url}`);
            const notice = document.createElement('p');
            notice.className = 'noscript-note';
            notice.setAttribute('role', 'alert');
            notice.textContent = 'Part of this page could not load. Please refresh, or contact the site owner.';
            document.querySelector('main')?.prepend(notice);
        };
        document.head.appendChild(script);
    }

    loadModule(0);
})();
