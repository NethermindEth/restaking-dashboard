"use client"

import React from "react";

import Script from "next/script";

const Matomo = () => {
  return (
    <Script>
      {`
        var _paq = window._paq = window._paq || [];
        /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
        _paq.push(["disableCookies"]);
        _paq.push(['trackPageView']);
        _paq.push(['enableLinkTracking']);
        (function() {
          var u="https://nethermind.matomo.cloud/";
          _paq.push(['setTrackerUrl', u+'matomo.php']);
          _paq.push(['setSiteId', '4']);
          var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
          g.async=true; g.src='//cdn.matomo.cloud/nethermind.matomo.cloud/matomo.js'; s.parentNode.insertBefore(g,s);
        })();
      `}
    </Script>
  );
};

export default Matomo;
