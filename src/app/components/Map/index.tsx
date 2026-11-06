import { useEffect, useRef, useState } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl'

const Map = ({ location }: any) => {

    const INITIAL_ZOOM = 15.12
    const [zoom, _setZoom] = useState(INITIAL_ZOOM)
    const mapRef = useRef<mapboxgl.Map | null>(null)
    const mapContainerRef = useRef<HTMLDivElement | null>(null)

    const parts = typeof location === 'string' ? location.split(',') : [];
    const lat = parts.length >= 2 ? parseFloat(parts[0]) : NaN;
    const lng = parts.length >= 2 ? parseFloat(parts[1]) : NaN;
    const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);

    useEffect(() => {
        if (!hasCoords) {
            // If no coords, ensure map instance is cleaned up
            mapRef.current?.remove();
            mapRef.current = null;
            return;
        }

        if (mapContainerRef.current) {
            mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''
            mapRef.current = new mapboxgl.Map({
                container: mapContainerRef.current,
                center: [lng, lat],
                zoom: zoom
            });

            if (mapRef.current) {
                new mapboxgl.Marker()
                    .setLngLat([lng, lat])
                    .addTo(mapRef.current);
            }

            return () => {
                mapRef.current?.remove();
                mapRef.current = null;
            };
        }
    }, [hasCoords, lat, lng, zoom])

    if (!hasCoords) {
        return (
            <div className="bg-white border border-solid border-[#EDEFF5] rounded-2xl p-6 text-center text-[#666]">
                <p className="font-bold text-[#212121]">Ubicación no disponible</p>
                <p className="text-sm mt-1">Este evento no tiene coordenadas para mostrar el mapa.</p>
            </div>
        );
    }

    return (
        <div style={{ position: "relative" }}>
            <div id='map-container' ref={mapContainerRef} />
        </div>
    );
};

export default Map;