"use client";
import Header from "./ui/Header";
import Footer from "./ui/Footer";
import { useEffect } from "react";

import Alert from "./components/Alert";
import CookieConsentBanner from "./components/CookieConsentBanner";
import ThirdPartyScripts from "./components/ThirdPartyScripts";

import { usePathname } from "next/navigation";

import { useAuthStore } from "./zustand/auth";
import { useFavoriteStore } from "./zustand/favorites";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin');

    const { me, auth } = useAuthStore();
    const { getFavorites } = useFavoriteStore();

    // Restore the session on app mount
    useEffect(() => {
        if (localStorage.getItem('token')) me();
    }, []);

    useEffect(() => {
        if (auth) getFavorites();
    }, [auth]);

    // A modal left open across navigation would keep the background blurred
    useEffect(() => {
        document.body.classList.remove('ReactModal__Body--open');
    }, [pathname]);

    return (
        <>
            <ThirdPartyScripts />
            <div className="app-shell overflow-x-clip">
                <Alert />
                {!isAdmin && <Header />}
                {/* admin renders its own <main> */}
                {isAdmin ? children : <main id="contenido">{children}</main>}
                {!isAdmin && <Footer />}
            </div>
            <CookieConsentBanner />
        </>
    );
}
