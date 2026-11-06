import { useRouter } from 'next/navigation';
import { useAuthStore } from '../zustand/auth';
import { track } from '../utils/analytics';

// "Publica tu evento" follows the real organizer flow:
// guest -> register, normal user -> become a company in settings, company -> create event.
export default function usePublishEvent() {
    const router = useRouter();
    const { auth, openAuthModal } = useAuthStore();

    return () => {
        track('publish_event_cta', { user_type: auth?.userType ?? 'guest' });
        if (!auth) return openAuthModal(true);
        router.push(auth.userType === 'COMPANY' ? '/perfil/crear-evento' : '/perfil/editar#empresa');
    };
}
