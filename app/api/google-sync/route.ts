import { NextResponse } from "next/server";
import { google } from "googleapis";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    // --------------------------------------------------
    // GOOGLE AUTHENTICATION
    // --------------------------------------------------

    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(
      /\\n/g,
      "\n"
    );

    const auth = new google.auth.GoogleAuth({
      credentials: {
        project_id: process.env.GOOGLE_PROJECT_ID,
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: privateKey,
      },
      scopes: [
        "https://www.googleapis.com/auth/spreadsheets",
      ],
    });

    const sheets = google.sheets({
      version: "v4",
      auth,
    });

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    if (!spreadsheetId) {
      throw new Error("GOOGLE_SHEET_ID is missing.");
    }

    // --------------------------------------------------
    // READ ALL DATA FROM SUPABASE
    // --------------------------------------------------

    const [
      ordersResult,
      orderItemsResult,
      menuItemsResult,
      categoriesResult,
      tablesResult,
    ] = await Promise.all([
      supabase
        .from("Orders")
        .select("*")
        .order("id", { ascending: true }),

      supabase
        .from("Order_Items")
        .select("*")
        .order("id", { ascending: true }),

      supabase
        .from("Menu_Items")
        .select("*")
        .order("id", { ascending: true }),

      supabase
        .from("Categories")
        .select("*")
        .order("id", { ascending: true }),

      supabase
        .from("Restaurant_Tables")
        .select("*")
        .order("id", { ascending: true }),
    ]);

    if (ordersResult.error) {
      throw new Error(
        `Orders error: ${ordersResult.error.message}`
      );
    }

    if (orderItemsResult.error) {
      throw new Error(
        `Order_Items error: ${orderItemsResult.error.message}`
      );
    }

    if (menuItemsResult.error) {
      throw new Error(
        `Menu_Items error: ${menuItemsResult.error.message}`
      );
    }

    if (categoriesResult.error) {
      throw new Error(
        `Categories error: ${categoriesResult.error.message}`
      );
    }

    if (tablesResult.error) {
      throw new Error(
        `Restaurant_Tables error: ${tablesResult.error.message}`
      );
    }

    // --------------------------------------------------
    // CONVERT OBJECTS TO SHEET ROWS
    // --------------------------------------------------

    const orders = ordersResult.data || [];
    const orderItems = orderItemsResult.data || [];
    const menuItems = menuItemsResult.data || [];
    const categories = categoriesResult.data || [];
    const tables = tablesResult.data || [];

    const orderRows = [
      [
        "id",
        "created_at",
        "Order_number",
        "Table_id",
        "Total",
        "Order_type",
        "Status",
        "Payment_type",
        "Updated_at",
      ],
      ...orders.map((row) => [
        row.id ?? "",
        row.created_at ?? "",
        row.Order_number ?? "",
        row.Table_id ?? "",
        row.Total ?? "",
        row.Order_type ?? "",
        row.Status ?? "",
        row.Payment_type ?? "",
        row.Updated_at ?? "",
      ]),
    ];

    const orderItemRows = [
      [
        "id",
        "created_at",
        "Order_id",
        "Menu_item_id",
        "Item_name",
        "Unit_price",
        "Quantity",
        "Line_Total",
      ],
      ...orderItems.map((row) => [
        row.id ?? "",
        row.created_at ?? "",
        row.Order_id ?? "",
        row.Menu_item_id ?? "",
        row.Item_name ?? "",
        row.Unit_price ?? "",
        row.Quantity ?? "",
        row.Line_Total ?? "",
      ]),
    ];

    const menuItemRows = [
      [
        "id",
        "created_at",
        "Category_id",
        "Name",
        "Price",
        "Image_url",
        "Active",
      ],
      ...menuItems.map((row) => [
        row.id ?? "",
        row.created_at ?? "",
        row.Category_id ?? "",
        row.Name ?? "",
        row.Price ?? "",
        row.Image_url ?? "",
        row.Active ?? "",
      ]),
    ];

    const categoryRows = [
      [
        "id",
        "created_at",
        "Name",
        "Image_url",
        "Sort_order",
        "Active",
      ],
      ...categories.map((row) => [
        row.id ?? "",
        row.created_at ?? "",
        row.Name ?? "",
        row.Image_url ?? "",
        row.Sort_order ?? "",
        row.Active ?? "",
      ]),
    ];

    const tableRows = [
      [
        "id",
        "created_at",
        "table_name",
        "capacity",
      ],
      ...tables.map((row) => [
        row.id ?? "",
        row.created_at ?? "",
        row.table_name ?? "",
        row.capacity ?? "",
      ]),
    ];

    // --------------------------------------------------
    // WRITE DATA TO GOOGLE SHEETS
    // --------------------------------------------------

    const syncSheet = async (
      sheetName: string,
      rows: unknown[][]
    ) => {
      // Clear old data
      await sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: `'${sheetName}'!A:Z`,
      });

      // Write latest Supabase data
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `'${sheetName}'!A1`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: rows,
        },
      });
    };

    // Sync all five tabs
    await syncSheet("Orders", orderRows);
    await syncSheet("Order_Items", orderItemRows);
    await syncSheet("Menu_Items", menuItemRows);
    await syncSheet("Categories", categoryRows);
    await syncSheet("Restaurant_Tables", tableRows);

    // --------------------------------------------------
    // SUCCESS
    // --------------------------------------------------

    return NextResponse.json({
      success: true,
      message: "Supabase data synced successfully to Google Sheets.",
      synced: {
        Orders: orders.length,
        Order_Items: orderItems.length,
        Menu_Items: menuItems.length,
        Categories: categories.length,
        Restaurant_Tables: tables.length,
      },
    });
  } catch (error) {
    console.error("Google sync error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Google Sheets sync failed.",
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}