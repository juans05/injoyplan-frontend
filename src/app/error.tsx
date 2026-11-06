'use client';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-3xl font-bold text-[#212121]">Algo salió mal</h1>
      <p className="text-slate-500">Ocurrió un error inesperado. Intenta de nuevo.</p>
      <button onClick={reset} className="bg-[#007FA4] text-white px-6 py-3 rounded-full font-bold">Reintentar</button>
    </div>
  );
}
