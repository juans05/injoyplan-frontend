"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ReactModal from 'react-modal';
import { Icon } from '@iconify/react';
import { useAuthStore } from '@/app/zustand/auth';
import { useFavoriteStore } from '@/app/zustand/favorites';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import Image from 'next/image';
import logo from '../../../../public/svg/logo.svg';
import { ICategoriesState, useCategoriesState } from '@/app/zustand/categories';
import { Category } from '@/app/interfaces/category';
import { ReactSVG } from 'react-svg';

const customStyles = {
    content: {
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        padding: '0',
        border: 'none',
        borderRadius: '0',
        width: '100%',
        height: '100dvh', // Use dvh to avoid address bar issues
        overflow: 'hidden',
        background: '#fff',
        zIndex: 1001,
    },
    overlay: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
    }
};

// Desktop styles overlay
const desktopStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        padding: '0',
        border: 'none',
        borderRadius: '24px',
        maxWidth: '1000px',
        width: '95%',
        maxHeight: '90vh',
        overflow: 'hidden',
        background: '#fff',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        zIndex: 1001,
    },
    overlay: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
    }
};

interface Props {
    openAuth: boolean;
    setOpenAuth: (open: boolean) => void;
    isRegister?: boolean;
    setIsRegister?: (isRegister: boolean) => void;
}

