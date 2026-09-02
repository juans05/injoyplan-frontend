"use client";
import "./globals.css";
import Header from "./ui/Header";
import Footer from "./ui/Footer";
import { useEffect, useState } from "react";

import Alert from "./components/Alert";
import CookieConsentBanner from "./components/CookieConsentBanner";
import ThirdPartyScripts from "./components/ThirdPartyScripts";

import { usePathname } from "next/navigation";

import { useAuthStore } from "./zustand/auth";
import { useFavoriteStore } from "./zustand/favorites";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const { me, auth } = useAuthStore();
    const { getFavorites } = useFavoriteStore();

    // Initialize auth and favorites on app mount
    useEffect(() => {
        const initializeApp = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    await me(); // Fetch current user
                } catch (error) {
                    console.error('Failed to initialize user:', error);
                }
            }
        };
        initializeApp();
    }, []);

    // Fetch favorites whenever auth user is available
    useEffect(() => {
        if (auth) {
            getFavorites();
        }
    }, [auth]);

    // Reset modal state on route change to prevent stuck blur effect
    useEffect(() => {
        setIsModalOpen(false);
        document.body.classList.remove('ReactModal__Body--open'); // Force cleanup
    }, [pathname]);

    useEffect(() => {
        const checkModalClass = () => {
            const modalElements = document.getElementsByClassName("ReactModal__Body--open");
            setIsModalOpen(modalElements.length > 0);
        };

        checkModalClass();
        const observer = new MutationObserver(checkModalClass);
        // react-modal toggles ReactModal__Body--open by mutating body's class attribute directly,
        // not by adding/removing child nodes — attributes must be observed or the class removal
        // (e.g. on login success closing the Auth modal) can be missed, leaving the blur stuck on.
        observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    return (
        <>
            <ThirdPartyScripts />
            <div className={isModalOpen ? "blur-background" : "overflow-hidden"}>
                <Alert />
                {!isAdmin && <Header />}
                {children}
                {!isAdmin && <Footer />}
            </div>
            <CookieConsentBanner />
        </>
    );
}