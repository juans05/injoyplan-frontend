interface Header {
    CODE: number;
    CODE_RESPONSE: string;
    MESSAGE: string;
}

export interface Event {
    esfavorito: number | null;
    HoraInicio: string;
    HoraFinal: string;
    FechaInicio: string;
    idEventos: string | number;
    ideventos: string | number;
    titulo: string;
    NombreLocal: string;
    urlFuente: string;
    url: string;
    Monto: number;
    Destacado: number;
    categoria_id: string | number;
    EsGratis: number;
    Distrito: string;
    estado: string | null;
    idfecha: string | number;
    usuario_id: string | number;
    // Favorite id when the user saved this event (null/0 otherwise)
    favorito: Id | null;

    // Optional extra fields used in some UI screens
    direccion?: string;
    latitud_longitud?: string;
    descripcionEvento?: string;
    createdAt?: string | Date;
    imageUrl?: string;
    ticketUrls?: { name: string; url: string }[];
    id?: string;
}

export interface IResponse {
    HEADER: Header;
    RESPONSE: Event[];
}
// --- Raw backend (NestJS/Prisma) shapes ---

export type Id = string | number;

export interface BackendEventDate {
    id: string;
    date: string;
    startTime?: string;
    endTime?: string;
    price?: number;
}

export interface BackendLocation {
    name?: string;
    address?: string;
    district?: string;
    province?: string;
    latitude?: number;
    longitude?: number;
}

export interface BackendEvent {
    id: string;
    title: string;
    description?: string;
    imageUrl?: string;
    isFeatured?: boolean;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
    websiteUrl?: string;
    link?: string;
    dates?: BackendEventDate[];
    location?: BackendLocation;
    ticketUrls?: { name: string; url: string }[];
    user?: any;
    // Favorite info, only present when the request is authenticated
    favorito?: Id;
    esfavorito?: number;
}

export interface EventSearchResponse {
    eventos?: BackendEvent[];
    total?: number;
}

// Backend list endpoints return either { data: [...] }, { events: [...] } or a bare array
export type BackendEventList = BackendEvent[] | { data?: BackendEvent[]; events?: BackendEvent[] };

export interface EventDateRow {
    idfecha: string;
    evento_id: string;
    FechaInicio: string;
    HoraInicio?: string;
    HoraFinal?: string;
    Monto?: number;
}

// Shape used by the event detail page
export interface EventDetail {
    data: Event[];
    dataFecha: EventDateRow[];
    dataPlataformaVenta: { nombrePlataforma: string; urlWebLugar: string; iconos: string }[];
    owner: any;
}
