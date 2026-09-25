import { NextResponse } from "next/server";
import { sheets, GOOGLE_SHEET_ID } from "@/lib/googleSheets";

export async function GET() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: "Orders!A1:H5",
    });

    return NextResponse.json({
      success: true,
      message: "Google Sheets connection is working!",
      data: response.data.values || [],
    });
  } catch (error) {
    console.error("Google Sheets test error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Google Sheets connection failed.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}