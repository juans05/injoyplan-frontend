"use client";
import { useState, useEffect } from 'react';
import type { jsPDF as JsPDF } from 'jspdf';
import styles from './book.module.css';
import libro from './../../../public/svg/claims.svg';
import Image from 'next/image';
import Modal from 'react-modal';
import { Icon } from '@iconify/react';
import ubigeoDataRaw from '@/data/ubigeo.json';

const ubigeoData = ubigeoDataRaw as unknown as { [key: string]: { [key: string]: string[] } };

const modalStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        padding: '0',
        borderRadius: '16px',
        border: 'none',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
        backgroundColor: '#fff',
        maxWidth: '400px',
        width: '90%',
        overflow: 'hidden',
    },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(5px)',
        zIndex: 1000,
    },
};

const SuccessModal = ({ isOpen, onClose, data }: { isOpen: boolean; onClose: () => void; data: any }) => {
    const generatePDF = async () => {
        if (!data) return;
        // jspdf is ~130 kB: only load it when the user downloads the PDF
        const { jsPDF } = await import('jspdf');
        const doc: JsPDF = new jsPDF();

        // Helper to draw cell with label and value
        const drawCell = (x: number, y: number, w: number, h: number, label: string, value: string = '') => {
            doc.rect(x, y, w, h);
            doc.setFontSize(8);
            doc.setFont("helvetica", "bold");
            doc.text(label, x + 2, y + 5);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            // Simple truncation or primitive wrap for value
            // proper wrapping would require doc.splitTextToSize logic handled outside or complexly here
            // For now, let's assume one line or basic wrap if needed, but keeping it simple for "value" cells
            if (value) {
                const splitVal = doc.splitTextToSize(value, w - 4);
                doc.text(splitVal, x + 2, y + 10);
            }
        };

        const startX = 15;
        const endX = 195;
        const width = endX - startX;
        let y = 15;

        // --- HEADER ---
        // Left Box: Company Info
        doc.rect(startX, y, width / 2, 30);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text('INJOYPLAN S.A.C.', startX + 5, y + 10);
        doc.setFontSize(10);
        doc.text('RUC: 20603074956', startX + 5, y + 18);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text('Dirección: Jr. Los Mirtos 310, Lince', startX + 5, y + 25);

        // Right Box: Hoja Info
        doc.rect(startX + (width / 2), y, width / 2, 30);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text('HOJA DE RECLAMACIÓN', startX + (width / 2) + 5, y + 8);
        doc.setFontSize(10);
        doc.text(`Nº: ${data.idReclamo ? data.idReclamo.substring(0, 8) : 'PENDIENTE'}`, startX + (width / 2) + 5, y + 18);
        const dateObj = new Date();
        doc.text(`Fecha: ${dateObj.toLocaleDateString()}`, startX + (width / 2) + 5, y + 26);

        y += 35; // Spacing

        // --- 1. IDENTIFICACIÓN DEL CONSUMIDOR ---
        doc.setFillColor(220, 220, 220);
        doc.rect(startX, y, width, 8, 'F');
        doc.rect(startX, y, width, 8);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text('1. IDENTIFICACIÓN DEL CONSUMIDOR RECLAMANTE', startX + 2, y + 6);
        y += 8;

        // Row 1: Nombre
        const hRow = 14;
        drawCell(startX, y, width, hRow, "Nombre del Consumidor:", data.consumerName);
        y += hRow;

        // Row 2: Domicilio
        drawCell(startX, y, width, hRow, "Domicilio:", data.consumerAddress);
        y += hRow;

        // Row 3: DNI + Tel + Email
        const w3 = width / 3;
        drawCell(startX, y, w3, hRow, `${data.consumerDocType}:`, data.consumerDocNumber);
        drawCell(startX + w3, y, w3, hRow, "Teléfono:", data.consumerPhone);
        drawCell(startX + (w3 * 2), y, w3, hRow, "Email:", data.consumerEmail);
        y += hRow;

        // Minor Section
        if (data.isMinor) {
            const hMinor = 14;
            drawCell(startX, y, width, hMinor, "Padre/Madre/Apoderado (Menor de edad):", data.repName);
            y += hMinor;
        }

        y += 5;

        // --- 2. IDENTIFICACIÓN DEL BIEN CONTRATADO ---
        doc.setFillColor(220, 220, 220);
        doc.rect(startX, y, width, 8, 'F');
        doc.rect(startX, y, width, 8);
        doc.setFont("helvetica", "bold");
        doc.text('2. IDENTIFICACIÓN DEL BIEN CONTRATADO', startX + 2, y + 6);
        y += 8;

        // Main Container for 2
        // Row 1: Tipo Checkboxes + Monto
        const hProd = 12;
        doc.rect(startX, y, width * 0.4, hProd);
        doc.text(`[ ${data.goodType === 'PRODUCTO' ? 'X' : ' '} ] PRODUCTO    [ ${data.goodType === 'SERVICIO' ? 'X' : ' '} ] SERVICIO`, startX + 5, y + 8);

        drawCell(startX + (width * 0.4), y, width * 0.6, hProd, "Monto Reclamado:", `S/ ${data.claimAmount}`);
        y += hProd;

        // Row 2: Description
        const hDesc = 20;
        drawCell(startX, y, width, hDesc, "Descripción:", data.goodDescription);
        y += hDesc;

        y += 5;

        // --- 3. DETALLE DE LA RECLAMACIÓN ---
        doc.setFillColor(220, 220, 220);
        doc.rect(startX, y, width, 8, 'F');
        doc.rect(startX, y, width, 8);
        doc.setFont("helvetica", "bold");
        doc.text('3. DETALLE DE LA RECLAMACIÓN Y PEDIDO DEL CONSUMIDOR', startX + 2, y + 6);
        y += 8;

        // Type
        const hType = 12;
        doc.rect(startX, y, width, hType);
        doc.text(`[ ${data.claimType === 'RECLAMO' ? 'X' : ' '} ] RECLAMO   [ ${data.claimType === 'QUEJA' ? 'X' : ' '} ] QUEJA`, startX + 5, y + 8);
        y += hType;

        // Detail
        const hDet = 40;
        drawCell(startX, y, width, hDet, "Detalle:", data.claimDetail);
        y += hDet;

        // Request
        const hReq = 30;
        drawCell(startX, y, width, hReq, "Pedido:", data.orderRequest);
        y += hReq;

        y += 5;

        // Footer: Firmas
        const hSig = 30;
        doc.rect(startX, y, width / 2, hSig); // Firma Consumidor
        doc.rect(startX + (width / 2), y, width / 2, hSig); // Firma Empresa

        doc.setFontSize(8);
        doc.text("Firma del Consumidor", startX + 5, y + 5);
        doc.text("Firma del Proveedor", startX + (width / 2) + 5, y + 5);

        y += hSig + 5;

        // Legal Text
        doc.setFontSize(6);
        doc.setTextColor(80, 80, 80);
        const legal = "RECLAMO: Disconformidad relacionada a los productos o servicios.\nQUEJA: Disconformidad no relacionada a los productos o servicios; o, malestar o descontento respecto a la atención al público.";
        const splitLegal = doc.splitTextToSize(legal, width);
        doc.text(splitLegal, startX, y);

        doc.save(`Reclamo_${data.idReclamo || 'Injoyplan'}.pdf`);
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            style={modalStyles}
            contentLabel="Reclamación Enviada"
            ariaHideApp={false}
        >
            <div className="flex flex-col items-center justify-center p-8 text-center bg-white">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <Icon icon="line-md:confirm-circle" className="text-green-500 text-5xl" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2 font-poppins">¡Registrado!</h2>
                <p className="text-gray-600 mb-8 font-medium leading-relaxed">
                    Su hoja de reclamación ha sido registrada correctamente. Hemos enviado una copia a su correo.
                </p>
                <div className="w-full flex flex-col gap-3">
                    <button
                        onClick={generatePDF}
                        className="bg-[#277FA4] text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-[#1f6683] transition-all w-full uppercase tracking-wide flex items-center justify-center gap-2"
                    >
                        <Icon icon="solar:file-download-bold" /> Imprimir PDF
                    </button>
                    <button
                        onClick={onClose}
                        className="border border-[#277FA4] text-[#277FA4] font-bold py-3 px-8 rounded-full hover:bg-gray-50 transition-all w-full uppercase tracking-wide"
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </Modal>
    )
};

