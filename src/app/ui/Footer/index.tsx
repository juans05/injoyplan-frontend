"use client"
import Link from 'next/link';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import logo from '../../../../public/svg/injoyplan.svg';
import { useCategoriesState } from '../../zustand/categories';
import usePublishEvent from '@/app/hooks/usePublishEvent';
import { searchPath } from '@/app/utils/urls';

const NAV = [
  {
    title: 'Injoyplan',
    links: [
      { label: 'Inicio', href: '/' },
      { label: 'Explorar eventos', href: '/eventos' },
      { label: 'Eventos gratuitos', href: '/eventos/gratis' },
      { label: 'Acerca de nosotros', href: '/nosotros' },
    ],
  },
  {
    title: 'Ayuda',
    links: [
      { label: 'Preguntas frecuentes', href: '/preguntas-frecuentes' },
      { label: 'Contáctanos', href: '/contactanos' },
      { label: 'Libro de reclamaciones', href: '/libro-de-reclamaciones' },
    ],
  },
  {
    title: 'Políticas',
    links: [
      { label: 'Política de privacidad', href: '/politicas-privacidad' },
      { label: 'Política de cookies', href: '/politicas-cookies' },
      { label: 'Términos y condiciones', href: '/terminos-y-condiciones' },
    ],
  },
];

const SOCIAL = [
  { label: 'Facebook', href: 'https://www.facebook.com/Injoyplan', icon: 'mdi:facebook' },
  { label: 'Instagram', href: 'https://www.instagram.com/injoyplan', icon: 'mdi:instagram' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@injoyplan', icon: 'ic:baseline-tiktok' },
  { label: 'YouTube', href: 'https://www.youtube.com/@injoyplan', icon: 'mdi:youtube' },
];

const linkClass = 'inline-block py-1.5 text-label font-normal text-ink-soft transition-colors hover:text-brand';

const Footer = () => {
  const { countsCategories } = useCategoriesState();
  const publish = usePublishEvent();
  // Only shown when the categories are already loaded (home and header fetch them)
  const categories: any[] = (countsCategories || []).filter((c: any) => c.cantidad > 0).slice(0, 6);

  return (
    <footer className="mt-8 border-t border-line bg-white">
      <div className="container-page grid gap-10 py-12 md:py-16 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Link href="/" aria-label="Injoyplan, ir al inicio">
            <Image src={logo} alt="Injoyplan" className="h-auto w-[140px]" />
          </Link>
          <p className="mt-4 max-w-sm text-label font-normal text-ink-soft">
            Conciertos, teatro, ferias y experiencias en un solo lugar. Filtra por fecha, distrito y precio.
          </p>
          <a href="mailto:Contacto@injoyplan.com" className="mt-5 inline-flex items-center gap-2 text-body font-semibold text-brand hover:text-brand-deep">
            <Icon icon="solar:letter-linear" width={20} aria-hidden /> Contacto@injoyplan.com
          </a>
          <div className="mt-6">
            <p className="text-body font-bold text-ink">¿Organizas eventos?</p>
            <button type="button" onClick={publish} className="btn-secondary btn-sm mt-3">Publica tu evento</button>
          </div>
        </div>

        <nav aria-label="Pie de página" className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-8">
          {NAV.map((section) => (
            <div key={section.title}>
              <h2 className="text-body font-bold text-ink">{section.title}</h2>
              <ul className="mt-3">
                {section.links.map((l) => <li key={l.href}><Link href={l.href} className={linkClass}>{l.label}</Link></li>)}
              </ul>
            </div>
          ))}
          {categories.length > 0 && (
            <div>
              <h2 className="text-body font-bold text-ink">Categorías</h2>
              <ul className="mt-3">
                {categories.map((c) => (
                  <li key={c.idCategorias}><Link href={searchPath({ categoria: c.nombreCategoria })} className={linkClass}>{c.nombreCategoria}</Link></li>
                ))}
              </ul>
            </div>
          )}
        </nav>
      </div>

      <div className="bg-ink text-white">
        <div className="container-page flex flex-col items-center gap-6 py-6 md:flex-row md:justify-between">
          <p className="text-label text-white/75">© {new Date().getFullYear()} Injoyplan</p>
          <ul className="flex items-center gap-3">
            {SOCIAL.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={`Injoyplan en ${s.label}`}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 transition-colors hover:bg-white/10">
                  <Icon icon={s.icon} width={20} aria-hidden />
                </a>
              </li>
            ))}
          </ul>
          <Link href="/libro-de-reclamaciones" aria-label="Libro de reclamaciones" className="rounded-control bg-white px-3 py-1.5">
            <Image width={96} height={40} className="h-10 w-auto object-contain" src="https://cdn.shopify.com/s/files/1/0276/9184/3699/files/Libro_reclamaciones_480x480.png?v=1727902723" alt="Libro de reclamaciones" />
          </Link>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
