import { google, calendar_v3 } from 'googleapis';
import { Request, Response } from 'express';

const auth = new google.auth.GoogleAuth({
  keyFile: '../../credentials.json',
  scopes: ['https://www.googleapis.com/auth/calendar'],
});

const calendar = google.calendar({ version: 'v3', auth });

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const { doctorId, patientId, dateTime } = req.body;

    const event: calendar_v3.Schema$Event = {
      summary: `Consulta virtual con doctor ${doctorId}`,
      start: { dateTime },
      end: { dateTime: new Date(new Date(dateTime).getTime() + 30 * 60 * 1000).toISOString() }, // 30 min
      conferenceData: { createRequest: { requestId: `appt-${Date.now()}` } },
      description: `Paciente: ${patientId}`,
      visibility: 'private',
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,           // <- aquí es requestBody
      conferenceDataVersion: 1,
    });

    const meetLink = response.data.conferenceData?.entryPoints?.[0].uri;

    // Guardar cita en DB
    // await db.execute(
    //   'INSERT INTO appointments (doctor_id, patient_id, date_time, meet_link) VALUES (?, ?, ?, ?)',
    //   [doctorId, patientId, dateTime, meetLink]
    // );

    return res.json({ doctorId, patientId, dateTime, meetLink });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error creando cita' });
  }
};
