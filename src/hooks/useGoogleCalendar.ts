import { useState, useCallback } from 'react';
import { fetchTodayEvents, fetchWeekEvents, getWeekRange } from '../lib/calendarApi';
import type { CalendarEvent } from '../types';

export const useGoogleCalendar = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [weekEvents, setWeekEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
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

  const loadWeek = useCallback(async (date: Date) => {
    setLoading(true);
    setError(null);
    try {
      const fetched = await fetchWeekEvents(date);
      setWeekEvents(fetched);
      setSelectedDate(date);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const weekDays = getWeekRange(selectedDate).days;

  return { events, weekEvents, weekDays, selectedDate, loading, error, load, loadWeek, setSelectedDate };
};
