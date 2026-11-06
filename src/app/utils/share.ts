import useAlertStore from '@/app/zustand/alert';
import { track } from './analytics';

// Native share sheet when available, clipboard copy otherwise
export function shareEvent(path: string, title?: string) {
    const url = `${window.location.origin}${path}`;
    const data = { title: title || 'Evento en Injoyplan', text: `Mira este evento: ${title || ''}`.trim(), url };
    track('share', { item_id: path, method: 'share' in navigator ? 'native' : 'clipboard' });

    if ('share' in navigator && navigator.canShare?.(data)) {
        navigator.share(data).catch((err) => { if (err?.name !== 'AbortError') console.error('Error al compartir', err); });
        return;
    }
    navigator.clipboard.writeText(url)
        .then(() => useAlertStore.getState().alert('Enlace copiado. Compártelo con tus amigos.', 'notification'))
        .catch((err) => console.error('Error al copiar', err));
}