export default function Auth({ openAuth, setOpenAuth, isRegister: isRegisterProp, setIsRegister: setIsRegisterProp }: Props) {
    const [localIsRegister, setLocalIsRegister] = useState(false);
    const isRegister = isRegisterProp ?? localIsRegister;
    const setIsRegister = setIsRegisterProp ?? setLocalIsRegister;
    const { login, signIn, verifyCode, forgotPassword } = useAuthStore();
    const router = useRouter();

    const handleCompleteProfile = async () => {
        setOpenAuth(false);
        if (useAuthStore.getState().auth) {
            await useFavoriteStore.getState().getFavorites();
        }
        router.push('/perfil/editar');
    };

    // Internal state
    const [step, setStep] = useState(0); // 0: Form, 1: Verify, 2: Success

    // ... (rest of state) ...

    // ...

    const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await forgotPassword(email);
        if (result.success) {
            setForgotPasswordSuccess(true);
        }
    };

    // Form fields
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [genero, setGenero] = useState<string | undefined>("Seleccionar");
    const [f_nacimiento, setF_nacimiento] = useState('');
    const [terminoCondiciones, setTerminoCondiciones] = useState(false);
    const [politica, setPolitica] = useState(false);

    // Categories Step
    const { categories, getCategories }: ICategoriesState = useCategoriesState();
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    useEffect(() => {
        if (isRegister) {
            getCategories();
        }
    }, [isRegister]);

    const handleSelectCategory = (categoryId: string) => {
        let updatedCategories;
        if (selectedCategories?.includes(categoryId)) {
            updatedCategories = selectedCategories?.filter(id => id !== categoryId);
        } else {
            updatedCategories = [...selectedCategories, categoryId];
        }
        setSelectedCategories(updatedCategories);
    };

    const handleFinishOnboarding = async () => {
        localStorage.setItem("selectedCategories", JSON.stringify(selectedCategories));
        setOpenAuth(false);
        // Trigger favorites sync after onboarding
        if (useAuthStore.getState().auth) {
            await useFavoriteStore.getState().getFavorites();
        }
    };

    // Verification
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Confetti
    const [showConfetti, setShowConfetti] = useState(false);
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

    // Resend Code Countdown
    const [resendCountdown, setResendCountdown] = useState(0);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (resendCountdown > 0) {
            timer = setInterval(() => {
                setResendCountdown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [resendCountdown]);

    const handleResendCode = async () => {
        if (resendCountdown > 0) return;

        // Restart countdown
        setResendCountdown(60);

        try {
            // Re-trigger signIn to send a new code
            await signIn({
                nombre,
                apellido,
                email,
                password,
                userType: "NORMAL",
                genero: genero === "Seleccionar" ? undefined : genero,
                f_nacimiento,
                terminoCondiciones,
                politica
            });
            // Optional: You could show a small toast here saying "Code resent"
        } catch (error) {
            console.error("Error resending code:", error);
            setResendCountdown(0); // Allow retry if it failed immediately
        }
    };

    // Slider state
    const [currentSlide, setCurrentSlide] = useState(0);
    const slides = [
        {
            image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2940&auto=format&fit=crop',
            title: '¡Crea y vende tu evento con IA!',
            subtitle: '+800 organizadores venden en Injoyplan y confían en nuestra tecnología.'
        },
        {
            image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=2940&auto=format&fit=crop',
            title: 'Conciertos increíbles',
            subtitle: 'Descubre los mejores eventos musicales cerca de ti.'
        },
        {
            image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=2940&auto=format&fit=crop',
            title: 'Experiencias únicas',
            subtitle: 'Teatro, deportes, festivales y mucho más en un solo lugar.'
        }
    ];

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
            setIsMobile(window.innerWidth < 768);

            const handleResize = () => {
                setIsMobile(window.innerWidth < 768);
                setWindowSize({ width: window.innerWidth, height: window.innerHeight });
            };

            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
        ReactModal.setAppElement('body');
    }, []);

    // Auto-slide effect
    useEffect(() => {
        if (!openAuth) return;
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [openAuth, slides.length]);

    // Reset state when closing or switching modes
    useEffect(() => {
        if (!openAuth) {
            handleReset();
        }
    }, [openAuth]);

    useEffect(() => {
        handleReset();
    }, [isRegister]);

    // Forgot Password State
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);

    const handleReset = () => {
        setStep(0);
        setNombre('');
        setApellido('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setGenero('Seleccionar');
        setF_nacimiento('');
        setTerminoCondiciones(false);
        setPolitica(false);
        setOtp(['', '', '', '', '', '']);
        setIsForgotPassword(false);
        setForgotPasswordSuccess(false);
        setLoginError(null);
    };

    // Error state
    const [loginError, setLoginError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError(null);
        const result = await login({ email, password });

        if (result && !result.success) {
            setLoginError(result.message || "Error al iniciar sesión");
            return;
        }

        if (useAuthStore.getState().auth) {
            setOpenAuth(false);
            // Trigger favorites sync after login
            await useFavoriteStore.getState().getFavorites();
        }
    };



    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError(null);

        if (password !== confirmPassword) {
            setLoginError('Las contraseñas no coinciden');
            return;
        }
        if (!terminoCondiciones) {
            setLoginError('Debes aceptar los términos y condiciones');
            return;
        }
        if (!politica) {
            setLoginError('Debes aceptar la política de privacidad');
            return;
        }

        try {
            const resp = await signIn({
                nombre,
                apellido,
                email,
                password,
                userType: "NORMAL",
                genero: genero === "Seleccionar" ? undefined : genero,
                f_nacimiento,
                terminoCondiciones,
                politica
            });

            if (resp && resp.userId) {
                setStep(1); // Move to verification
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length !== 6) return;

        try {
            const success = await verifyCode(email, code);
            if (success) {
                setStep(2); // Go to Success View
                setShowConfetti(true);
                // Do not close modal or reload here. User chooses next action in UI.
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (isNaN(Number(value))) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto focus next
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (!pastedData) return;

        const newOtp = [...otp];
        pastedData.split('').forEach((char, i) => {
            if (i < 6) newOtp[i] = char;
        });
        setOtp(newOtp);

        // Focus last filled
        const nextIndex = Math.min(pastedData.length, 5);
        otpRefs.current[nextIndex]?.focus();
    };

    return (
        <>
            {showConfetti && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2000 }}>
                    <Confetti width={windowSize.width} height={windowSize.height} />
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            {...({
                                className: "bg-white p-8 rounded-3xl shadow-2xl",
                            } as any)}
                        >
                            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Icon icon="solar:check-circle-bold" className="text-green-500 text-6xl" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">¡Bienvenido!</h2>
                            <p className="text-gray-500 mb-6">Tu cuenta ha sido verificada correctamente.</p>
                            <button
                                onClick={() => setShowConfetti(false)}
                                className="bg-[#277FA4] hover:bg-[#206a8a] text-white font-bold py-2 px-6 rounded-full transition-colors"
                            >
                                Continuar
                            </button>
                        </motion.div>
                    </div>
                </div>
            )}

            <ReactModal
                isOpen={openAuth}
                onRequestClose={() => setOpenAuth(false)}
                style={isMobile ? customStyles : desktopStyles}
                ariaHideApp={false}
            >
                <div className="flex h-full font-sans flex-col md:flex-row md:min-h-[600px]">
                    {/* LEFT PANEL (Slider) - Hidden on Step 2 (Success) */}
                    {(!isRegister || step !== 2) && (
                        <div className="hidden md:flex w-1/2 text-white relative bg-[#000] overflow-hidden">
                            {/* Slider Images */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentSlide}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.5 }}
                                    {...({ className: "absolute inset-0" } as any)}
                                >
                                    <Image
                                        src={slides[currentSlide].image}
                                        alt={slides[currentSlide].title}
                                        layout="fill"
                                        objectFit="cover"
                                        className="opacity-70"
                                    />
                                </motion.div>
                            </AnimatePresence>

                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40"></div>

                            <div className="absolute bottom-12 left-8 right-8 z-10">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentSlide}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <h2 className="text-3xl font-bold mb-3 leading-tight">
                                            {slides[currentSlide].title}
                                        </h2>
                                        <p className="text-white/80 text-sm">
                                            {slides[currentSlide].subtitle}
                                        </p>
                                    </motion.div>
                                </AnimatePresence>

                                {/* Pagination Dots */}
                                <div className="flex gap-2 mt-6">
                                    {slides.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentSlide(idx)}
                                            className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/30 hover:bg-white/50'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* RIGHT PANEL (Form) - Full width on Step 2 */}
                    <div className={`w-full ${(!isRegister || step !== 2) ? 'md:w-1/2' : ''} p-6 md:p-12 relative flex flex-col justify-start md:justify-center overflow-y-auto h-full md:max-h-[90vh]`}>

                        <button onClick={() => setOpenAuth(false)} className="absolute top-6 right-6 text-gray-400 hover:text-black z-10">
                            <Icon icon="solar:close-circle-bold" width={24} />
                        </button>

                        {/* CONTENT LOGIC */}
                        <div className="max-w-md mx-auto w-full mt-10 md:mt-0">

                            {/* FORGOT PASSWORD VIEW */}
                            {!isRegister && isForgotPassword && (
                                <form onSubmit={handleForgotPasswordSubmit} className="space-y-5 animate-fadeIn">
                                    {/* Logo */}
                                    <div className="flex justify-start mb-4">
                                        <Image src={logo} alt="Injoyplan" width={40} height={40} />
                                    </div>

                                    {!forgotPasswordSuccess ? (
                                        <>
                                            <div className="mb-8">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsForgotPassword(false)}
                                                    className="flex items-center gap-1 text-[#007FA4] text-sm font-bold mb-4 hover:underline"
                                                >
                                                    <Icon icon="solar:arrow-left-linear" /> Volver
                                                </button>
                                                <h2 className="text-2xl font-bold text-[#212121] mb-2">Recuperar contraseña</h2>
                                                <p className="text-gray-500 text-sm">Ingresa tu correo electrónico para enviarte las instrucciones.</p>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-gray-500 uppercase">Correo electrónico</label>
                                                    <input
                                                        type="email"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#007FA4] focus:ring-1 focus:ring-[#007FA4] transition-all"
                                                        placeholder="ejemplo@correo.com"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="pt-4">
                                                <button type="submit" className="w-full bg-[#277FA4] hover:bg-[#277FA4] text-[#fff] font-bold py-3.5 rounded-full shadow-md hover:shadow-lg transition-all transform active:scale-95 text-sm">
                                                    Enviar instrucciones
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center animate-fadeIn py-4">
                                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <Icon icon="solar:letter-bold" className="text-green-500 text-4xl" />
                                            </div>
                                            <h2 className="text-xl font-bold text-[#212121] mb-2">¡Correo enviado!</h2>
                                            <p className="text-gray-500 text-sm mb-6">
                                                Hemos enviado las instrucciones para recuperar tu contraseña a <span className="font-bold">{email}</span>. Revisa tu bandeja de entrada o spam.
                                            </p>
                                            <div className="space-y-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsForgotPassword(false)}
                                                    className="w-full bg-[#277FA4] hover:bg-[#277FA4] text-[#fff] font-bold py-3.5 rounded-full shadow-md hover:shadow-lg transition-all transform active:scale-95 text-sm"
                                                >
                                                    Volver a iniciar sesión
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </form>
                            )}

                            {/* LOGIN */}
                            {!isRegister && !isForgotPassword && (
                                <form onSubmit={handleLogin} className="space-y-5 animate-fadeIn">
                                    {/* Logo */}
                                    <div className="flex justify-start mb-4">
                                        <Image src={logo} alt="Injoyplan" width={40} height={40} />
                                    </div>

                                    <div>
                                        <h2 className="text-2xl font-bold text-[#212121] mb-2">Inicia Sesión</h2>
                                        <p className="text-gray-500 text-sm">Por favor, ingresa tus datos.</p>
                                    </div>

                                    {loginError && (
                                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 flex items-center gap-2 animate-fadeIn mt-4">
                                            <Icon icon="solar:danger-circle-bold" width={20} />
                                            {loginError}
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Correo electrónico</label>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#007FA4] focus:ring-1 focus:ring-[#007FA4] transition-all"
                                                placeholder="ejemplo@correo.com"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Contraseña</label>
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#007FA4] focus:ring-1 focus:ring-[#007FA4] transition-all"
                                                placeholder="••••••••"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => setIsForgotPassword(true)}
                                            className="text-xs font-bold text-[#007FA4] hover:underline"
                                        >
                                            ¿Olvidaste tu contraseña?
                                        </button>
                                    </div>

                                    <button type="submit" className="w-full bg-[#277FA4] hover:bg-[#277FA4] text-[#fff] font-bold py-3.5 rounded-full shadow-md hover:shadow-lg transition-all transform active:scale-95 text-sm">
                                        Continuar
                                    </button>

                                    <div className="text-center mt-6">
                                        <p className="text-sm text-gray-500">
                                            ¿Aún no tienes cuenta? <button type="button" onClick={() => setIsRegister(true)} className="text-[#007FA4] font-bold hover:underline">Regístrate</button>
                                        </p>
                                    </div>
                                </form>
                            )}

                            {/* REGISTER STEP 0 */}
                            {isRegister && step === 0 && (
                                <form onSubmit={handleRegisterSubmit} className="space-y-5 animate-fadeIn">
                                    {/* Logo */}
                                    <div className="flex justify-start mb-4">
                                        <Image src={logo} alt="Injoyplan" width={40} height={40} />
                                    </div>

                                    <div>
                                        <h2 className="text-2xl font-bold text-[#212121] mb-2">Regístrate</h2>
                                        <p className="text-gray-500 text-sm">Ingresa tus datos para comenzar.</p>
                                    </div>

                                    {loginError && (
                                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 flex items-center gap-2 animate-fadeIn mt-4">
                                            <Icon icon="solar:danger-circle-bold" width={20} />
                                            {loginError}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Nombre</label>
                                            <input
                                                value={nombre}
                                                onChange={(e) => setNombre(e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#007FA4]"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Apellidos</label>
                                            <input
                                                value={apellido}
                                                onChange={(e) => setApellido(e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#007FA4]"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Correo electrónico</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#007FA4]"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Contraseña</label>
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#007FA4]"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Confirmar Contraseña</label>
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#007FA4]"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">F. Nacimiento</label>
                                            <input
                                                type="date"
                                                value={f_nacimiento}
                                                onChange={(e) => setF_nacimiento(e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#007FA4]"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Género</label>
                                            <select
                                                value={genero}
                                                onChange={(e) => setGenero(e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#007FA4]"
                                            >
                                                <option>Seleccionar</option>
                                                <option>Masculino</option>
                                                <option>Femenino</option>
                                                <option>Otro</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mt-4">
                                        <div className="flex items-start gap-3">
                                            <div className="flex items-center h-5">
                                                <input
                                                    id="terms"
                                                    type="checkbox"
                                                    checked={terminoCondiciones}
                                                    onChange={(e) => setTerminoCondiciones(e.target.checked)}
                                                    className="w-4 h-4 text-[#00DFD1] border-gray-300 rounded focus:ring-[#00DFD1]"
                                                />
                                            </div>
                                            <div className="ml-0 text-xs">
                                                <label htmlFor="terms" className="font-medium text-gray-700">
                                                    Declaro que he leído y acepto los <a href="/terminos-y-condiciones" target="_blank" className="text-[#007FA4] font-bold hover:underline">Términos y Condiciones</a>, la <a href="/politicas-cookies" target="_blank" className="text-[#007FA4] font-bold hover:underline">Política de cookies</a> y la <a href="/politicas-privacidad" target="_blank" className="text-[#007FA4] font-bold hover:underline">Política de privacidad</a> y autorizo el tratamiento de mis datos personales para la prestación del servicio ofrecido por esta plataforma
                                                </label>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="flex items-center h-5">
                                                <input
                                                    id="policy"
                                                    type="checkbox"
                                                    checked={politica}
                                                    onChange={(e) => setPolitica(e.target.checked)}
                                                    className="w-4 h-4 text-[#00DFD1] border-gray-300 rounded focus:ring-[#00DFD1]"
                                                />
                                            </div>
                                            <div className="ml-0 text-xs">
                                                <label htmlFor="policy" className="font-medium text-gray-700">
                                                    Autorizo el uso de mis datos personales para recibir información, ofertas, promociones o contenido publicitario o comercial relacionado con esta web, Injoyplan y sus vinculados
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <button type="submit" className="w-full bg-[#277FA4] hover:bg-[#277FA4] text-[#fff] font-bold py-3.5 rounded-full shadow-md hover:shadow-lg transition-all transform active:scale-95 text-sm">
                                        Continuar
                                    </button>

                                    <div className="text-center mt-6">
                                        <p className="text-sm text-gray-500">
                                            ¿Ya tienes cuenta? <button type="button" onClick={() => setIsRegister(false)} className="text-[#007FA4] font-bold hover:underline">Inicia Sesión</button>
                                        </p>
                                    </div>
                                </form>
                            )}

                            {/* REGISTER STEP 1 (VERIFY) */}
                            {isRegister && step === 1 && (
                                <form onSubmit={handleVerifyCode} className="space-y-6 animate-fadeIn">
                                    <div className="mb-8">
                                        <button
                                            type="button"
                                            onClick={() => setStep(0)}
                                            className="flex items-center gap-1 text-[#007FA4] text-sm font-bold mb-4 hover:underline"
                                        >
                                            <Icon icon="solar:arrow-left-linear" /> Volver
                                        </button>

                                        <h2 className="text-2xl font-bold text-[#212121] mb-2">Verifica tu email</h2>
                                        <p className="text-gray-500 text-sm">
                                            Hemos enviado un código de verificación a: <br />
                                            <span className="font-bold text-[#212121]">{email}</span>
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase block">Ingresa el código</label>
                                        <div className="flex gap-2">
                                            {otp.map((digit, idx) => (
                                                <input
                                                    key={idx}
                                                    ref={(el) => {
                                                        otpRefs.current[idx] = el;
                                                    }}
                                                    type="text"
                                                    maxLength={1}
                                                    value={digit}
                                                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                                                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                                    onPaste={handleOtpPaste}
                                                    className="flex-1 min-w-0 max-w-[48px] h-12 border border-gray-300 rounded-lg text-center text-xl font-bold focus:outline-none focus:border-[#007FA4] focus:ring-1 focus:ring-[#007FA4] transition-all"
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={otp.join('').length !== 6}
                                        className={`w-full font-bold py-3.5 rounded-xl shadow-md transition-all transform active:scale-95 text-sm ${otp.join('').length === 6
                                            ? 'bg-[#00DFD1] hover:bg-[#00c9bd] text-[#004e4e] hover:shadow-lg'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        Verificar mi cuenta
                                    </button>

                                    <p className="text-center text-xs text-gray-500 mt-4">
                                        ¿No recibiste el código?{" "}
                                        <button
                                            type="button"
                                            onClick={handleResendCode}
                                            disabled={resendCountdown > 0}
                                            className={`font-bold hover:underline ${resendCountdown > 0 ? "text-gray-400 cursor-not-allowed" : "text-[#007FA4]"
                                                }`}
                                        >
                                            {resendCountdown > 0 ? `Reenviar en ${resendCountdown}s` : "Reenviar"}
                                        </button>
                                    </p>
                                </form>
                            )}

                            {/* SUCCESS STEP (Verified) */}
                            {isRegister && step === 2 && (
                                <div className="text-center animate-fadeIn py-10">
                                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Image src={logo} width={100} height={100} alt="Logo" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-[#212121] mb-2">¡Bienvenido a Injoyplan!</h2>
                                    <p className="text-gray-500 text-sm mb-8 px-4">
                                        Tu perfil ha sido creado con éxito.<br />
                                        Solo necesitamos algunos datos más para completarlo al 100%. ¿Te gustaría añadirlos ahora?
                                    </p>

                                    <div className="space-y-4 max-w-xs mx-auto relative z-10">
                                        <button
                                            onClick={handleCompleteProfile}
                                            className="w-full bg-[#277FA4] hover:bg-[#00c9bd] text-[#fff] font-bold py-3.5 rounded-full shadow-md hover:shadow-lg transition-all transform active:scale-95 text-sm"
                                        >
                                            Completar mi perfil
                                        </button>
                                        <button
                                            onClick={() => setStep(3)} // Go to Interests Step
                                            className="w-full text-[#007FA4] font-bold py-2 hover:underline text-sm"
                                        >
                                            Seleccionar mis gustos
                                        </button>
                                        <button
                                            onClick={async () => {
                                                setOpenAuth(false);
                                                // Trigger favorites sync
                                                if (useAuthStore.getState().auth) {
                                                    await useFavoriteStore.getState().getFavorites();
                                                }
                                            }}
                                            className="w-full text-gray-400 font-bold py-1 hover:underline text-xs"
                                        >
                                            Explorar eventos
                                        </button>
                                    </div>

                                    {/* Confetti integrated here */}
                                    {showConfetti && (
                                        <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden rounded-2xl">
                                            <img
                                                src="https://usagif.com/wp-content/uploads/gify/confetti-holiday-cheer.gif"
                                                alt="Celebration"
                                                className="w-full h-full object-cover opacity-50"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* INTERESTS STEP (Step 3) */}
                            {isRegister && step === 3 && (
                                <div className="animate-fadeIn w-full">
                                    <div className="text-center mb-6">
                                        <h2 className="text-2xl font-bold text-[#212121] mb-2">¡Queremos conocerte!</h2>
                                        <p className="text-gray-500 text-sm">Elige tus intereses para personalizar tu experiencia.</p>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto p-2 scrollbar-hide">
                                        {categories?.map((item: Category) => (
                                            <div
                                                key={item.idCategorias}
                                                onClick={() => handleSelectCategory(item.idCategorias.toString())}
                                                className={`cursor-pointer rounded-xl p-3 flex flex-col items-center justify-center transition-all ${selectedCategories?.includes(item?.idCategorias?.toString())
                                                    ? "bg-[#861F21] text-white shadow-md transform scale-105"
                                                    : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                                                    }`}
                                            >
                                                <div className="w-10 h-10 mb-2">
                                                    <ReactSVG
                                                        src={item.iconos}
                                                        beforeInjection={(svg) => {
                                                            svg.setAttribute('style', 'width: 100%; height: 100%;');
                                                            svg.querySelector('path')?.setAttribute('fill', selectedCategories?.includes(item.idCategorias.toString()) ? '#fff' : '#666');
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-xs font-bold text-center leading-tight">{item.nombreCategoria}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-8 space-y-3">
                                        <button
                                            onClick={handleFinishOnboarding}
                                            className="w-full bg-[#277FA4] text-white font-bold py-3.5 rounded-full shadow-md hover:shadow-lg transition-all transform active:scale-95 text-sm"
                                        >
                                            Finalizar
                                        </button>
                                        <button
                                            onClick={handleFinishOnboarding}
                                            className="w-full text-[#007FA4] font-bold text-xs hover:underline block text-center"
                                        >
                                            Omitir por ahora
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </ReactModal>
        </>
    );
}