import { useCategoriesState } from "@/app/zustand/categories";
import { useEffect } from "react";
import Card from "@/app/components/Card";
import { Event } from "@/app/interfaces/event";

const RelatedEvents = ({ eventId }: { eventId?: string }) => {
    const { getCategoriesRelations, categoriesRelations } = useCategoriesState();

    useEffect(() => {
        if (eventId) getCategoriesRelations(eventId);
    }, [eventId]);

    const items = (Array.isArray(categoriesRelations) ? categoriesRelations : [])
        .filter((e: Event) => String(e.idEventos ?? e.ideventos) !== String(eventId))
        .slice(0, 8);
    if (items.length === 0) return null;

    return (
        <section className="section" aria-labelledby="related-title">
            <h2 id="related-title" className="heading-2 mb-6">Te pueden interesar</h2>
            <ul className="rail lg:grid lg:grid-cols-4 lg:gap-6">
                {items.map((item: Event, i: number) => (
                    <li key={`${item.idEventos ?? item.ideventos}-${item.idfecha}-${i}`} className="w-[78vw] max-w-[300px] shrink-0 lg:w-auto lg:max-w-none">
                        {/* Related results don't carry the user's favorite state, so no heart here */}
                        <Card item={item} addFavoritesByUser={() => { }} heartDisabled />
                    </li>
                ))}
            </ul>
        </section>
    )
}

export default RelatedEvents;
