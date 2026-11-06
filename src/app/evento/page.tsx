import { permanentRedirect } from 'next/navigation';
import { searchPath } from '@/app/utils/urls';

// /evento has no content of its own
export default function EventoIndex() {
  permanentRedirect(searchPath());
}
