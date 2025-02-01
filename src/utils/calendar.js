export function formatDateForICS(date) {
  const d = new Date(date);
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

export function createICSFile(event) {
  const icsData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//UniTask//Calendar//EN
BEGIN:VEVENT
SUMMARY:${event.title}
DTSTART:${formatDateForICS(event.start)}
DTEND:${formatDateForICS(event.end)}
DESCRIPTION:${event.description || ''}
LOCATION:${event.location || ''}
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${event.title}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
} 