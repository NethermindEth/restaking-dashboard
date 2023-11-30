"use client"

import React, { useEffect } from 'react';

const Matomo = () => {
    useEffect(() => {
        const loadScript = async () => {
            const scriptContent = `
                var _paq = window._paq = window._paq || [];
                _paq.push(['disableCookies']);
                _paq.push(['trackPageView']);
                _paq.push(['enableLinkTracking']);
                (function () {
                    var u = "https://nethermind.matomo.cloud/";
                    _paq.push(['setTrackerUrl', u + 'matomo.php']);
                    _paq.push(['setSiteId', '4']);
                    var d = document, g = d.createElement('script'), s = d.getElementsByTagName('script')[0];
                    g.async = true; g.src = '//cdn.matomo.cloud/nethermind.matomo.cloud/matomo.js'; s.parentNode.insertBefore(g, s);
                })();`
            const matomoScript = document.createElement('script');
            matomoScript.innerHTML = scriptContent;

            document.head.appendChild(matomoScript);

            return () => {
                document.head.removeChild(matomoScript);
            };
        };

        loadScript();
    }, []);

    return null;
};

export default Matomo;