const ClaimsBook = () => {
    const [isMinor, setIsMinor] = useState(false);
    const [formData, setFormData] = useState({
        // Consumer
        consumerName: '',
        consumerDocType: '',
        consumerDocNumber: '',
        consumerAddress: '',
        consumerDepartment: '',
        consumerProvince: '',
        consumerDistrict: '',
        consumerPhone: '',
        consumerEmail: '',
        // Minor Rep
        repName: '',
        repDocType: '',
        repDocNumber: '',
        repAddress: '',
        repDepartment: '',
        repProvince: '',
        repDistrict: '',
        repPhone: '',
        repEmail: '',
        // Good
        goodType: '', // 'PRODUCTO' | 'SERVICIO'
        claimAmount: '',
        goodDescription: '',
        // Claim
        claimType: 'RECLAMO', // Default or empty?
        claimDetail: '',
        orderRequest: ''
    });

    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [showModal, setShowModal] = useState(false);
    const [isFormValid, setIsFormValid] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [submittedData, setSubmittedData] = useState<any>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };

            // Logic for cascading selects - Consumer
            if (name === 'consumerDepartment') {
                newData.consumerProvince = '';
                newData.consumerDistrict = '';
            } else if (name === 'consumerProvince') {
                newData.consumerDistrict = '';
            }

            // Logic for cascading selects - Representative
            if (name === 'repDepartment') {
                newData.repProvince = '';
                newData.repDistrict = '';
            } else if (name === 'repProvince') {
                newData.repDistrict = '';
            }

            return newData;
        });
    };

    // Location Data Types
    type UbigeoData = {
        [department: string]: {
            [province: string]: string[];
        };
    };

    // Import JSON (assuming it's handled by Next.js/Webpack, strictly we should use 'import' at top, but require works inline or move import up)
    // Moving import to top is cleaner, but for this tool usage, I'll use a require or assume I added the import. 
    // Wait, I cannot add import at top with this replace block easily if I don't touch top.
    // I will use a constant here for now or assuming I edit the top in another Step? 
    // Actually, I can use 'require' or just paste the data if small? No, I made a file.
    // Let's modify the top of the file in a separate step or just use 'require' here if compatible.

    // BETTER APPROACH: explicit lists derived from formData and the imported JSON.
    // I need to add the import at the top. I will do that in a separate 'replace' or included here if I can view top.
    // I viewed top before. I will try to add the import in a separate call or use a 'lazy' load.
    // Let's assume I will add `import ubigeo from '@/data/ubigeo.json';` at the top in the next step.

    // For now, define the derived lists based on formData:

    const departments = Object.keys(ubigeoData);

    const provinces = formData.consumerDepartment && ubigeoData[formData.consumerDepartment as keyof typeof ubigeoData]
        ? Object.keys(ubigeoData[formData.consumerDepartment as keyof typeof ubigeoData])
        : [];

    const districts = formData.consumerProvince && formData.consumerDepartment && ubigeoData[formData.consumerDepartment as keyof typeof ubigeoData]
        ? ubigeoData[formData.consumerDepartment][formData.consumerProvince] || []
        : [];

    // Representative lists
    const repDepartments = departments;

    const repProvinces = formData.repDepartment && ubigeoData[formData.repDepartment as keyof typeof ubigeoData]
        ? Object.keys(ubigeoData[formData.repDepartment as keyof typeof ubigeoData])
        : [];

    const repDistricts = formData.repProvince && formData.repDepartment && ubigeoData[formData.repDepartment as keyof typeof ubigeoData]
        ? ubigeoData[formData.repDepartment][formData.repProvince] || []
        : [];

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsMinor(e.target.checked);
    };

    useEffect(() => {
        // Validate form
        const requiredFields = [
            formData.consumerName,
            formData.consumerDocType,
            formData.consumerDocNumber,
            // formData.consumerAddress, // Optional
            // formData.consumerDepartment, // Optional
            // formData.consumerProvince, // Optional
            // formData.consumerDistrict, // Optional
            // formData.consumerPhone, // Optional
            // formData.consumerEmail, // Optional
            formData.goodType,
            formData.claimAmount,
            formData.goodDescription,
            formData.claimType,
            formData.claimDetail,
            formData.orderRequest
        ];

        let isValid = requiredFields.every(field => field && field.trim() !== '');

        if (isMinor) {
            const minorFields = [
                formData.repName,
                formData.repDocType,
                formData.repDocNumber,
                formData.repAddress,
                formData.repDepartment,
                formData.repProvince,
                formData.repDistrict,
                formData.repPhone,
                formData.repEmail
            ];
            const isMinorValid = minorFields.every(field => field && field.trim() !== '');
            isValid = isValid && isMinorValid;
        }

        setIsFormValid(isValid);
    }, [formData, isMinor]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;

        setStatus('loading');
        setErrorMessage('');

        try {
            const payload = {
                ...formData,
                isMinor,
                claimAmount: parseFloat(formData.claimAmount),
            };

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4201';
            const response = await fetch(`${apiUrl}/complaints`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al enviar la reclamación');
            }

            setStatus('success');
            setSubmittedData({ ...payload, idReclamo: (await response.clone().json()).id || 'PENDIENTE' });
            setShowModal(true);
            setFormData({
                consumerName: '', consumerDocType: '', consumerDocNumber: '', consumerAddress: '', consumerDepartment: '', consumerProvince: '', consumerDistrict: '', consumerPhone: '', consumerEmail: '',
                repName: '', repDocType: '', repDocNumber: '', repAddress: '', repDepartment: '', repProvince: '', repDistrict: '', repPhone: '', repEmail: '',
                goodType: '', claimAmount: '', goodDescription: '',
                claimType: 'RECLAMO', claimDetail: '', orderRequest: ''
            });
            setIsMinor(false);
        } catch (error: any) {
            setStatus('error');
            setErrorMessage(error.message);
        } finally {
            if (status !== 'success') setStatus('idle'); // Prevent overwrite if success
        }
    };

    const [currentDate, setCurrentDate] = useState<string>("");

    useEffect(() => {
        setCurrentDate(new Date().toLocaleDateString());
    }, []);

    const closeModal = () => {
        setShowModal(false);
        setStatus('idle');
    };

    return (
        <div className={styles.book}>
            <div className="max-w-screen-md mx-auto">
                <div>
                    <Image src={libro} className='mx-auto mt-20' alt="libroimg" />
                    <div className="text-center my-6">
                        <h3 className="text-[#952F2E] text-2xl font-bold text-center">Libro de reclamaciones virtual</h3>
                    </div>
                    <p>Conforme a lo establecido en el Código de Protección y Defensa del Consumidor esta institución cuenta con un Libro de Reclamaciones a tu disposición.</p>
                    <div className="flex justify-between items-center my-6">
                        <strong>INJOYPLAN S.A.C. <br />RUC N° 20603074956</strong>
                        <span>Fecha: {currentDate}</span>
                    </div>
                </div>
                <hr />
                <div className={styles.form_wrapper}>
                    <form onSubmit={handleSubmit}>
                        <h5 className='font-bold text-xl mt-10 uppercase'>Datos del Consumidor</h5>
                        {/* Consumer Form Fields */}
                        <div className='space-y-6 mt-6'>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Row 1: Nombre completo (Full Width) */}
                                <div className="md:col-span-2">
                                    <label htmlFor="consumerName" className="block text-gray-500 mb-2">
                                        <span className="text-red-500">* </span> Nombre completo
                                    </label>
                                    <input
                                        type="text"
                                        id="consumerName"
                                        name="consumerName"
                                        value={formData.consumerName}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full border border-gray-200 rounded p-2 focus:outline-none focus:border-gray-400"
                                    />
                                </div>

                                {/* Row 2: Tipo de documento & Número */}
                                <div>
                                    <label htmlFor="consumerDocType" className="block text-gray-500 mb-2">
                                        <span className="text-red-500">* </span> Tipo de documento
                                    </label>
                                    <select
                                        id="consumerDocType"
                                        name="consumerDocType"
                                        value={formData.consumerDocType}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full border border-gray-200 rounded p-2 focus:outline-none focus:border-gray-400 bg-white"
                                    >
                                        <option value="">Seleccionar</option>
                                        <option value="DNI">DNI</option>
                                        <option value="CE">Carnet de Extranjería</option>
                                        <option value="PASAPORTE">Pasaporte</option>
                                        <option value="RUC">RUC</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="consumerDocNumber" className="block text-gray-500 mb-2">
                                        <span className="text-red-500">* </span> Número de documento
                                    </label>
                                    <input
                                        type="text"
                                        id="consumerDocNumber"
                                        name="consumerDocNumber"
                                        value={formData.consumerDocNumber}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full border border-gray-200 rounded p-2 focus:outline-none focus:border-gray-400"
                                    />
                                </div>

                                {/* Row 3: Domicilio & Departamento */}
                                <div>
                                    <label htmlFor="consumerAddress" className="block text-gray-500 mb-2">
                                        Domicilio
                                    </label>
                                    <input
                                        type="text"
                                        id="consumerAddress"
                                        name="consumerAddress"
                                        value={formData.consumerAddress}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-200 rounded p-2 focus:outline-none focus:border-gray-400"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="consumerDepartment" className="block text-gray-500 mb-2">
                                        Departamento
                                    </label>
                                    <select
                                        id="consumerDepartment"
                                        name="consumerDepartment"
                                        value={formData.consumerDepartment}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-200 rounded p-2 focus:outline-none focus:border-gray-400 bg-white"
                                    >
                                        <option value="">Seleccionar</option>
                                        {departments.map((dep) => (
                                            <option key={dep} value={dep}>{dep}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Row 4: Provincia & Distrito */}
                                <div>
                                    <label htmlFor="consumerProvince" className="block text-gray-500 mb-2">
                                        Provincia
                                    </label>
                                    <select
                                        id="consumerProvince"
                                        name="consumerProvince"
                                        value={formData.consumerProvince}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-200 rounded p-2 focus:outline-none focus:border-gray-400 bg-white"
                                    >
                                        <option value="">Seleccionar</option>
                                        {provinces.map((prov) => (
                                            <option key={prov} value={prov}>{prov}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="consumerDistrict" className="block text-gray-500 mb-2">
                                        Distrito
                                    </label>
                                    <select
                                        id="consumerDistrict"
                                        name="consumerDistrict"
                                        value={formData.consumerDistrict}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-200 rounded p-2 focus:outline-none focus:border-gray-400 bg-white"
                                    >
                                        <option value="">Seleccionar</option>
                                        {districts.map((dist) => (
                                            <option key={dist} value={dist}>{dist}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Row 5: Celular & Email */}
                                <div>
                                    <label htmlFor="consumerPhone" className="block text-gray-500 mb-2">
                                        Celular/Teléfono
                                    </label>
                                    <input
                                        type="tel"
                                        id="consumerPhone"
                                        name="consumerPhone"
                                        value={formData.consumerPhone}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-200 rounded p-2 focus:outline-none focus:border-gray-400"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="consumerEmail" className="block text-gray-500 mb-2">
                                        Correo electrónico
                                    </label>
                                    <input
                                        type="email"
                                        id="consumerEmail"
                                        name="consumerEmail"
                                        value={formData.consumerEmail}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-200 rounded p-2 focus:outline-none focus:border-gray-400"
                                    />
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="isMinor"
                                        checked={isMinor}
                                        onChange={handleCheckboxChange}
                                        className="accent-[#277FA4] w-4 h-4"
                                    />
                                    <p className="text-gray-700">Soy menor de edad</p>
                                </label>
                            </div>
                        </div>
                        {/* Representative Form Fields (Conditional) */}
                        {isMinor && (
                            <div className="mt-8 space-y-6">
                                <h5 className='font-bold text-xl uppercase mb-6 text-gray-800'>Datos del Padre, Madre o Representante Legal</h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Row 1: Nombre completo (Full Width) */}
                                    <div className="md:col-span-2">
                                        <label htmlFor="repName" className="block text-gray-500 mb-2">
                                            Nombre completo
                                        </label>
                                        <input
                                            type="text"
                                            id="repName"
                                            name="repName"
                                            value={formData.repName}
                                            onChange={handleInputChange}
                                            required={isMinor}
                                            className="w-full border border-gray-200 rounded p-2 focus:outline-none focus:border-gray-400"
                                        />
                                    </div>

                                    {/* Row 2: Tipo de documento & Número */}
                                    <div>
                                        <label htmlFor="repDocType" className="block text-gray-500 mb-2">
                                            Tipo de documento
                                        </label>
                                        <select
                                            id="repDocType"
                                            name="repDocType"
                                            value={formData.repDocType}
                                            onChange={handleInputChange}
                                            required={isMinor}
                                            className="w-full border border-gray-200 rounded p-2 focus:outline-none focus:border-gray-400 bg-white"
                                        >
                                            <option value="">Seleccionar</option>
                                            <option value="DNI">DNI</option>
                                            <option value="CE">Carnet de Extranjería</option>
                                            <option value="PASAPORTE">Pasaporte</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="repDocNumber" className="block text-gray-500 mb-2">
                                            Número de documento
                                        </label>
                                        <input
                                            type="text"
                                            id="repDocNumber"
                                            name="repDocNumber"
                                            value={formData.repDocNumber}
                                            onChange={handleInputChange}
                                            required={isMinor}
                                            className="w-full border border-gray-200 rounded p-2 focus:outline-none focus:border-gray-400"
                                        />
                                    </div>

                                    {/* Row 3: Domicilio & Departamento */}
                                    <div>
                                        <label htmlFor="repAddress" className="block text-gray-500 mb-2">
                                            Domicilio
                                        </label>
                                        <input
                                            type="text"
                                            id="repAddress"
                                            name="repAddress"
                                            value={formData.repAddress}
                                            onChange={handleInputChange}
                                            required={isMinor}
                                            className="w-full border border-gray-200 rounded p-2 focus:outline-none focus:border-gray-400"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="repDepartment" className="block text-gray-500 mb-2">
                                            Departamento
                                        </label>
                                        <select
                                            id="repDepartment"
                                            name="repDepartment"
                                            value={formData.repDepartment}
                                            onChange={handleInputChange}
                                            required={isMinor}
                                            className="w-full border border-gray-200 rounded p-2 focus:outline-none focus:border-gray-400 bg-white"
                                        >
                                            <option value="">Seleccionar</option>
                                            {repDepartments.map((dep) => (
                                                <option key={dep} value={dep}>{dep}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Row 4: Provincia & Distrito */}
                                    <div>
                                        <label htmlFor="repProvince" className="block text-gray-500 mb-2">
                                            Provincia
                                        </label>
                                        <select
                                            id="repProvince"
                                            name="repProvince"
                                            value={formData.repProvince}
                                            onChange={handleInputChange}
                                            required={isMinor}
                                            className="w-full border border-gray-200 rounded p-2 focus:outline-none focus:border-gray-400 bg-white"
                                        >
                                            <option value="">Seleccionar</option>
                                            {repProvinces.map((prov) => (
                                                <option key={prov} value={prov}>{prov}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="repDistrict" className="block text-gray-500 mb-2">
                                            Distrito
                                        </label>
                                        <select
                                            id="repDistrict"
                                            name="repDistrict"
                                            value={formData.repDistrict}
                                            onChange={handleInputChange}
                                            required={isMinor}
                                            className="w-full border border-gray-200 rounded p-2 focus:outline-none focus:border-gray-400 bg-white"
                                        >
                                            <option value="">Seleccionar</option>
                                            {repDistricts.map((dist) => (
                                                <option key={dist} value={dist}>{dist}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Row 5: Celular & Email */}
                                    <div>
                                        <label htmlFor="repPhone" className="block text-gray-500 mb-2">
                                            Celular/Teléfono
                                        </label>
                                        <input
                                            type="tel"
                                            id="repPhone"
                                            name="repPhone"
                                            value={formData.repPhone}
                                            onChange={handleInputChange}
                                            required={isMinor}
                                            className="w-full border border-gray-200 rounded p-2 focus:outline-none focus:border-gray-400"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="repEmail" className="block text-gray-500 mb-2">
                                            Correo electrónico
                                        </label>
                                        <input
                                            type="email"
                                            id="repEmail"
                                            name="repEmail"
                                            value={formData.repEmail}
                                            onChange={handleInputChange}
                                            required={isMinor}
                                            className="w-full border border-gray-200 rounded p-2 focus:outline-none focus:border-gray-400"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Good Data */}
                        <div className="mt-12 mb-8">
                            <h5 className="font-bold text-lg text-gray-800 uppercase mb-6">Datos del Bien Contratado</h5>

                            <div className="mb-6 flex gap-8">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="goodType"
                                        value="PRODUCTO"
                                        checked={formData.goodType === 'PRODUCTO'}
                                        onChange={handleInputChange}
                                        className="accent-[#277FA4] w-5 h-5"
                                        required
                                    />
                                    <span className="text-gray-700">Producto</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="goodType"
                                        value="SERVICIO"
                                        checked={formData.goodType === 'SERVICIO'}
                                        onChange={handleInputChange}
                                        className="accent-[#277FA4] w-5 h-5"
                                        required
                                    />
                                    <span className="text-gray-700">Servicio</span>
                                </label>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="claimAmount" className="block text-gray-500 mb-2">
                                        <span className="text-red-500">* </span> Monto reclamado
                                    </label>
                                    <input
                                        type="text"
                                        id="claimAmount"
                                        name="claimAmount"
                                        value={formData.claimAmount}
                                        onChange={handleInputChange}
                                        placeholder="S/ 0.00"
                                        required
                                        className="w-full md:w-1/3 border border-gray-200 rounded p-3 focus:outline-none focus:border-gray-400"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="goodDescription" className="block text-gray-500 mb-2">
                                        <span className="text-red-500">* </span> Descripción
                                    </label>
                                    <textarea
                                        id="goodDescription"
                                        name="goodDescription"
                                        value={formData.goodDescription}
                                        onChange={handleInputChange}
                                        rows={4}
                                        required
                                        className="w-full border border-gray-200 rounded p-3 focus:outline-none focus:border-gray-400 resize-none"
                                    />
                                </div>
                            </div>
                            <div className="mt-12 mb-8">
                                <h5 className="font-bold text-lg text-gray-800 uppercase mb-6">Detalle del Reclamo y Pedido del Consumidor</h5>

                                <div className="mb-6 flex gap-8">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="claimType"
                                            value="RECLAMO"
                                            checked={formData.claimType === 'RECLAMO'}
                                            onChange={handleInputChange}
                                            className="accent-[#277FA4] w-5 h-5"
                                        />
                                        <span className="text-gray-700">Reclamo</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="claimType"
                                            value="QUEJA"
                                            checked={formData.claimType === 'QUEJA'}
                                            onChange={handleInputChange}
                                            className="accent-[#277FA4] w-5 h-5"
                                        />
                                        <span className="text-gray-700">Queja</span>
                                    </label>
                                </div>

                                <div className="space-y-8">
                                    <div>
                                        <label htmlFor="claimDetail" className="block text-gray-500 mb-2">
                                            <span className="text-red-500">* </span> Detalles del reclamo o queja
                                        </label>
                                        <textarea
                                            id="claimDetail"
                                            name="claimDetail"
                                            value={formData.claimDetail}
                                            onChange={handleInputChange}
                                            rows={4}
                                            required
                                            className="w-full border border-gray-200 rounded p-3 focus:outline-none focus:border-gray-400 resize-none"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="orderRequest" className="block text-gray-500 mb-2">
                                            <span className="text-red-500">* </span> Detalles del pedido
                                        </label>
                                        <textarea
                                            id="orderRequest"
                                            name="orderRequest"
                                            value={formData.orderRequest}
                                            onChange={handleInputChange}
                                            rows={4}
                                            required
                                            className="w-full border border-gray-200 rounded p-3 focus:outline-none focus:border-gray-400 resize-none"
                                        />
                                    </div>
                                </div>

                                <div className="mt-6 text-sm text-gray-600 space-y-2">
                                    <p><span className="font-bold text-black">Reclamo:</span> Inconformidad con los bienes adquiridos o por el producto.</p>
                                    <p><span className="font-bold text-black">Queja:</span> Inconformidad o malestar por el servicio prestado (atención).</p>
                                </div>
                                <div className="mt-8 mb-6 text-sm text-gray-600">
                                    <p><strong>Nota: </strong>La respuesta será brindada en un plazo no mayor a quince (15) días hábiles, contados desde el día hábil siguiente a la presentación del reclamo o queja. La respuesta será enviada prioritariamente al correo electrónico consignado voluntariamente por el consumidor en la presente Hoja de Reclamación. De no haberse consignado dicho dato, se utilizará el medio de contacto alternativo proporcionado por el consumidor que permita acreditar el envío de la respuesta. En caso de que el consumidor decida no consignar ningún medio de contacto que permita su notificación, el proveedor se verá imposibilitado de remitir la respuesta, quedando esta a disposición del consumidor, quien podrá contactarse para su entrega. En caso de que el consumidor desee que la respuesta le sea remitida a su domicilio físico, deberá indicarlo expresamente en el detalle del reclamo o queja.</p>
                                </div>

                                {/* Privacy Notice */}
                                <div className="bg-gray-100 p-4 rounded-lg text-center mb-6">
                                    <p className="text-gray-700 font-medium">Sus datos serán tratados conforme a nuestra “Política de Privacidad”.</p>
                                </div>

                                {errorMessage && <p className="text-red-500 mb-4 text-center">{errorMessage}</p>}

                                <div className="text-center">
                                    <button
                                        type="submit"
                                        disabled={!isFormValid || status === 'loading'}
                                        className={`w-full md:w-auto px-12 py-3 rounded-full font-bold text-white transition-all duration-300 ${isFormValid && status !== 'loading'
                                            ? 'bg-[#277FA4] hover:bg-[#2a2a4a] shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                                            : 'bg-gray-300 cursor-not-allowed'
                                            }`}
                                    >
                                        {status === 'loading' ? 'Enviando...' : 'ENVIAR RECLAMO'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Claim Detail */}

                    </form>
                </div>
            </div>
            <SuccessModal isOpen={showModal} onClose={() => setShowModal(false)} data={submittedData} />
        </div>
    );
};

export default ClaimsBook;