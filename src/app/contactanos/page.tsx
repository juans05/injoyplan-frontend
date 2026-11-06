"use client";
import Image from 'next/image'
import styles from './center.module.css'
import contact from './../../../public/svg/contact.svg'
import { jakarta } from '../../../public/fonts';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ReactModal from 'react-modal';
import { Icon } from '@iconify/react';

const modalStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        transform: 'translate(-50%, -50%)',
        borderRadius: '24px',
        border: 'none',
        padding: '0px',
        maxWidth: '500px',
        width: '90%',
        background: 'transparent',
        boxShadow: 'none',
        overflow: 'visible'
    },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
    },
};

const Center = () => {
    const [formData, setFormData] = useState({
        nombre: '',
        correo: '',
        telefono: '',
        motivoMensaje: '',
        descripcion: '',
        acceptedPolicy: false
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isFormValid, setIsFormValid] = useState(false);

    useEffect(() => {
        // Check if all required fields are filled and policy is accepted
        const isValid =
            formData.nombre.trim() !== '' &&
            formData.correo.trim() !== '' &&
            formData.telefono.trim() !== '' &&
            formData.motivoMensaje !== '' &&
            formData.descripcion.trim() !== '' &&
            formData.acceptedPolicy;

        setIsFormValid(isValid);
    }, [formData]);

    // Bind modal to app element (accessibility)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            ReactModal.setAppElement('body');
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;

        setStatus('loading');
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4201'}/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Error al enviar el mensaje');

            setStatus('success');
            setShowModal(true);
            setFormData({
                nombre: '',
                correo: '',
                telefono: '',
                motivoMensaje: '',
                descripcion: '',
                acceptedPolicy: false
            });
        } catch (error: any) {
            setStatus('error');
            setErrorMessage(error.message);
            alert('Error al enviar: ' + error.message);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setStatus('idle');
    };

    return (
        <div className={styles.contact}>
            <div className="bg-[#F8FAFB] flex justify-center pt-14 items-center">
                <div>
                    <Image className='md:w-full w-7/12' src={contact} alt="contactimg" />
                </div>
                <div>
                    <h3 className='md:text-[38px] text-[27px] text-[#9B292B] font-bold md:ml-10 top-[-25px] relative'>Contáctanos</h3>
                </div>
            </div>
            <div className="mx-auto max-w-[700px] bg-[#fff] mt-16 mb-16 px-5 md:px-0">
                <form onSubmit={handleSubmit}>
                    <h5 className={jakarta.className + ' mb-10 font-bold md:text-[22px] text-[16px]'}>Déjanos un mensaje y pronto nos comunicaremos contigo.</h5>
                    <div className='grid grid-cols-2 gap-x-10 gap-y-5'>
                        <div className='col-start-1 col-end-3'>
                            <label className={jakarta.className + ' font-normal md:text-[17px] text-[14px]  text-[#666]'} htmlFor="nombre"><span className="text-[red]">* </span> Nombre completo</label>
                            <input
                                className='rounded w-full p-2 mt-3 text-[14px] border border-solid border-[#0000001F] outline-none focus:border-[#277FA4]'
                                type="text"
                                id="nombre"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className='col-start-1 col-end-3 md:col-start-1 md:col-end-2'>
                            <label className={jakarta.className + ' font-normal md:text-[17px] text-[14px]  text-[#666]'} htmlFor="correo"><span className="text-[red]">* </span> Correo de contacto</label>
                            <input
                                className='rounded w-full p-2 mt-3 text-[14px] border border-solid border-[#0000001F] outline-none focus:border-[#277FA4]'
                                type="email"
                                id="correo"
                                name="correo"
                                value={formData.correo}
                                onChange={handleChange}
                                placeholder='tucorreo@ejemplo.com'
                                required
                            />
                        </div>
                        <div className='col-start-1 col-end-3 md:col-start-2 md:col-end-3'>
                            <label className={jakarta.className + ' font-normal md:text-[17px] text-[14px]  text-[#666]'} htmlFor="telefono"><span className="text-[red]">* </span> Teléfono</label>
                            <input
                                className='rounded w-full p-2 mt-3 text-[14px] border border-solid border-[#0000001F] outline-none focus:border-[#277FA4]'
                                type="tel"
                                id="telefono"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className='col-start-1 col-end-3 md:col-start-1 md:col-end-2'>
                            <label className={jakarta.className + ' font-normal md:text-[17px] text-[14px]  text-[#666]'} htmlFor="motivoMensaje"><span className="text-[red]">* </span> Motivo del mensaje</label>
                            <select
                                className='rounded w-full p-2 mt-3 text-[14px] border border-solid border-[#0000001F] outline-none focus:border-[#277FA4]'
                                id="motivoMensaje"
                                name="motivoMensaje"
                                value={formData.motivoMensaje}
                                onChange={handleChange}
                                required
                            >
                                <option value="" className='option-ph'>Seleccionar</option>
                                <option value="Consulta" className='option-ph'>Consulta</option>
                                <option value="Sugerencia" className='option-ph'>Sugerencia</option>
                                <option value="Reclamo" className='option-ph'>Reclamo</option>
                            </select>
                        </div>
                        <div className='col-start-1 col-end-3'>
                            <label className={jakarta.className + ' font-normal md:text-[17px] text-[14px]  text-[#666]'} htmlFor="descripcion"><span className="text-[red]">* </span> Descripción</label>
                            <textarea
                                id="descripcion"
                                className='rounded w-full p-2 mt-3 h-40 text-[14px] border border-solid border-[#0000001F] outline-none focus:border-[#277FA4]'
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleChange}
                                required
                            />

                            <div className="mt-5 flex items-start gap-2">
                                <input
                                    type="checkbox"
                                    id="acceptedPolicy"
                                    name="acceptedPolicy"
                                    checked={formData.acceptedPolicy}
                                    onChange={handleChange}
                                    className="mt-1"
                                    required
                                />
                                <label htmlFor="acceptedPolicy" className="text-sm text-[#666]">
                                    He leído y acepto la <Link href="/politicas-privacidad" className="text-[#007FA4] underline">Política de privacidad</Link>
                                </label>
                            </div>

                            <div className='w-full mx-auto justify-center flex mb-10'>
                                <button
                                    className={`rounded-full mt-8 px-20 py-3 text-[#fff] font-bold transition-all duration-300 ${isFormValid
                                            ? 'bg-[#277FA4] hover:bg-[#1f6683] shadow-md hover:shadow-lg transform active:scale-95'
                                            : 'bg-[#D1D3D4] cursor-not-allowed'
                                        }`}
                                    type="submit"
                                    disabled={status === 'loading' || !isFormValid}
                                >
                                    {status === 'loading' ? 'ENVIANDO...' : 'ENVIAR'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <hr />

            <ReactModal
                isOpen={showModal}
                onRequestClose={closeModal}
                style={modalStyles}
                contentLabel="Mensaje Enviado"
                ariaHideApp={false}
            >
                <div className="bg-white rounded-[24px] p-8 md:p-10 flex flex-col items-center text-center relative animate-fadeIn shadow-2xl">
                    <button
                        onClick={closeModal}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <Icon icon="solar:close-circle-bold" width={28} />
                    </button>

                    <div className="w-20 h-20 bg-[#E0F2F7] rounded-full flex items-center justify-center mb-6">
                        <Icon icon="solar:check-circle-bold" className="text-[#277FA4] text-5xl" />
                    </div>

                    <h2 className="text-2xl font-bold text-[#212121] mb-2">¡Mensaje enviado con éxito!</h2>
                    <p className="text-gray-500 mb-8 max-w-sm">
                        Gracias por ponerte en contacto con nosotros. Hemos recibido tu mensaje y te responderemos a la brevedad posible.
                    </p>

                    <button
                        onClick={closeModal}
                        className="bg-[#277FA4] text-white font-bold py-3 px-10 rounded-full shadow-md hover:bg-[#1f6683] transition-all transform active:scale-95"
                    >
                        Entendido
                    </button>
                </div>
            </ReactModal>
        </div>
    )
}

export default Center