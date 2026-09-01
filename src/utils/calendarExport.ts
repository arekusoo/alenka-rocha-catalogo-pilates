import { ClassSession, Student } from '../types';

/**
 * Formats a date string 'YYYY-MM-DD' and time 'HH:mm' into UTC/Local ISO string for Google Calendar link
 * Always 1 hour (60 minutes) duration.
 */
export function formatGoogleCalendarDates(dateStr: string, timeStr: string, durationMinutes = 60): { start: string; end: string } {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);

    const startDate = new Date(year, month - 1, day, hours, minutes);
    const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

    const formatToGCal = (d: Date) => {
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
    };

    return {
      start: formatToGCal(startDate),
      end: formatToGCal(endDate),
    };
  } catch {
    const cleanDate = dateStr.replace(/-/g, '');
    const cleanTime = timeStr.replace(/:/g, '') + '00';
    return {
      start: `${cleanDate}T${cleanTime}`,
      end: `${cleanDate}T${cleanTime}`,
    };
  }
}

/**
 * Generates a direct Google Calendar Web link to create an event for a single session
 * Formatted exactly as requested:
 * 🧘 Cliente: <Nome>
 * 📅 Sessão: <Aula X de Y>
 * ⚠️ Limitações/Cuidados: <Texto das limitações>
 * 📱 WhatsApp: <Número>
 * (Evento com duração exata de 1 hora)
 */
export function generateGoogleCalendarUrl(session: ClassSession, student?: Student | null): string {
  // Always 1 hour
  const { start, end } = formatGoogleCalendarDates(session.date, session.time, 60);
  const title = `Aula de Pilates - ${session.studentName}`;
  
  const limitations = student?.limitations || session.studentLimitations || 'Nenhuma restrição registrada.';
  const label = session.descriptionLabel || `Aula ${session.classNumber} de ${session.totalClasses}`;
  const phone = student?.phone || session.studentPhone || 'Não informado';

  const details = [
    `🧘 Cliente: ${session.studentName}`,
    `📅 Sessão: ${label}`,
    `⚠️ Limitações/Cuidados: ${limitations}`,
    `📱 WhatsApp: ${phone}`,
  ].join('\n');

  const location = 'Studio de Pilates';

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${start}/${end}`,
    details: details,
    location: location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Creates and downloads an .ics (iCalendar) file containing all sessions of a client
 * This can be opened directly or imported into Google Calendar, Apple Calendar, Outlook, etc.
 * Always 1 hour per event.
 */
export function exportSessionsToIcs(student: Student, sessions: ClassSession[]): void {
  const pad = (n: number) => String(n).padStart(2, '0');
  const now = new Date();
  const nowUtc = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;

  const clientSessions = sessions.filter((s) => s.studentId === student.id);

  if (clientSessions.length === 0) {
    alert('Nenhuma aula encontrada para exportar.');
    return;
  }

  const eventsIcs = clientSessions
    .map((session) => {
      try {
        const [year, month, day] = session.date.split('-').map(Number);
        const [hours, minutes] = session.time.split(':').map(Number);
        const startDate = new Date(year, month - 1, day, hours, minutes);
        // Always 1 hour (60 minutes)
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

        const dtStart = `${startDate.getFullYear()}${pad(startDate.getMonth() + 1)}${pad(startDate.getDate())}T${pad(startDate.getHours())}${pad(startDate.getMinutes())}00`;
        const dtEnd = `${endDate.getFullYear()}${pad(endDate.getMonth() + 1)}${pad(endDate.getDate())}T${pad(endDate.getHours())}${pad(endDate.getMinutes())}00`;

        const summary = `Aula de Pilates - ${student.name}`;
        const label = session.descriptionLabel || `Aula ${session.classNumber} de ${session.totalClasses}`;
        const limitations = student.limitations || 'Nenhuma restrição registrada.';
        const phone = student.phone || 'Não informado';

        const desc = `🧘 Cliente: ${student.name}\\n📅 Sessão: ${label}\\n⚠️ Limitações/Cuidados: ${limitations}\\n📱 WhatsApp: ${phone}`;

        return [
          'BEGIN:VEVENT',
          `UID:${session.id}-${Date.now()}@studiopilates.app`,
          `DTSTAMP:${nowUtc}`,
          `DTSTART:${dtStart}`,
          `DTEND:${dtEnd}`,
          `SUMMARY:${summary}`,
          `DESCRIPTION:${desc}`,
          'LOCATION:Studio de Pilates',
          session.status === 'completed' ? 'STATUS:CONFIRMED' : 'STATUS:TENTATIVE',
          'END:VEVENT',
        ].join('\r\n');
      } catch {
        return '';
      }
    })
    .filter(Boolean)
    .join('\r\n');

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Studio Pilates//Agenda//PT-BR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:Aulas Pilates - ${student.name}`,
    eventsIcs,
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const safeName = student.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  link.download = `aulas-pilates-${safeName}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
