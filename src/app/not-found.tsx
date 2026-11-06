import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-3xl font-bold text-[#212121]">Página no encontrada</h1>
      <p className="text-slate-500">El evento o la página que buscas no existe o ya no está disponible.</p>
      <Link href="/" className="bg-[#007FA4] text-white px-6 py-3 rounded-full font-bold">Volver al inicio</Link>
    </div>
  );
}
