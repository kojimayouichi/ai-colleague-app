import { useState, useCallback } from 'react';
import { fetchTodayEvents } from '../lib/calendarApi';
import type { CalendarEvent } from '../types';

export const useGoogleCalendar = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetched = await fetchTodayEvents();
      setEvents(fetched);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { events, loading, error, load };
};
