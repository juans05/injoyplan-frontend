"use client";

import Script from 'next/script';
import { useCookieStore } from '../../zustand/cookies';

// IMPORTANT: Replace this with your actual Google Analytics Measurement ID
const GA_MEASUREMENT_ID = 'G-EMXFNRVEH5';

export default function ThirdPartyScripts() {
    const { preferences } = useCookieStore();

    return (
        <>
            {/* 
              Only load Analytics scripts if the user has consented to 'analytics' cookies.
              Next.js <Script> component handles insertion into the <head> or <body>.
            */}
            {preferences.analytics && (
                <>
                    {/* Google Analytics via TAG Manager (gtag.js) */}
                    <Script
                        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
                        strategy="afterInteractive"
                    />
                    <Script id="google-analytics" strategy="afterInteractive">
                        {`
                            window.dataLayer = window.dataLayer || [];
                            function gtag(){dataLayer.push(arguments);}
                            gtag('js', new Date());

                            gtag('config', '${GA_MEASUREMENT_ID}');
                        `}
                    </Script>

                    {/* Microsoft Clarity (Heatmaps & Session Recordings) */}
                    <Script id="microsoft-clarity" strategy="afterInteractive">
                        {`
                           (function(c,l,a,r,i,t,y){
                                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                            })(window, document, "clarity", "script", "vvyw8mfa3q");
                        `}
                    </Script>
                </>
            )}

            {/* 
              Example: Advertising Scripts (Facebook Pixel, etc.)
              Only render if preferences.advertising is true
            */}
            {preferences.advertising && (
                <>
                    {/* Add advertising scripts here */}
                </>
            )}
        </>
    );
}
