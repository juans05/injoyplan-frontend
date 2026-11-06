"use client";

import { useEffect, useState } from "react";
import { useEventStore } from "./zustand/events";
import { useCategoriesState } from "./zustand/categories";
import { useFavoriteStore } from "./zustand/favorites";
import { useAuthStore } from "./zustand/auth";
import Hero from "./ui/Home/Hero";
import CategoryRail from "./ui/Home/CategoryRail";
import EventsFeatured from "./ui/EventsFeatured";
import WeekendSection from "./ui/Home/WeekendSection";
import NearYou from "./ui/Home/NearYou";
import Events from "./ui/Events";
import OrganizerBand from "./ui/Home/OrganizerBand";

export default function Home() {
  const [page, setPage] = useState(1);

  const { getEvents, getEventsDestacades } = useEventStore();
  const { getCategoriesCount } = useCategoriesState();
  const { getFavorites } = useFavoriteStore();
  const { auth } = useAuthStore();

  useEffect(() => {
    getEvents(page);
  }, [page]);

  // Featured events + categories on mount; then sync favorites so cards show the right state
  useEffect(() => {
    Promise.all([getEventsDestacades(), getCategoriesCount()]).then(() => {
      if (auth) getFavorites();
    });
  }, []);

  return (
    <>
      <Hero />
      <CategoryRail />
      <EventsFeatured />
      <WeekendSection />
      <NearYou />
      <Events setPage={setPage} />
      <OrganizerBand />
    </>
  );
}
