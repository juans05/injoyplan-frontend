import type { MetadataRoute } from 'next';
import { SITE_URL } from './utils/fetch';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/iniciar-sesion-admin', '/perfil', '/mensajes', '/amigos', '/guardados', '/mis-eventos', '/reset-password'] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
