const functions = require('firebase-functions');
const { google } = require('googleapis');

exports.getGoogleCalendarToken = functions.https.onCall(async (data, context) => {
  // Verifica se o usuário está autenticado
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
  }

  // Configuração do OAuth2
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  // ... lógica de autenticação
});

exports.googleCalendarProxy = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
  }

  const calendar = google.calendar({
    version: 'v3',
    auth: oauth2Client
  });

  switch (data.action) {
    case 'listEvents':
      return await calendar.events.list({
        calendarId: data.calendarId,
        timeMin: data.timeMin,
        maxResults: 50,
        singleEvents: true,
        orderBy: 'startTime'
      });
    case 'createEvent':
      return await calendar.events.insert({
        calendarId: data.calendarId,
        resource: data.event
      });
    // ... outros casos
  }
}); 