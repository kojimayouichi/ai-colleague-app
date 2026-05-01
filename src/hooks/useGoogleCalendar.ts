import { useState, useCallback } from 'react';
import { fetchTodayEvents, fetchMonthEvents } from '../lib/calendarApi';
import type { CalendarEvent } from '../types';

export const useGoogleCalendar = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [monthEvents, setMonthEvents] = useState<CalendarEvent[]>([]);
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState({ year: now.getFullYear(), month: now.getMonth() });
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

  const loadMonth = useCallback(async (year: number, month: number) => {
    setLoading(true);
    setError(null);
    try {
      const fetched = await fetchMonthEvents(year, month);
      setMonthEvents(fetched);
      setCurrentMonth({ year, month });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { events, monthEvents, currentMonth, loading, error, load, loadMonth };
};
