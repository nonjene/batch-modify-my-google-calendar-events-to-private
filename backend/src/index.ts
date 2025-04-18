import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { google } from 'googleapis';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Google Calendar API credentials
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:3001/auth/callback';

// Create OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// Google Calendar API instance
const calendar = google.calendar({
  version: 'v3',
  auth: oauth2Client
});

// Route handlers
const getAuthUrl = (req: express.Request, res: express.Response) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });
  res.json({ authUrl });
};

const handleCallback = async (req: express.Request, res: express.Response) => {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).send('Authorization code is missing');
  }

  try {
    const { tokens } = await oauth2Client.getToken(code as string);
    oauth2Client.setCredentials(tokens);
    
    // Redirect to frontend with success message
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}?auth=success`);
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    res.status(500).send('Authentication failed');
  }
};

const modifyEvents = async (req: express.Request, res: express.Response) => {
  const { startDate, endDate } = req.body;
  
  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Start and end dates are required' });
  }
  
  if (!oauth2Client.credentials.access_token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  try {
    // Get all events in the specified date range
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date(startDate).toISOString(),
      timeMax: new Date(endDate).toISOString(),
      singleEvents: true,
    });
    
    const events = response.data.items || [];
    const totalEvents = events.length;
    let modifiedCount = 0;
    
    // Modify each event to be private
    for (const event of events) {
      if (event.id) {
        // Only update the event if it's not already private
        if (event.visibility !== 'private') {
          await calendar.events.patch({
            calendarId: 'primary',
            eventId: event.id,
            requestBody: {
              visibility: 'private'
            }
          });
          modifiedCount++;
        }
      }
    }
    
    res.json({ 
      success: true, 
      message: `Modified ${modifiedCount} out of ${totalEvents} events to private.` 
    });
  } catch (error) {
    console.error('Error modifying events:', error);
    res.status(500).json({ error: 'Failed to modify events' });
  }
};

// Routes
app.get('/api/auth/url', getAuthUrl);
app.get('/auth/callback', handleCallback);
app.post('/api/modify-events', modifyEvents);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
