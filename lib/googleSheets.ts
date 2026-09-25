import { google } from "googleapis";

const projectId = process.env.GOOGLE_PROJECT_ID;
const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  throw new Error(
    "Google API environment variables are missing. Check .env.local."
  );
}

const auth = new google.auth.GoogleAuth({
  credentials: {
    project_id: projectId,
    client_email: clientEmail,
    private_key: privateKey,
  },
  scopes: [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
  ],
});

export const sheets = google.sheets({
  version: "v4",
  auth,
});

export const drive = google.drive({
  version: "v3",
  auth,
});

export const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID!;
export const GOOGLE_DRIVE_FOLDER_ID =
  process.env.GOOGLE_DRIVE_FOLDER_ID!;