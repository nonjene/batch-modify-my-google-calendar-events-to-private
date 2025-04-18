# Google Calendar Privacy Tool

A web-based internal tool that helps users modify their Google Calendar events, specifically designed to easily change events to private within a specified date range.

## Features

- OAuth 2.0 authentication with Google Calendar API
- Simple date range selection interface
- One-click conversion of all events to private within the selected date range
- Responsive design for desktop and mobile use

## Tech Stack

- **Frontend**: React, TypeScript, react-datepicker, axios
- **Backend**: Node.js, Express, TypeScript, Google Calendar API

## Getting Started

### Prerequisites

- Node.js and npm installed
- Google Cloud Platform account with Google Calendar API enabled
- OAuth 2.0 credentials configured in Google Cloud Console

### Setup Instructions

1. **Clone the repository**

```bash
git clone <repository-url>
cd modify-google-calendar
```

2. **Set up Google Cloud Platform**

   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable Google Calendar API for the project
   - Create OAuth 2.0 credentials (Web application type)
   - Add authorized redirect URIs: `http://localhost:3001/auth/callback`
   - Note down your Client ID and Client Secret

3. **Backend Setup**

```bash
cd backend
npm install
```

   - Create a `.env` file in the backend directory with the following content:

```
PORT=3001
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
REDIRECT_URI=http://localhost:3001/auth/callback
FRONTEND_URL=http://localhost:3000
```

4. **Frontend Setup**

```bash
cd frontend
npm install
```

5. **Running the application**

   - Start the backend server:

```bash
cd backend
npm start
```

   - In a separate terminal, start the frontend:

```bash
cd frontend
npm start
```

6. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Click on the "Login with Google" button
2. Grant permission to access your Google Calendar
3. Select a start date and end date
4. Click "Change Events to Private"
5. Wait for the process to complete
