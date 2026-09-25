"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

// ============================================================
// TYPES
// ============================================================

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CategoryRecord {
  id: string;
  name: string;
  image: string;
  sortOrder: number;
}

interface BillRecord {
  id: string;
  dbId: string;
  orderNumber: number;
  orderType: string;
  items: OrderItem[];
  total: number;
  timestamp: string;
  createdAt: number;
  status: string;
  paymentType: string;
}

// ============================================================
// IMAGE HELPERS
// ============================================================

// Built-in SVG placeholders.
// These work without downloading any images.
// Later you can replace the image value of any menu item
// with your own /menu/filename.jpg path.

const makeImage = (emoji: string, title: string) =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="700" height="500" viewBox="0 0 700 500">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#1e293b"/>
          <stop offset="100%" stop-color="#0f172a"/>
        </linearGradient>
      </defs>
      <rect width="700" height="500" fill="url(#g)"/>
      <circle cx="350" cy="220" r="130" fill="#111827" opacity="0.8"/>
      <text x="350" y="250" text-anchor="middle" font-size="120">${emoji}</text>
      <text x="350" y="410" text-anchor="middle"
        fill="white"
        font-family="Arial"
        font-size="28"
        font-weight="bold">${title}</text>
    </svg>
  `)}`;

const CATEGORY_IMAGES: Record<string, string> = {
  // Real food photographs for the category cards.
  // These are only the category-cover images; individual menu-item
  // images continue to come from Supabase Menu_Items.Image_url.
  Beverages:
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=85",
  Pasta:
    "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=85",
  Sides:
    "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=85",
  "Snacks / Toasts":
    "https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=900&q=85",
  "Burgers & Combos":
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85",
  Pizza:
    "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=85",
  "Chicken Delights":
    "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=900&q=85",
};

// ============================================================
// MENU ITEM PHOTOS
// ============================================================
// Every menu card gets a food photograph. If an item later has an
// Image_url saved in Supabase, that uploaded image takes priority.
const MENU_ITEM_PHOTOS: Record<string, string> = {
  // Stable hosted photographs. Uploaded Supabase images always take priority.
  "Tea": "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=900&q=85",
  "Hot Coffee": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=85",
  "Cold Coffee": "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=85",
  "Cold Coffee with Ice Cream": "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=900&q=85",
  "Mango Ice Tea": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=900&q=85",
  "Strawberry Ice Tea": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=900&q=85",
  "Water Bottle": "https://images.unsplash.com/photo-1564419320461-6870880221ad?auto=format&fit=crop&w=900&q=85",
  "Soft Drink": "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?auto=format&fit=crop&w=900&q=85",
  "Mojito": "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?auto=format&fit=crop&w=900&q=85",
  "Pink Sauce Pasta": "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=85",
  "White Sauce Pasta": "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=85",
  "Red Sauce Pasta": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=900&q=85",
  "French Fries": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=85",
  "Peri Peri Fries": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=85",
  "Masala Omelette": "https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=900&q=85",
  "Chilli Cheese Toast (2 Pc)": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=85",
  "Garlic Bread (2 Pc)": "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=900&q=85",
  "Garlic Bread & Cheese": "https://images.unsplash.com/photo-1548365328-8b849e6f90e1?auto=format&fit=crop&w=900&q=85",
  "Masala Toast Sandwich": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=85",
  "Lays Cheesy Nachos": "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=900&q=85",
  "Classic Toast Sandwich": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=85",
  "Classic Veg Burger": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85",
  "Cheesy Veg Burger": "https://images.unsplash.com/photo-1550317138-10000687a72b?auto=format&fit=crop&w=900&q=85",
  "Loaded Veg Burger": "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=900&q=85",
  "Millennialz Special Veg Burger": "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=900&q=85",
  "Millennialz Special Non Veg Burger": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85",
  "Veg Combo (Burger + Fries + Mojito)": "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=85",
  "Non Veg Combo (Burger + Fries + Mojito)": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85",
  "Veg Burger Combo (Burger + Fries + Cold Coffee)": "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=85",
  "Non Veg Burger Combo (Burger + Fries + Cold Coffee)": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85",
  "Classic Pizza": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=85",
  "Fresh Farm Pizza": "https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=900&q=85",
  "Loaded Pizza": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=85",
  "Chicken Nuggets": "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=900&q=85",
  "Chicken Popcorn": "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=900&q=85",
};

const getMenuItemPhoto = (name: string, category?: string) => {
  if (MENU_ITEM_PHOTOS[name]) return MENU_ITEM_PHOTOS[name];
  if (category && CATEGORY_IMAGES[category]) return CATEGORY_IMAGES[category];
  return makeImage("🍽️", name);
};

const getSafeMenuImage = (item: MenuItem) => {
  // Prefer the image saved for this item. If it is missing or fails to load,
  // use the item's known photo, then the category cover, then an SVG fallback.
  return item.image || getMenuItemPhoto(item.name, item.category);
};

// ============================================================
// MENU
// ============================================================
//
// CHANGE MENU HERE
//
// You can change:
// name
// price
// category
// image
//
// Example:
// price: 25
//
// Old completed bills will NOT change when you modify a price.
// New orders will use the new price.
//

const MENU_DATA: MenuItem[] = [
  // ---------------- BEVERAGES ----------------
  {
    id: "b1",
    name: "Tea",
    price: 21,
    category: "Beverages",
    image: getMenuItemPhoto("Tea"),
  },
  {
    id: "b2",
    name: "Hot Coffee",
    price: 21,
    category: "Beverages",
    image: getMenuItemPhoto("Hot Coffee"),
  },
  {
    id: "b3",
    name: "Cold Coffee",
    price: 39,
    category: "Beverages",
    image: getMenuItemPhoto("Cold Coffee"),
  },
  {
    id: "b4",
    name: "Cold Coffee with Ice Cream",
    price: 49,
    category: "Beverages",
    image: getMenuItemPhoto("Cold Coffee with Ice Cream"),
  },
  {
    id: "b5",
    name: "Mango Ice Tea",
    price: 39,
    category: "Beverages",
    image: getMenuItemPhoto("Mango Ice Tea"),
  },
  {
    id: "b6",
    name: "Strawberry Ice Tea",
    price: 39,
    category: "Beverages",
    image: getMenuItemPhoto("Strawberry Ice Tea"),
  },
  {
    id: "b7",
    name: "Water Bottle",
    price: 20,
    category: "Beverages",
    image: getMenuItemPhoto("Water Bottle"),
  },
  {
    id: "b8",
    name: "Soft Drink",
    price: 20,
    category: "Beverages",
    image: getMenuItemPhoto("Soft Drink"),
  },
  {
    id: "b9",
    name: "Mojito",
    price: 39,
    category: "Beverages",
    image: getMenuItemPhoto("Mojito"),
  },

  // ---------------- PASTA ----------------
  {
    id: "p1",
    name: "Pink Sauce Pasta",
    price: 129,
    category: "Pasta",
    image: getMenuItemPhoto("Pink Sauce Pasta"),
  },
  {
    id: "p2",
    name: "White Sauce Pasta",
    price: 129,
    category: "Pasta",
    image: getMenuItemPhoto("White Sauce Pasta"),
  },
  {
    id: "p3",
    name: "Red Sauce Pasta",
    price: 129,
    category: "Pasta",
    image: getMenuItemPhoto("Red Sauce Pasta"),
  },

  // ---------------- SIDES ----------------
  {
    id: "s1",
    name: "French Fries",
    price: 59,
    category: "Sides",
    image: getMenuItemPhoto("French Fries"),
  },
  {
    id: "s2",
    name: "Peri Peri Fries",
    price: 69,
    category: "Sides",
    image: getMenuItemPhoto("Peri Peri Fries"),
  },
  {
    id: "s3",
    name: "Masala Omelette",
    price: 49,
    category: "Sides",
    image: getMenuItemPhoto("Masala Omelette"),
  },

  // ---------------- SNACKS ----------------
  {
    id: "st1",
    name: "Chilli Cheese Toast (2 Pc)",
    price: 49,
    category: "Snacks / Toasts",
    image: getMenuItemPhoto("Chilli Cheese Toast (2 Pc)"),
  },
  {
    id: "st2",
    name: "Garlic Bread (2 Pc)",
    price: 39,
    category: "Snacks / Toasts",
    image: getMenuItemPhoto("Garlic Bread (2 Pc)"),
  },
  {
    id: "st3",
    name: "Garlic Bread & Cheese",
    price: 59,
    category: "Snacks / Toasts",
    image: getMenuItemPhoto("Garlic Bread & Cheese"),
  },
  {
    id: "st4",
    name: "Masala Toast Sandwich",
    price: 59,
    category: "Snacks / Toasts",
    image: getMenuItemPhoto("Masala Toast Sandwich"),
  },
  {
    id: "st5",
    name: "Lays Cheesy Nachos",
    price: 89,
    category: "Snacks / Toasts",
    image: getMenuItemPhoto("Lays Cheesy Nachos"),
  },
  {
    id: "st6",
    name: "Classic Toast Sandwich",
    price: 49,
    category: "Snacks / Toasts",
    image: getMenuItemPhoto("Classic Toast Sandwich"),
  },

  // ---------------- BURGERS ----------------
  {
    id: "bg1",
    name: "Classic Veg Burger",
    price: 49,
    category: "Burgers & Combos",
    image: getMenuItemPhoto("Classic Veg Burger"),
  },
  {
    id: "bg2",
    name: "Cheesy Veg Burger",
    price: 59,
    category: "Burgers & Combos",
    image: getMenuItemPhoto("Cheesy Veg Burger"),
  },
  {
    id: "bg3",
    name: "Loaded Veg Burger",
    price: 69,
    category: "Burgers & Combos",
    image: getMenuItemPhoto("Loaded Veg Burger"),
  },
  {
    id: "bg4",
    name: "Millennialz Special Veg Burger",
    price: 99,
    category: "Burgers & Combos",
    image: getMenuItemPhoto("Millennialz Special Veg Burger"),
  },
  {
    id: "bg5",
    name: "Millennialz Special Non Veg Burger",
    price: 119,
    category: "Burgers & Combos",
    image: getMenuItemPhoto("Millennialz Special Non Veg Burger"),
  },
  {
    id: "bg6",
    name: "Veg Combo (Burger + Fries + Mojito)",
    price: 99,
    category: "Burgers & Combos",
    image: getMenuItemPhoto("Veg Combo (Burger + Fries + Mojito)"),
  },
  {
    id: "bg7",
    name: "Non Veg Combo (Burger + Fries + Mojito)",
    price: 119,
    category: "Burgers & Combos",
    image: getMenuItemPhoto("Non Veg Combo (Burger + Fries + Mojito)"),
  },
  {
    id: "bg8",
    name: "Veg Burger Combo (Burger + Fries + Cold Coffee)",
    price: 119,
    category: "Burgers & Combos",
    image: getMenuItemPhoto("Veg Burger Combo (Burger + Fries + Cold Coffee)"),
  },
  {
    id: "bg9",
    name: "Non Veg Burger Combo (Burger + Fries + Cold Coffee)",
    price: 129,
    category: "Burgers & Combos",
    image: getMenuItemPhoto("Non Veg Burger Combo (Burger + Fries + Cold Coffee)"),
  },

  // ---------------- PIZZA ----------------
  {
    id: "pz1",
    name: "Classic Pizza",
    price: 69,
    category: "Pizza",
    image: getMenuItemPhoto("Classic Pizza"),
  },
  {
    id: "pz2",
    name: "Fresh Farm Pizza",
    price: 89,
    category: "Pizza",
    image: getMenuItemPhoto("Fresh Farm Pizza"),
  },
  {
    id: "pz3",
    name: "Loaded Pizza",
    price: 99,
    category: "Pizza",
    image: getMenuItemPhoto("Loaded Pizza"),
  },

  // ---------------- CHICKEN ----------------
  {
    id: "cd1",
    name: "Chicken Nuggets",
    price: 89,
    category: "Chicken Delights",
    image: getMenuItemPhoto("Chicken Nuggets"),
  },
  {
    id: "cd2",
    name: "Chicken Popcorn",
    price: 89,
    category: "Chicken Delights",
    image: getMenuItemPhoto("Chicken Popcorn"),
  },
];

// ============================================================
// CONSTANTS
// ============================================================

const CATEGORIES = [
  "Beverages",
  "Pasta",
  "Sides",
  "Snacks / Toasts",
  "Burgers & Combos",
  "Pizza",
  "Chicken Delights",
];

const ORDER_DESTINATIONS = [
  "Table 1",
  "Table 2",
  "Table 3",
  "Takeaway",
];

// ============================================================
// MAIN APP
// ============================================================

export default function MillennialzBillingApp() {
  const [activeTab, setActiveTab] = useState<
    "billing" | "history" | "analytics" | "menu"
  >("billing");

  const [activeDestination, setActiveDestination] =
    useState("Table 1");

  const [selectedCategory, setSelectedCategory] =
    useState<string | null>(null);

  const [historyDestination, setHistoryDestination] =
    useState<string | null>(null);

  const [historyStatusFilter, setHistoryStatusFilter] =
    useState<"all" | "completed" | "cancelled">("all");

  const [activeOrders, setActiveOrders] = useState<
    Record<string, OrderItem[]>
  >({
    "Table 1": [],
    "Table 2": [],
    "Table 3": [],
    Takeaway: [],
  });

  const [billHistory, setBillHistory] = useState<BillRecord[]>([]);
  const [paymentType, setPaymentType] = useState<"Cash" | "Online">("Cash");
  const [analyticsPeriod, setAnalyticsPeriod] = useState<
  "Today" | "Yesterday" | "This Week" | "This Month" | "Custom"
>("Today");
const [customStartDate, setCustomStartDate] = useState("");
const [customEndDate, setCustomEndDate] = useState("");

  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [googleSyncing, setGoogleSyncing] = useState(false);
const [googleSyncMessage, setGoogleSyncMessage] = useState("");

const syncToGoogleSheets = async () => {
  if (googleSyncing) {
    return;
  }

  setGoogleSyncing(true);
  setGoogleSyncMessage("");

  try {
    const response = await fetch("/api/google-sync");

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.error || result.message || "Google Sheets sync failed."
      );
    }

    setGoogleSyncMessage(
      `Synced successfully — Orders: ${result.synced?.Orders ?? 0}, Order Items: ${result.synced?.Order_Items ?? 0}, Menu Items: ${result.synced?.Menu_Items ?? 0}, Categories: ${result.synced?.Categories ?? 0}, Tables: ${result.synced?.Restaurant_Tables ?? 0}`
    );
  } catch (error) {
    console.error("Google Sheets sync error:", error);

    setGoogleSyncMessage(
      error instanceof Error
        ? error.message
        : "Google Sheets sync failed."
    );
  } finally {
    setGoogleSyncing(false);
  }
};
  const [cancelOrderError, setCancelOrderError] = useState("");

  // Cloud categories are the source of truth for Billing and Menu Management.
  const [cloudCategories, setCloudCategories] = useState<CategoryRecord[]>(
    CATEGORIES.map((name, index) => ({
      id: `fallback-${index}`,
      name,
      image: CATEGORY_IMAGES[name] || makeImage("🍽️", name),
      sortOrder: index + 1,
    }))
  );

  // ----------------------------------------------------------
  // MENU + CATEGORY MANAGEMENT
  // ----------------------------------------------------------

  const [editingMenuId, setEditingMenuId] = useState<string | null>(null);
  const [menuForm, setMenuForm] = useState({
    name: "",
    price: "",
    category: CATEGORIES[0],
    image: "",
  });
  const [menuSaving, setMenuSaving] = useState(false);
  const [menuUploadingImage, setMenuUploadingImage] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [menuAdminError, setMenuAdminError] = useState("");
  const [menuSuccessMessage, setMenuSuccessMessage] = useState("");
  const menuNameInputRef = useRef<HTMLInputElement | null>(null);
  const menuImageInputRef = useRef<HTMLInputElement | null>(null);

  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    image: "",
    sortOrder: "",
  });
  const [categorySaving, setCategorySaving] = useState(false);
  const [categoryUploadingImage, setCategoryUploadingImage] = useState(false);
  const [selectedCategoryImageFile, setSelectedCategoryImageFile] = useState<File | null>(null);
  const [categoryAdminError, setCategoryAdminError] = useState("");
  const [categorySuccessMessage, setCategorySuccessMessage] = useState("");
  const categoryNameInputRef = useRef<HTMLInputElement | null>(null);
  const categoryImageInputRef = useRef<HTMLInputElement | null>(null);

  // ----------------------------------------------------------
  // LOAD MENU FROM SUPABASE
  // ----------------------------------------------------------

  const [cloudMenu, setCloudMenu] = useState<MenuItem[]>(MENU_DATA);
  const [menuLoading, setMenuLoading] = useState(true);

  const refreshCloudMenu = async () => {
    const { data: categories, error: categoryError } = await supabase
      .from("Categories")
      .select("id, Name, Image_url, Sort_order, Active")
      .eq("Active", true)
      .order("Sort_order", { ascending: true });

    if (categoryError) {
      throw new Error(categoryError.message);
    }

    const convertedCategories: CategoryRecord[] = (categories || []).map((category) => ({
      id: String(category.id),
      name: category.Name,
      image: category.Image_url || CATEGORY_IMAGES[category.Name] || makeImage("🍽️", category.Name),
      sortOrder: Number(category.Sort_order ?? 0),
    }));

    // Supabase is the source of truth. Keep an empty array empty so a removed
    // category does not silently reappear from the local fallback list.
    setCloudCategories(convertedCategories);

    const { data: menuItems, error: menuError } = await supabase
      .from("Menu_Items")
      .select("id, Category_id, Name, Price, Image_url, Active")
      .order("id", { ascending: true });

    if (menuError) {
      throw new Error(menuError.message);
    }

    const categoryMap = new Map(
      (categories || []).map((category) => [
        String(category.id),
        category.Name,
      ])
    );

    const convertedMenu: MenuItem[] = (menuItems || [])
      .filter((item) => item.Active !== false)
      .map((item) => ({
        id: String(item.id),
        name: item.Name,
        price: Number(item.Price),
        category: categoryMap.get(String(item.Category_id)) || "",
        image: item.Image_url || getMenuItemPhoto(item.Name, categoryMap.get(String(item.Category_id))),
      }))
      .filter((item) => item.category);

    // Supabase is the source of truth. Keep an empty menu empty so deactivated
    // items do not silently reappear from the local fallback list.
    setCloudMenu(convertedMenu);
  };

  const resetCategoryForm = () => {
    setEditingCategoryId(null);
    setSelectedCategoryImageFile(null);
    setCategoryForm({ name: "", image: "", sortOrder: "" });
    setCategoryAdminError("");
    if (categoryImageInputRef.current) categoryImageInputRef.current.value = "";
  };

  const startNewCategory = () => {
    resetCategoryForm();
    setCategorySuccessMessage("");
    window.setTimeout(() => categoryNameInputRef.current?.focus(), 50);
  };

  const startEditCategory = (category: CategoryRecord) => {
    setEditingCategoryId(category.id);
    setSelectedCategoryImageFile(null);
    setCategoryForm({
      name: category.name,
      image: category.image.startsWith("data:image") ? "" : category.image,
      sortOrder: String(category.sortOrder || ""),
    });
    setCategoryAdminError("");
    setCategorySuccessMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCategoryImageChange = (file: File | null) => {
    setCategoryAdminError("");
    setCategorySuccessMessage("");
    if (!file) { setSelectedCategoryImageFile(null); return; }
    if (!file.type.startsWith("image/")) {
      setSelectedCategoryImageFile(null);
      setCategoryAdminError("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSelectedCategoryImageFile(null);
      setCategoryAdminError("Image must be 5 MB or smaller.");
      return;
    }
    setSelectedCategoryImageFile(file);
  };

  const uploadCategoryImage = async (file: File) => {
    setCategoryUploadingImage(true);
    try {
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const safeName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "category";
      const path = `categories/${crypto.randomUUID()}-${safeName}.${extension}`;
      const { error } = await supabase.storage.from("menu-images").upload(path, file, {
        cacheControl: "3600", upsert: false, contentType: file.type,
      });
      if (error) throw new Error(error.message);
      const { data } = supabase.storage.from("menu-images").getPublicUrl(path);
      if (!data.publicUrl) throw new Error("Unable to create the public image URL.");
      return data.publicUrl;
    } finally {
      setCategoryUploadingImage(false);
    }
  };

  const saveCategory = async () => {
    const name = categoryForm.name.trim();
    const sortOrder = Number(categoryForm.sortOrder || cloudCategories.length + 1);
    if (!name) { setCategoryAdminError("Please enter the category name."); return; }
    if (!Number.isFinite(sortOrder) || sortOrder < 0) { setCategoryAdminError("Please enter a valid display order."); return; }
    setCategorySaving(true);
    setCategoryAdminError("");
    try {
      const duplicateQuery = supabase.from("Categories").select("id").eq("Name", name);
      if (editingCategoryId) duplicateQuery.neq("id", Number(editingCategoryId));
      const { data: duplicate, error: duplicateError } = await duplicateQuery.maybeSingle();
      if (duplicateError) throw new Error(duplicateError.message);
      if (duplicate) throw new Error("A category with this name already exists.");

      let imageUrl = categoryForm.image.trim() || null;
      if (selectedCategoryImageFile) imageUrl = await uploadCategoryImage(selectedCategoryImageFile);

      if (editingCategoryId) {
        const { error } = await supabase.from("Categories").update({ Name: name, Image_url: imageUrl, Sort_order: sortOrder, Active: true }).eq("id", Number(editingCategoryId));
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase.from("Categories").insert({ Name: name, Image_url: imageUrl, Sort_order: sortOrder, Active: true });
        if (error) throw new Error(error.message);
      }

      await refreshCloudMenu();
      const wasEditing = Boolean(editingCategoryId);
      resetCategoryForm();
      setCategorySuccessMessage(wasEditing ? "Category updated successfully." : "Category added successfully.");
      if (!wasEditing) { setActiveTab("billing"); setSelectedCategory(name); }
    } catch (error) {
      console.error("Category save error:", error);
      setCategoryAdminError(error instanceof Error ? error.message : "Unable to save category.");
    } finally { setCategorySaving(false); }
  };

  const deactivateCategory = async (category: CategoryRecord) => {
    if (!window.confirm(`Deactivate category ${category.name}? Its menu items will no longer appear for new orders.`)) return;
    setCategorySaving(true);
    setCategoryAdminError("");
    try {
      const { error } = await supabase.from("Categories").update({ Active: false }).eq("id", Number(category.id));
      if (error) throw new Error(error.message);
      if (selectedCategory === category.name) setSelectedCategory(null);
      await refreshCloudMenu();
    } catch (error) {
      setCategoryAdminError(error instanceof Error ? error.message : "Unable to deactivate category.");
    } finally { setCategorySaving(false); }
  };

  const resetMenuForm = () => {
    setEditingMenuId(null);
    setSelectedImageFile(null);
    setMenuForm({
      name: "",
      price: "",
      category: cloudCategories[0]?.name || CATEGORIES[0],
      image: "",
    });
    setMenuAdminError("");
    if (menuImageInputRef.current) {
      menuImageInputRef.current.value = "";
    }
  };

  const startNewMenuItem = () => {
    resetMenuForm();
    setMenuSuccessMessage("");
    setActiveTab("menu");
    window.setTimeout(() => {
      menuNameInputRef.current?.focus();
    }, 50);
  };

  const startEditMenuItem = (item: MenuItem) => {
    setEditingMenuId(item.id);
    setSelectedImageFile(null);
    setMenuForm({
      name: item.name,
      price: String(item.price),
      category: item.category,
      image: item.image.startsWith("data:image") ? "" : item.image,
    });
    setMenuAdminError("");
    setMenuSuccessMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleMenuImageChange = (file: File | null) => {
    setMenuAdminError("");
    setMenuSuccessMessage("");

    if (!file) {
      setSelectedImageFile(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setSelectedImageFile(null);
      setMenuAdminError("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSelectedImageFile(null);
      setMenuAdminError("Image must be 5 MB or smaller.");
      return;
    }

    setSelectedImageFile(file);
  };

  const uploadMenuImage = async (file: File) => {
    setMenuUploadingImage(true);

    try {
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const safeName = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9_-]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60) || "menu-item";
      const path = `menu/${crypto.randomUUID()}-${safeName}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("menu-images")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const { data } = supabase.storage
        .from("menu-images")
        .getPublicUrl(path);

      if (!data.publicUrl) {
        throw new Error("Unable to create the public image URL.");
      }

      return data.publicUrl;
    } finally {
      setMenuUploadingImage(false);
    }
  };

  const saveMenuItem = async () => {
    const name = menuForm.name.trim();
    const price = Number(menuForm.price);

    if (!name) {
      setMenuAdminError("Please enter the item name.");
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setMenuAdminError("Please enter a valid price.");
      return;
    }

    setMenuSaving(true);
    setMenuAdminError("");

    try {
      const { data: category, error: categoryError } = await supabase
        .from("Categories")
        .select("id")
        .eq("Name", menuForm.category)
        .eq("Active", true)
        .maybeSingle();

      if (categoryError || !category) {
        throw new Error(
          categoryError?.message || "Selected category was not found."
        );
      }

      let imageUrl = menuForm.image.trim() || null;

      if (selectedImageFile) {
        imageUrl = await uploadMenuImage(selectedImageFile);
      }

      if (editingMenuId) {
        const { error } = await supabase
          .from("Menu_Items")
          .update({
            Category_id: category.id,
            Name: name,
            Price: price,
            Image_url: imageUrl,
            Active: true,
          })
          .eq("id", Number(editingMenuId));

        if (error) {
          throw new Error(error.message);
        }
      } else {
        const { error } = await supabase
          .from("Menu_Items")
          .insert({
            Category_id: category.id,
            Name: name,
            Price: price,
            Image_url: imageUrl,
            Active: true,
          });

        if (error) {
          throw new Error(error.message);
        }
      }

      await refreshCloudMenu();

      const wasEditing = Boolean(editingMenuId);
      const savedCategory = menuForm.category;

      resetMenuForm();
      setMenuSuccessMessage(
        wasEditing
          ? "Menu item updated successfully."
          : "Menu item added successfully. It is now available for ordering."
      );

      // New items should be immediately orderable. Open Billing and the
      // saved category so the newly added card is visible without another refresh.
      if (!wasEditing) {
        setActiveDestination(activeDestination);
        setSelectedCategory(savedCategory);
        setActiveTab("billing");
      }
    } catch (error) {
      console.error("Menu save error:", error);
      setMenuAdminError(
        error instanceof Error ? error.message : "Unable to save menu item."
      );
    } finally {
      setMenuSaving(false);
    }
  };

  const deactivateMenuItem = async (item: MenuItem) => {
    if (!window.confirm(`Deactivate ${item.name}?`)) {
      return;
    }

    setMenuSaving(true);
    setMenuAdminError("");

    try {
      const { error } = await supabase
        .from("Menu_Items")
        .update({ Active: false })
        .eq("id", Number(item.id));

      if (error) {
        throw new Error(error.message);
      }

      if (editingMenuId === item.id) {
        resetMenuForm();
      }

      await refreshCloudMenu();
    } catch (error) {
      console.error("Menu deactivate error:", error);
      setMenuAdminError(
        error instanceof Error
          ? error.message
          : "Unable to deactivate menu item."
      );
    } finally {
      setMenuSaving(false);
    }
  };

  useEffect(() => {
    async function loadMenuFromSupabase() {
      setMenuLoading(true);

      try {
        // Expected Supabase structure:
        // categories: id, name, image_url, sort_order, active
        // menu_items: id, category_id, name, price, image_url, active
        const { data: categories, error: categoryError } =
          await supabase
            .from("Categories")
            .select("id, Name, Image_url, Sort_order, Active")
            .eq("Active", true)
            .order("Sort_order", { ascending: true });

        if (categoryError) {
          console.error("Supabase categories error:", categoryError);
          setCloudMenu(MENU_DATA);
          return;
        }

        const { data: menuItems, error: menuError } =
          await supabase
            .from("Menu_Items")
            .select("id, Category_id, Name, Price, Image_url, Active")
            .eq("Active", true)
            .order("id", { ascending: true });

        if (menuError) {
          console.error("Supabase menu_items error:", menuError);
          setCloudMenu(MENU_DATA);
          return;
        }

        const categoryMap = new Map(
          (categories || []).map((category) => [
            String(category.id),
            category.Name,
          ])
        );

        const convertedMenu: MenuItem[] = (menuItems || [])
          .map((item) => ({
            id: String(item.id),
            name: item.Name,
            price: Number(item.Price),
            category: categoryMap.get(String(item.Category_id)) || "",
            image: item.Image_url || getMenuItemPhoto(item.Name, categoryMap.get(String(item.Category_id))),
          }))
          .filter((item) => item.category);

        // Keep the working menu if Supabase is empty.
        setCloudMenu(
          convertedMenu.length > 0 ? convertedMenu : MENU_DATA
        );
      } catch (error) {
        console.error("Unable to load menu from Supabase:", error);
        setCloudMenu(MENU_DATA);
      } finally {
        setMenuLoading(false);
      }
    }

    loadMenuFromSupabase();
  }, []);

  // Refresh the cloud menu whenever we return to Billing.
  // This makes newly added/edited Menu Management items immediately
  // available as billable items without requiring a full page reload.
  useEffect(() => {
    if (activeTab !== "billing") {
      return;
    }

    refreshCloudMenu().catch((error) => {
      console.error("Unable to refresh menu for Billing:", error);
    });
  }, [activeTab]);

  // ----------------------------------------------------------
  // LOAD HISTORY FROM SUPABASE
  // ----------------------------------------------------------

  useEffect(() => {
    async function loadHistoryFromSupabase() {
      try {
        const { data: orders, error: ordersError } = await supabase
          .from("Orders")
          .select(
  "id, created_at, Order_number, Table_id, Total, Order_type, Payment_type, Status"
)
          .order("created_at", { ascending: false });

        if (ordersError) {
          console.error("Supabase orders error:", ordersError);
          return;
        }

        if (!orders || orders.length === 0) {
          setBillHistory([]);
          return;
        }

        const orderIds = orders.map((order) => order.id);

        const { data: orderItems, error: orderItemsError } = await supabase
          .from("Order_Items")
          .select(
            "id, created_at, Order_id, Menu_item_id, Item_name, Unit_price, Quantity, Line_Total"
          )
          .in("Order_id", orderIds)
          .order("created_at", { ascending: true });

        if (orderItemsError) {
          console.error("Supabase order items error:", orderItemsError);
          return;
        }

        const itemsByOrder = new Map<string, OrderItem[]>();

        (orderItems || []).forEach((item) => {
          const key = String(item.Order_id);
          const existing = itemsByOrder.get(key) || [];

          existing.push({
            id: String(item.Menu_item_id ?? item.id),
            name: item.Item_name,
            price: Number(item.Unit_price),
            quantity: Number(item.Quantity),
          });

          itemsByOrder.set(key, existing);
        });

        const convertedHistory: BillRecord[] = orders.map((order) => ({
          id: `MZ-${String(Number(order.Order_number)).padStart(4, "0")}`,
          dbId: String(order.id),
          orderNumber: Number(order.Order_number),
          orderType: order.Order_type || "Takeaway",
paymentType: order.Payment_type || "Cash",
items: itemsByOrder.get(String(order.id)) || [],
total: Number(order.Total),
status: String(order.Status || "Completed"),
          timestamp: new Date(order.created_at).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
          }),
          createdAt: new Date(order.created_at).getTime(),
        }));

        setBillHistory(convertedHistory);
      } catch (error) {
        console.error("Unable to load billing history from Supabase:", error);
      }
    }

    loadHistoryFromSupabase();
  }, [activeTab]);

  // History and Analytics are always refreshed from Supabase when their
  // tabs are opened. This keeps the cloud database as the source of truth
  // when the cafe is being used from multiple devices.

  // ----------------------------------------------------------
  // CURRENT ORDER
  // ----------------------------------------------------------

  const currentOrder =
    activeOrders[activeDestination] || [];

  const totalAmount = currentOrder.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );

  // ----------------------------------------------------------
  // ADD ITEM
  // ----------------------------------------------------------

  const addToOrder = (item: MenuItem) => {
    setActiveOrders((previous) => {
      const current =
        previous[activeDestination] || [];

      const existing = current.find(
        (x) => x.id === item.id
      );

      if (existing) {
        return {
          ...previous,
          [activeDestination]: current.map(
            (x) =>
              x.id === item.id
                ? {
                    ...x,
                    quantity: x.quantity + 1,
                  }
                : x
          ),
        };
      }

      return {
        ...previous,
        [activeDestination]: [
          ...current,
          {
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: 1,
            image: item.image,
          },
        ],
      };
    });
  };

  // ----------------------------------------------------------
  // UPDATE QUANTITY
  // ----------------------------------------------------------

  const updateQuantity = (
    itemId: string,
    change: number
  ) => {
    setActiveOrders((previous) => {
      const current =
        previous[activeDestination] || [];

      const updated = current
        .map((item) => {
          if (item.id !== itemId) {
            return item;
          }

          const quantity =
            item.quantity + change;

          return quantity > 0
            ? {
                ...item,
                quantity,
              }
            : null;
        })
        .filter(
          (item): item is OrderItem =>
            item !== null
        );

      return {
        ...previous,
        [activeDestination]: updated,
      };
    });
  };

  // ----------------------------------------------------------
  // COMPLETE BILL
  // ----------------------------------------------------------

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  const handleCheckout = async () => {
    if (currentOrder.length === 0 || isCheckingOut) {
      return;
    }

    setIsCheckingOut(true);
    setCheckoutError("");

    try {
      // The order already stores the selected destination as text
      // (Table 1 / Table 2 / Table 3 / Takeaway). We do not need to
      // look up Restaurant_Tables here, which keeps billing independent
      // of the exact column naming in that table.
      const tableId = null;

      // Get the next order number from Supabase.
      const { data: existingOrders, error: numberError } = await supabase
        .from("Orders")
        .select("Order_number")
        .order("Order_number", { ascending: false })
        .limit(1);

      if (numberError) {
        throw new Error(
          `Unable to create order number: ${numberError.message}`
        );
      }

      const highestOrderNumber =
        existingOrders && existingOrders.length > 0
          ? Number(existingOrders[0].Order_number) || 0
          : 0;

      const nextOrderNumber = highestOrderNumber + 1;

      // Create the main order.
      const { data: createdOrder, error: orderError } = await supabase
        .from("Orders")
        .insert({
  Order_number: nextOrderNumber,
  Table_id: tableId,
  Total: totalAmount,
  Order_type: activeDestination,
  Payment_type: paymentType,
  Status: "Completed",
})
        .select(
  "id, created_at, Order_number, Table_id, Total, Order_type, Payment_type, Status"
)
        .single();

      if (orderError || !createdOrder) {
        throw new Error(
          `Unable to save order: ${
            orderError?.message || "No order was returned"
          }`
        );
      }

      // Save every item with its historical name and price.
      const orderItemRows = currentOrder.map((item) => ({
        Order_id: createdOrder.id,
        // Menu_item_id is bigint in Supabase.
        // Local fallback menu IDs such as "b3" are not bigint values,
        // so keep the historical item name/price and leave the FK empty.
        Menu_item_id: /^\d+$/.test(String(item.id))
          ? Number(item.id)
          : null,
        Item_name: item.name,
        Unit_price: item.price,
        Quantity: item.quantity,
        Line_Total: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("Order_Items")
        .insert(orderItemRows);

      if (itemsError) {
        // Remove the main order if its items could not be saved.
        await supabase
          .from("Orders")
          .delete()
          .eq("id", createdOrder.id);

        throw new Error(
          `Unable to save order items: ${itemsError.message}`
        );
      }

      const newBill: BillRecord = {
        id: `MZ-${String(nextOrderNumber).padStart(4, "0")}`,
        dbId: String(createdOrder.id),
        orderNumber: nextOrderNumber,
        orderType: activeDestination,
paymentType: paymentType,
status: "Completed",
        items: currentOrder.map((item) => ({
          ...item,
        })),
        total: totalAmount,
        timestamp: new Date(createdOrder.created_at).toLocaleString(
          "en-IN",
          {
            dateStyle: "medium",
            timeStyle: "short",
          }
        ),
        createdAt: new Date(createdOrder.created_at).getTime(),
      };

      // Update the screen immediately after the cloud save succeeds.
      setBillHistory((previous) => [newBill, ...previous]);
      // Sync the latest Supabase data to Google Sheets
try {
  const syncResponse = await fetch("/api/google-sync");

  if (!syncResponse.ok) {
    console.error("Google Sheets automatic sync failed.");
  } else {
    const syncResult = await syncResponse.json();

    if (!syncResult.success) {
      console.error(
        "Google Sheets automatic sync failed:",
        syncResult.error || syncResult.message
      );
    } else {
      console.log(
        "Google Sheets automatically synced after checkout."
      );
    }
  }
} catch (syncError) {
  console.error(
    "Google Sheets automatic sync error:",
    syncError
  );
}

      // Clear current cart automatically.
      setActiveOrders((previous) => ({
        ...previous,
        [activeDestination]: [],
      }));
    } catch (error) {
      console.error("Complete Bill error:", error);
      setCheckoutError(
        error instanceof Error
          ? error.message
          : "Unable to complete the bill. Please try again."
      );
    } finally {
      setIsCheckingOut(false);
    }
  };

  // ----------------------------------------------------------
  // CANCEL ORDER
  // ----------------------------------------------------------

  const cancelOrder = async (bill: BillRecord) => {
    if (bill.status.toLowerCase() === "cancelled" || cancellingOrderId) {
      return;
    }

    setCancellingOrderId(bill.dbId);
    setCancelOrderError("");

    try {
      const { data, error } = await supabase
        .from("Orders")
        .update({ Status: "Cancelled" })
        .eq("id", bill.dbId)
        .select("id, Status")
        .single();

      if (error) {
        throw new Error(
          `Unable to cancel order: ${error.message}`
        );
      }

      if (!data || String(data.Status).toLowerCase() !== "cancelled") {
        throw new Error(
          "The order was not updated in Supabase. Please check the Orders UPDATE policy."
        );
      }

      // Immediately update the screen after Supabase confirms the change.
      setBillHistory((previous) =>
        previous.map((item) =>
          item.dbId === bill.dbId
            ? { ...item, status: "Cancelled" }
            : item
        )
      );
    } catch (error) {
      console.error("Cancel order error:", error);
      setCancelOrderError(
        error instanceof Error
          ? error.message
          : "Unable to cancel the order."
      );
    } finally {
      setCancellingOrderId(null);
    }
  };

  // ----------------------------------------------------------
  // CATEGORY MENU
  // ----------------------------------------------------------

  const selectedItems = useMemo(() => {
    if (!selectedCategory) {
      return [];
    }

    return cloudMenu.filter(
      (item) =>
        item.category === selectedCategory
    );
  }, [selectedCategory, cloudMenu]);

  // ----------------------------------------------------------
  // HISTORY
  // ----------------------------------------------------------

  const visibleHistory = useMemo(() => {
    const sorted = [...billHistory].sort(
      (a, b) =>
        (b.createdAt || 0) -
        (a.createdAt || 0)
    );

    return sorted.filter((bill) => {
      const matchesDestination = historyDestination
        ? bill.orderType === historyDestination
        : true;

      const status = bill.status.toLowerCase();
      const matchesStatus =
        historyStatusFilter === "all" ||
        status === historyStatusFilter;

      return matchesDestination && matchesStatus;
    });
  }, [
    billHistory,
    historyDestination,
    historyStatusFilter,
  ]);

  // ----------------------------------------------------------
  // DESTINATION SCORECARD
  // ----------------------------------------------------------

  const getDestinationStats = (
    destination: string
  ) => {
    const orders = billHistory.filter(
      (bill) =>
        bill.orderType === destination &&
        bill.status.toLowerCase() === "completed"
    );

    const sales = orders.reduce(
      (sum, bill) =>
        sum + bill.total,
      0
    );

    const itemsSold = orders.reduce(
      (sum, bill) =>
        sum +
        bill.items.reduce(
          (itemSum, item) =>
            itemSum + item.quantity,
          0
        ),
      0
    );

    const averageBill =
      orders.length > 0
        ? sales / orders.length
        : 0;

    const itemMap: Record<string, number> = {};

    orders.forEach((bill) => {
      bill.items.forEach((item) => {
        itemMap[item.name] =
          (itemMap[item.name] || 0) +
          item.quantity;
      });
    });

    const mostOrdered =
      Object.entries(itemMap).sort(
        (a, b) => b[1] - a[1]
      )[0];

    return {
      orders: orders.length,
      sales,
      itemsSold,
      averageBill,
      mostOrdered,
    };
  };

  // ----------------------------------------------------------
  // ANALYTICS
  // ----------------------------------------------------------

  const getAnalyticsDateRange = useMemo(() => {
  const now = new Date();
  if (analyticsPeriod === "Custom") {
  const start = customStartDate
    ? new Date(`${customStartDate}T00:00:00`)
    : new Date();

  const end = customEndDate
    ? new Date(`${customEndDate}T23:59:59.999`)
    : new Date();

  return { start, end };
}

  if (analyticsPeriod === "Today") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);

    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

  if (analyticsPeriod === "Yesterday") {
    const start = new Date(now);
    start.setDate(start.getDate() - 1);
    start.setHours(0, 0, 0, 0);

    const end = new Date(now);
    end.setDate(end.getDate() - 1);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

  if (analyticsPeriod === "This Week") {
    const start = new Date(now);
    const day = start.getDay();
    const difference = day === 0 ? 6 : day - 1;

    start.setDate(start.getDate() - difference);
    start.setHours(0, 0, 0, 0);

    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

  // This Month
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}, [analyticsPeriod, customStartDate, customEndDate]);
const analytics = useMemo(() => {
    const itemMap: Record<string, number> =
      {};

    let totalSales = 0;
    const filteredBills = billHistory.filter((bill) => {
  const billDate = new Date(bill.timestamp);

  return (
    bill.status.toLowerCase() === "completed" &&
    billDate >= getAnalyticsDateRange.start &&
    billDate <= getAnalyticsDateRange.end
  );
});

filteredBills.forEach((bill) => {      totalSales += bill.total;

      bill.items.forEach((item) => {
        itemMap[item.name] =
          (itemMap[item.name] || 0) +
          item.quantity;
      });
    });

    const sortedItems =
      Object.entries(itemMap).sort(
        (a, b) => b[1] - a[1]
      );

    const cancelledOrders = billHistory.filter(
      (bill) => bill.status.toLowerCase() === "cancelled"
    );

    return {
      todaySales: billHistory
  .filter(
    (bill) =>
      bill.status.toLowerCase() === "completed" &&
      new Date(bill.timestamp).toDateString() === new Date().toDateString()
  )
  .reduce((sum, bill) => sum + bill.total, 0),

todayOrders: billHistory.filter(
  (bill) =>
    bill.status.toLowerCase() === "completed" &&
    new Date(bill.timestamp).toDateString() === new Date().toDateString()
).length,

todayCashSales: billHistory
  .filter(
    (bill) =>
      bill.status.toLowerCase() === "completed" &&
      bill.paymentType === "Cash" &&
      new Date(bill.timestamp).toDateString() === new Date().toDateString()
  )
  .reduce((sum, bill) => sum + bill.total, 0),

todayOnlineSales: billHistory
  .filter(
    (bill) =>
      bill.status.toLowerCase() === "completed" &&
      bill.paymentType === "Online" &&
      new Date(bill.timestamp).toDateString() === new Date().toDateString()
  )
  .reduce((sum, bill) => sum + bill.total, 0),
  totalSales,

  totalOrders: filteredBills.length,

  itemsSold: Object.values(itemMap).reduce(
    (sum, value) => sum + value,
    0
  ),

  topItems: sortedItems.slice(0, 10),

  cancelledOrders: cancelledOrders.length,

  cancelledValue: cancelledOrders.reduce(
    (sum, bill) => sum + bill.total,
    0
  ),

  cashSales: filteredBills
  .filter((bill) => bill.paymentType === "Cash")
  .reduce((sum, bill) => sum + bill.total, 0),

  onlineSales: filteredBills
  .filter((bill) => bill.paymentType === "Online")
  .reduce((sum, bill) => sum + bill.total, 0),
periodSales: filteredBills.reduce(
  (sum, bill) => sum + bill.total,
  0
),

periodOrders: filteredBills.length,

periodCashSales: filteredBills
  .filter((bill) => bill.paymentType === "Cash")
  .reduce((sum, bill) => sum + bill.total, 0),

periodOnlineSales: filteredBills
  .filter((bill) => bill.paymentType === "Online")
  .reduce((sum, bill) => sum + bill.total, 0),
  cashOrders: filteredBills.filter(
  (bill) => bill.paymentType === "Cash"
).length,

  onlineOrders: filteredBills.filter(
  (bill) => bill.paymentType === "Online"
).length,
};
  }, [billHistory, getAnalyticsDateRange]);
  const reportData = useMemo(() => {
  const { start, end } = getAnalyticsDateRange;

  const periodBills = billHistory.filter((bill) => {
    const billDate = new Date(bill.timestamp);

    return (
      billDate >= start &&
      billDate <= end
    );
  });

  const completedBills = periodBills.filter(
    (bill) => bill.status.toLowerCase() === "completed"
  );

  const cancelledBills = periodBills.filter(
    (bill) => bill.status.toLowerCase() === "cancelled"
  );

  const cashSales = completedBills
    .filter((bill) => bill.paymentType === "Cash")
    .reduce((sum, bill) => sum + bill.total, 0);

  const onlineSales = completedBills
    .filter((bill) => bill.paymentType === "Online")
    .reduce((sum, bill) => sum + bill.total, 0);

  const itemsSold = completedBills.reduce(
    (sum, bill) =>
      sum +
      bill.items.reduce(
        (itemSum, item) =>
          itemSum + item.quantity,
        0
      ),
    0
  );

  return {
    periodBills,
    completedBills,
    cancelledBills,
    totalSales: completedBills.reduce(
      (sum, bill) => sum + bill.total,
      0
    ),
    totalOrders: completedBills.length,
    cashSales,
    onlineSales,
    itemsSold,
    cancelledValue: cancelledBills.reduce(
      (sum, bill) => sum + bill.total,
      0
    ),
  };
}, [billHistory, getAnalyticsDateRange]);

  // ============================================================
  // UI
  // ============================================================

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800">

        <div className="px-4 md:px-6 py-3">

          <div className="flex items-center justify-between gap-4">

            {/* LOGO */}

            <div className="flex items-center gap-3">

              <div className="w-12 h-12 rounded-full overflow-hidden bg-red-600 flex items-center justify-center">

                <span className="text-2xl">
                  🍔
                </span>

              </div>

              <h1 className="text-xl md:text-2xl font-black text-red-500 tracking-wider">
                MILLENNIALZ
              </h1>

            </div>

            {/* NAV */}

            <nav className="flex gap-2">

              <button
                onClick={() =>
                  setActiveTab("billing")
                }
                className={`px-4 py-2 rounded-lg text-xs md:text-sm font-bold ${
                  activeTab === "billing"
                    ? "bg-red-600 text-white"
                    : "bg-slate-800 text-slate-300"
                }`}
              >
                Billing
              </button>

              <button
                onClick={() =>
                  setActiveTab("history")
                }
                className={`px-4 py-2 rounded-lg text-xs md:text-sm font-bold ${
                  activeTab === "history"
                    ? "bg-red-600 text-white"
                    : "bg-slate-800 text-slate-300"
                }`}
              >
                History
              </button>

              <button
                onClick={() =>
                  setActiveTab("analytics")
                }
                className={`px-4 py-2 rounded-lg text-xs md:text-sm font-bold ${
                  activeTab === "analytics"
                    ? "bg-purple-600 text-white"
                    : "bg-slate-800 text-slate-300"
                }`}
              >
                Analytics
              </button>

              <button
                onClick={startNewMenuItem}
                className={`px-4 py-2 rounded-lg text-xs md:text-sm font-bold ${
                  activeTab === "menu"
                    ? "bg-red-600 text-white"
                    : "bg-slate-800 text-slate-300"
                }`}
              >
                Menu
              </button>

            </nav>

          </div>

        </div>

      </header>

      {/* ======================================================
          BILLING
      ====================================================== */}

      {activeTab === "billing" && (

        <div className="grid grid-cols-1 lg:grid-cols-12">

          {/* LEFT SIDE */}

          <section className="lg:col-span-8 p-4 md:p-6">

            {/* DESTINATIONS */}

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-5">

              <p className="text-xs uppercase font-bold text-slate-400 mb-3">
                Select Table / Takeaway
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

                {ORDER_DESTINATIONS.map(
                  (destination) => {

                    const activeCount =
                      (
                        activeOrders[
                          destination
                        ] || []
                      ).reduce(
                        (sum, item) =>
                          sum +
                          item.quantity,
                        0
                      );

                    const stats =
                      getDestinationStats(
                        destination
                      );

                    return (
                      <button
                        key={destination}
                        onClick={() => {
                          setActiveDestination(
                            destination
                          );

                          setSelectedCategory(
                            null
                          );
                        }}
                        className={`rounded-xl border p-4 text-left transition ${
                          activeDestination ===
                          destination
                            ? "bg-red-600 border-red-500"
                            : "bg-slate-800 border-slate-700 hover:bg-slate-700"
                        }`}
                      >

                        <div className="flex justify-between items-center">

                          <span className="font-black">
                            {destination}
                          </span>

                          {activeCount >
                            0 && (
                            <span className="bg-amber-400 text-black text-[10px] font-black rounded-full px-2 py-1">
                              {activeCount}
                            </span>
                          )}

                        </div>

                        <p className="text-xs opacity-80 mt-2">
                          {activeCount > 0
                            ? `${activeCount} item(s) in current bill`
                            : `${stats.orders} completed order(s)`}
                        </p>

                      </button>
                    );
                  }
                )}

              </div>

            </div>

            {/* NEW ORDER TITLE */}

            <div className="flex items-center justify-between mb-4">

              <div>

                <h2 className="text-xl font-black">
                  New Order
                </h2>

                <p className="text-xs text-red-400 font-bold mt-1">
                  {activeDestination}
                </p>

              </div>

              {selectedCategory && (
                <button
                  onClick={() =>
                    setSelectedCategory(null)
                  }
                  className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg"
                >
                  ← Categories
                </button>
              )}

            </div>

            {/* CATEGORY CARDS */}

            {!selectedCategory && menuLoading && (
              <div className="mb-4 rounded-xl border border-slate-800 bg-slate-900 p-4 text-center text-xs text-slate-400">
                Loading menu...
              </div>
            )}

            {!selectedCategory && (

              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">

                {cloudCategories.map(
                  (categoryRecord) => (

                    <button
                      key={categoryRecord.id}
                      onClick={() =>
                        setSelectedCategory(
                          categoryRecord.name
                        )
                      }
                      className="group overflow-hidden bg-slate-900 border border-slate-800 hover:border-red-500 rounded-2xl text-left transition"
                    >

                      <div className="aspect-[4/3] overflow-hidden">

                        <img
                          src={categoryRecord.image}
                          onError={(event) => {
                            const fallback = CATEGORY_IMAGES[categoryRecord.name] || makeImage("🍽️", categoryRecord.name);
                            if (event.currentTarget.src !== fallback) event.currentTarget.src = fallback;
                          }}
                          alt={categoryRecord.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />

                      </div>

                      <div className="p-3">

                        <h3 className="font-bold text-sm">
                          {categoryRecord.name}
                        </h3>

                        <p className="text-[11px] text-slate-500 mt-1">
                          Tap to view menu
                        </p>

                      </div>

                    </button>

                  )
                )}

              </div>

            )}

            {/* MENU ITEMS */}

            {selectedCategory && (

              <div>

                <div className="flex items-center justify-between mb-4">

                  <div>

                    <h2 className="text-lg font-black text-red-400">
                      {selectedCategory}
                    </h2>

                    <p className="text-xs text-slate-500">
                      Tap any item to add it to the bill
                    </p>

                  </div>

                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

                  {selectedItems.map(
                    (item) => (

                      <button
                        key={item.id}
                        onClick={() =>
                          addToOrder(item)
                        }
                        className="group bg-slate-900 border border-slate-800 hover:border-red-500 rounded-2xl overflow-hidden text-left transition active:scale-[0.98]"
                      >

                        <div className="aspect-[4/3] overflow-hidden">

                          <img
                            src={item.image}
                            alt={item.name}
                            onError={(event) => {
                              const fallback = CATEGORY_IMAGES[item.category] || makeImage("🍽️", item.name);
                              if (event.currentTarget.src !== fallback) {
                                event.currentTarget.src = fallback;
                              }
                            }}
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />

                        </div>

                        <div className="p-3">

                          <h3 className="font-bold text-sm leading-tight">
                            {item.name}
                          </h3>

                          <div className="flex justify-between items-center mt-3">

                            <span className="font-black text-base">
                              ₹{item.price}
                            </span>

                            <span className="bg-red-600 px-3 py-1.5 rounded-lg text-xs font-black">
                              + Add
                            </span>

                          </div>

                        </div>

                      </button>

                    )
                  )}

                </div>

              </div>

            )}

          </section>

          {/* ==================================================
              CURRENT BILL — RIGHT SIDE
          ================================================== */}

          <aside className="lg:col-span-4 bg-slate-900 border-l border-slate-800 lg:min-h-[calc(100vh-76px)] lg:sticky lg:top-[76px]">

            <div className="p-4 md:p-5">

              <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">

                <div>

                  <h2 className="text-xl font-black">
                    Current Bill
                  </h2>

                  <p className="text-xs text-red-400 font-bold">
                    {activeDestination}
                  </p>

                </div>

                <span className="bg-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold">
                  {currentOrder.reduce(
                    (sum, item) =>
                      sum +
                      item.quantity,
                    0
                  )}{" "}
                  Items
                </span>

              </div>

              {/* CART */}

              {currentOrder.length === 0 ? (

                <div className="py-16 text-center">

                  <div className="text-5xl mb-4">
                    🛒
                  </div>

                  <p className="font-bold text-slate-300">
                    No items yet
                  </p>

                  <p className="text-xs text-slate-500 mt-2">
                    Select a food item to add it to the bill.
                  </p>

                </div>

              ) : (

                <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">

                  {currentOrder.map(
                    (item) => (

                      <div
                        key={item.id}
                        className="bg-slate-950 border border-slate-800 rounded-xl p-3"
                      >

                        <div className="flex gap-3">

                          <img
                            src={
                              item.image ||
                              makeImage(
                                "🍽️",
                                item.name
                              )
                            }
                            alt={item.name}
                            className="w-14 h-14 rounded-lg object-cover"
                          />

                          <div className="flex-1 min-w-0">

                            <p className="text-xs font-bold">
                              {item.name}
                            </p>

                            <p className="text-xs text-slate-500 mt-1">
                              ₹{item.price} each
                            </p>

                            <div className="flex items-center gap-2 mt-2">

                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.id,
                                    -1
                                  )
                                }
                                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 font-black"
                              >
                                −
                              </button>

                              <span className="w-6 text-center text-sm font-black">
                                {item.quantity}
                              </span>

                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.id,
                                    1
                                  )
                                }
                                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 font-black"
                              >
                                +
                              </button>

                            </div>

                          </div>

                          <div className="text-right">

                            <p className="font-black text-sm">
                              ₹
                              {item.price *
                                item.quantity}
                            </p>

                          </div>

                        </div>

                      </div>

                    )
                  )}

                </div>

              )}
{/* TOTAL */}

              <div className="border-t border-slate-800 mt-5 pt-5">

                <div className="flex justify-between items-center">

                  <span className="text-lg font-bold">
                    Total
                  </span>

                  <span className="text-2xl font-black text-red-400">
                    ₹{totalAmount}
                  </span>

                </div>

                {checkoutError && (
  <p className="text-xs text-red-400 mt-3">
    {checkoutError}
  </p>
)}

{/* PAYMENT TYPE */}

<div className="mt-4">
  <p className="text-xs font-bold text-slate-400 mb-2">
    Payment Type
  </p>

  <div className="grid grid-cols-2 gap-2">
    <button
      type="button"
      onClick={() => setPaymentType("Cash")}
      className={`py-3 rounded-xl font-black text-sm ${
        paymentType === "Cash"
          ? "bg-green-600 text-white"
          : "bg-slate-800 text-slate-300"
      }`}
    >
      💵 Cash
    </button>

    <button
      type="button"
      onClick={() => setPaymentType("Online")}
      className={`py-3 rounded-xl font-black text-sm ${
        paymentType === "Online"
          ? "bg-blue-600 text-white"
          : "bg-slate-800 text-slate-300"
      }`}
    >
      📱 Online
    </button>
  </div>
</div>

<button
  disabled={
                    currentOrder.length === 0 || isCheckingOut
                  }
                  onClick={handleCheckout}
                  className={`w-full mt-5 py-4 rounded-xl font-black tracking-wide ${
                    currentOrder.length > 0 && !isCheckingOut
                      ? "bg-red-600 hover:bg-red-500 text-white"
                      : "bg-slate-800 text-slate-600 cursor-not-allowed"
                  }`}
                >
                  {isCheckingOut ? "SAVING..." : "COMPLETE BILL"}
                </button>

              </div>

            </div>

          </aside>

        </div>

      )}

      {/* ======================================================
          ORDER HISTORY
      ====================================================== */}

      {activeTab === "history" && (

        <section className="p-4 md:p-6">

          <div className="max-w-7xl mx-auto">

            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

  <div>
    <h2 className="text-2xl font-black">
      Sales Analytics
    </h2>

    <p className="text-xs text-slate-400 mt-1">
      Sales and item movement from completed orders
    </p>
  </div>

  <button
    onClick={syncToGoogleSheets}
    disabled={googleSyncing}
    className="px-5 py-3 rounded-xl bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-black text-sm shadow-lg"
  >
    {googleSyncing
      ? "⏳ Syncing..."
      : "🔄 Sync to Google Sheets"}
  </button>

</div>
{googleSyncMessage && (
  <div className="mb-6 rounded-xl border border-green-800 bg-green-950/40 px-4 py-3 text-sm text-green-300">
    {googleSyncMessage}
  </div>
)}

            {cancelOrderError && (
              <div className="mb-4 rounded-xl border border-red-900 bg-red-950/40 px-4 py-3 text-xs text-red-300">
                {cancelOrderError}
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">

              {/* ALL ORDERS */}

              <div className="xl:col-span-8">

                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

                  <div className="p-4 border-b border-slate-800 flex justify-between items-center">

                    <div>

                      <h3 className="font-black">
                        {historyDestination
                          ? `${historyDestination} Orders`
                          : "All Orders"}
                      </h3>

                      <p className="text-xs text-slate-500">
                        {visibleHistory.length} order(s)
                      </p>

                    </div>

                    {historyDestination && (
                      <button
                        onClick={() =>
                          setHistoryDestination(
                            null
                          )
                        }
                        className="text-xs bg-slate-800 px-3 py-2 rounded-lg"
                      >
                        Show All
                      </button>
                    )}

                    <div className="flex flex-wrap gap-2 ml-auto">
                      {(["all", "completed", "cancelled"] as const).map((status) => (
                        <button
                          key={status}
                          onClick={() => setHistoryStatusFilter(status)}
                          className={`text-[10px] px-3 py-2 rounded-lg font-black ${
                            historyStatusFilter === status
                              ? status === "cancelled"
                                ? "bg-red-600 text-white"
                                : "bg-slate-700 text-white"
                              : "bg-slate-950 text-slate-400"
                          }`}
                        >
                          {status === "all"
                            ? "ALL"
                            : status === "completed"
                              ? "COMPLETED"
                              : "CANCELLED"}
                        </button>
                      ))}
                    </div>

                  </div>

                  <div className="divide-y divide-slate-800">

                    {visibleHistory.length ===
                    0 ? (

                      <div className="p-12 text-center text-slate-500">
                        No orders found for this filter.
                      </div>

                    ) : (

                      visibleHistory.map(
                        (bill) => (

                          <div
                            key={bill.id}
                            className={`p-4 hover:bg-slate-800/40 ${bill.status.toLowerCase() === "cancelled" ? "opacity-70" : ""}`}
                          >

                            <div className="flex flex-wrap justify-between gap-3">

                              <div>

                                <span className="text-red-400 font-black font-mono">
                                  #{bill.id}
                                </span>

                                <span className="ml-3 text-sm font-bold">
                                  {bill.orderType}
                                </span>
                                <span
  className={`ml-3 text-[10px] font-black px-2 py-1 rounded ${
    bill.paymentType === "Online"
      ? "bg-blue-950 text-blue-300"
      : "bg-green-950 text-green-300"
  }`}
>
  {bill.paymentType === "Online" ? "📱 ONLINE" : "💵 CASH"}
</span>
                                <span className={`ml-3 text-[10px] font-black px-2 py-1 rounded ${bill.status.toLowerCase() === "cancelled" ? "bg-red-950 text-red-300" : "bg-emerald-950 text-emerald-300"}`}>
                                  {bill.status.toUpperCase()}
                                </span>

                              </div>

                              <div className="text-xs text-slate-500">
                                {bill.timestamp}
                              </div>

                            </div>

                            <div className="mt-3 space-y-1">

                              {bill.items.map(
                                (item) => (

                                  <div
                                    key={item.id}
                                    className="flex justify-between text-xs text-slate-300"
                                  >

                                    <span>
                                      {item.name} ×{" "}
                                      {item.quantity}
                                    </span>

                                    <span>
                                      ₹
                                      {item.price *
                                        item.quantity}
                                    </span>

                                  </div>

                                )
                              )}

                            </div>

                            <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-800">

                              <span className="text-xs text-slate-500">
                                Order #{bill.orderNumber}
                              </span>

                              <div className="flex items-center gap-3">
                                <span className={`text-lg font-black ${bill.status.toLowerCase() === "cancelled" ? "text-slate-500 line-through" : "text-red-400"}`}>
                                  ₹{bill.total}
                                </span>
                                {bill.status.toLowerCase() === "completed" && (
                                  <button
                                    onClick={() => cancelOrder(bill)}
                                    disabled={cancellingOrderId !== null}
                                    className="text-[10px] px-3 py-2 rounded-lg bg-red-950 text-red-300 hover:bg-red-900 disabled:opacity-50 disabled:cursor-not-allowed font-black"
                                  >
                                    {cancellingOrderId === bill.dbId ? "Cancelling..." : "Cancel Order"}
                                  </button>
                                )}
                              </div>

                            </div>

                          </div>

                        )
                      )

                    )}

                  </div>

                </div>

              </div>

              {/* SCORE CARDS */}

              <div className="xl:col-span-4">

                <div className="sticky top-24">

                  <h3 className="font-black mb-3">
                    Sales Scorecards
                  </h3>

                  <div className="space-y-3">

                    {ORDER_DESTINATIONS.map(
                      (destination) => {

                        const stats =
                          getDestinationStats(
                            destination
                          );

                        return (

                          <button
                            key={destination}
                            onClick={() =>
                              setHistoryDestination(
                                destination
                              )
                            }
                            className={`w-full text-left bg-slate-900 border rounded-2xl p-4 transition hover:border-red-500 ${
                              historyDestination ===
                              destination
                                ? "border-red-500"
                                : "border-slate-800"
                            }`}
                          >

                            <div className="flex justify-between items-center mb-3">

                              <h4 className="font-black">
                                {destination}
                              </h4>

                              <span className="text-xs bg-red-600/20 text-red-400 px-2 py-1 rounded">
                                {stats.orders} orders
                              </span>

                            </div>

                            <div className="grid grid-cols-2 gap-3">

                              <div>

                                <p className="text-[10px] text-slate-500 uppercase">
                                  Collection
                                </p>

                                <p className="font-black text-lg">
                                  ₹{stats.sales}
                                </p>

                              </div>

                              <div>

                                <p className="text-[10px] text-slate-500 uppercase">
                                  Avg Bill
                                </p>

                                <p className="font-black text-lg">
                                  ₹
                                  {Math.round(
                                    stats.averageBill
                                  )}
                                </p>

                              </div>

                              <div>

                                <p className="text-[10px] text-slate-500 uppercase">
                                  Items Sold
                                </p>

                                <p className="font-black">
                                  {stats.itemsSold}
                                </p>

                              </div>

                              <div>

                                <p className="text-[10px] text-slate-500 uppercase">
                                  Most Ordered
                                </p>

                                <p className="font-bold text-xs truncate">
                                  {stats
                                    .mostOrdered?.[0] ||
                                    "—"}
                                </p>

                              </div>

                            </div>

                            <p className="text-[10px] text-slate-500 mt-3">
                              Click to view orders
                            </p>

                          </button>

                        );

                      }
                    )}

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>

      )}

      {/* ======================================================
          MENU MANAGEMENT
      ====================================================== */}

      {activeTab === "menu" && (

        <section className="p-4 md:p-6">

          <div className="max-w-7xl mx-auto">

            <div className="mb-6">
              <h2 className="text-2xl font-black">Menu Management</h2>
              <p className="text-xs text-slate-400 mt-1">
                Add, edit, change prices, images, categories, or deactivate menu items.
              </p>
            </div>

            {/* CATEGORY MANAGEMENT */}
            <div className="mb-5 bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-lg font-black">Category Management</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Add, edit, change photos/order, or remove categories. Changes appear in Billing automatically.
                  </p>
                </div>
                <button
                  onClick={startNewCategory}
                  className="text-xs bg-red-600 hover:bg-red-500 px-4 py-2.5 rounded-lg font-black"
                >
                  + New Category
                </button>
              </div>

              {categoryAdminError && (
                <p className="mb-4 rounded-xl border border-red-900 bg-red-950/40 px-3 py-2 text-xs text-red-300">
                  {categoryAdminError}
                </p>
              )}

              {categorySuccessMessage && (
                <p className="mb-4 rounded-xl border border-emerald-900 bg-emerald-950/40 px-3 py-2 text-xs text-emerald-300">
                  {categorySuccessMessage}
                </p>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
                {cloudCategories.map((category) => (
                  <div key={category.id} className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.name}
                      onError={(event) => {
                        const fallback = CATEGORY_IMAGES[category.name] || makeImage("🍽️", category.name);
                        if (event.currentTarget.src !== fallback) event.currentTarget.src = fallback;
                      }}
                      className="w-full aspect-[4/3] object-cover"
                    />
                    <div className="p-2.5">
                      <p className="text-xs font-bold truncate" title={category.name}>{category.name}</p>
                      <p className="text-[10px] text-slate-500 mt-1">Order: {category.sortOrder}</p>
                      <div className="flex gap-1 mt-2">
                        <button
                          onClick={() => startEditCategory(category)}
                          className="flex-1 text-[10px] px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 font-bold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deactivateCategory(category)}
                          disabled={categorySaving}
                          className="text-[10px] px-2 py-1.5 rounded-lg bg-red-950 hover:bg-red-900 text-red-300 font-bold disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {cloudCategories.length === 0 && (
                  <div className="col-span-full rounded-xl border border-dashed border-slate-700 p-6 text-center text-xs text-slate-500">
                    No active categories. Click <span className="text-red-400 font-bold">+ New Category</span> to create one.
                  </div>
                )}
              </div>

              <div className="mt-5 border-t border-slate-800 pt-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-black">{editingCategoryId ? "Edit Category" : "Add Category"}</h4>
                    <p className="text-[11px] text-slate-500 mt-1">Category photos are stored in Supabase Storage.</p>
                  </div>
                  {editingCategoryId && (
                    <button onClick={resetCategoryForm} className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg">
                      Cancel
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2">Category Name</label>
                    <input
                      ref={categoryNameInputRef}
                      value={categoryForm.name}
                      onChange={(e) => {
                        setCategoryForm((previous) => ({ ...previous, name: e.target.value }));
                        setCategoryAdminError("");
                        setCategorySuccessMessage("");
                      }}
                      placeholder="e.g. Desserts"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-3 text-sm outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2">Display Order</label>
                    <input
                      type="number"
                      min="0"
                      value={categoryForm.sortOrder}
                      onChange={(e) => {
                        setCategoryForm((previous) => ({ ...previous, sortOrder: e.target.value }));
                        setCategoryAdminError("");
                        setCategorySuccessMessage("");
                      }}
                      placeholder={String(cloudCategories.length + 1)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-3 text-sm outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2">Category Image</label>
                    <input
                      ref={categoryImageInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif,image/*"
                      onChange={(e) => handleCategoryImageChange(e.target.files?.[0] || null)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-3 text-sm outline-none focus:border-red-500 file:mr-3 file:rounded-lg file:border-0 file:bg-red-600 file:px-3 file:py-2 file:text-xs file:font-bold file:text-white"
                    />
                    {selectedCategoryImageFile && (
                      <p className="text-[11px] text-emerald-400 mt-2 truncate">
                        Selected: {selectedCategoryImageFile.name}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  disabled={categorySaving || categoryUploadingImage}
                  onClick={saveCategory}
                  className="w-full md:w-auto mt-4 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:bg-slate-700 disabled:text-slate-500 font-black text-sm"
                >
                  {categoryUploadingImage
                    ? "UPLOADING IMAGE..."
                    : categorySaving
                      ? "SAVING..."
                      : editingCategoryId
                        ? "SAVE CATEGORY CHANGES"
                        : "ADD CATEGORY"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">

              <div className="xl:col-span-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sticky top-24">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-black">
                      {editingMenuId ? "Edit Menu Item" : "Add Menu Item"}
                    </h3>
                    {editingMenuId && (
                      <button
                        onClick={resetMenuForm}
                        className="text-xs bg-slate-800 px-3 py-2 rounded-lg"
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  <label className="block text-xs font-bold text-slate-400 mb-2">
                    Item Name
                  </label>
                  <input
                    ref={menuNameInputRef}
                    value={menuForm.name}
                    onChange={(e) =>
                      setMenuForm((previous) => ({
                        ...previous,
                        name: e.target.value,
                      }))
                    }
                    placeholder="e.g. Cheese Sandwich"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-3 text-sm outline-none focus:border-red-500"
                  />

                  <label className="block text-xs font-bold text-slate-400 mb-2 mt-4">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={menuForm.price}
                    onChange={(e) =>
                      setMenuForm((previous) => ({
                        ...previous,
                        price: e.target.value,
                      }))
                    }
                    placeholder="99"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-3 text-sm outline-none focus:border-red-500"
                  />

                  <label className="block text-xs font-bold text-slate-400 mb-2 mt-4">
                    Category
                  </label>
                  <select
                    value={menuForm.category}
                    onChange={(e) =>
                      setMenuForm((previous) => ({
                        ...previous,
                        category: e.target.value,
                      }))
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-3 text-sm outline-none focus:border-red-500"
                  >
                    {cloudCategories.map((categoryRecord) => (
                      <option key={categoryRecord.id} value={categoryRecord.name}>
                        {categoryRecord.name}
                      </option>
                    ))}
                  </select>

                  <label className="block text-xs font-bold text-slate-400 mb-2 mt-4">
                    Menu Image
                  </label>
                  <input
                    ref={menuImageInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/*"
                    onChange={(e) =>
                      handleMenuImageChange(e.target.files?.[0] || null)
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-3 text-sm outline-none focus:border-red-500 file:mr-3 file:rounded-lg file:border-0 file:bg-red-600 file:px-3 file:py-2 file:text-xs file:font-bold file:text-white"
                  />
                  {selectedImageFile && (
                    <div className="mt-3 flex items-center gap-3">
                      <img
                        src={URL.createObjectURL(selectedImageFile)}
                        alt="Selected menu item"
                        className="w-16 h-16 rounded-xl object-cover border border-slate-700"
                      />
                      <p className="text-[11px] text-emerald-400">
                        Selected: {selectedImageFile.name}
                      </p>
                    </div>
                  )}
                  {!selectedImageFile && menuForm.image && !menuForm.image.startsWith("data:image") && (
                    <div className="mt-3">
                      <img
                        src={menuForm.image}
                        alt="Current menu item"
                        onError={(event) => {
                          event.currentTarget.src = getMenuItemPhoto(menuForm.name, menuForm.category);
                        }}
                        className="w-20 h-20 rounded-xl object-cover border border-slate-700"
                      />
                    </div>
                  )}
                  {!selectedImageFile && menuForm.image && !menuForm.image.startsWith("data:image") && (
                    <p className="text-[11px] text-slate-500 mt-2 break-all">
                      Current image is saved. Choose a new file only if you want to replace it.
                    </p>
                  )}
                  <p className="text-[11px] text-slate-500 mt-2">
                    JPG, PNG, WEBP or other image files up to 5 MB. The image will be uploaded to Supabase Storage.
                  </p>

                  {menuAdminError && (
                    <p className="text-xs text-red-400 mt-4">
                      {menuAdminError}
                    </p>
                  )}

                  {menuSuccessMessage && (
                    <p className="text-xs text-emerald-400 mt-4">
                      {menuSuccessMessage}
                    </p>
                  )}

                  <button
                    disabled={menuSaving || menuUploadingImage}
                    onClick={saveMenuItem}
                    className="w-full mt-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:bg-slate-700 disabled:text-slate-500 font-black"
                  >
                    {menuUploadingImage
                      ? "UPLOADING IMAGE..."
                      : menuSaving
                        ? "SAVING..."
                        : editingMenuId
                          ? "SAVE CHANGES"
                          : "ADD MENU ITEM"}
                  </button>

                </div>
              </div>

              <div className="xl:col-span-8">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                  <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                    <div>
                      <h3 className="font-black">Current Menu</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        {cloudMenu.length} active item(s)
                      </p>
                    </div>
                    <button
                      onClick={startNewMenuItem}
                      className="text-xs bg-red-600 hover:bg-red-500 px-3 py-2 rounded-lg font-bold"
                    >
                      + New Item
                    </button>
                  </div>

                  <div className="divide-y divide-slate-800">
                    {cloudMenu.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 flex flex-wrap items-center gap-4"
                      >
                        <img
                          src={getSafeMenuImage(item)}
                          alt={item.name}
                          onError={(event) => {
                            const fallback = item.category && CATEGORY_IMAGES[item.category]
                              ? CATEGORY_IMAGES[item.category]
                              : makeImage("🍽️", item.name);
                            if (event.currentTarget.src !== fallback) {
                              event.currentTarget.src = fallback;
                            }
                          }}
                          className="w-16 h-16 rounded-xl object-cover bg-slate-950"
                        />

                        <div className="flex-1 min-w-[180px]">
                          <p className="font-black">{item.name}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {item.category}
                          </p>
                        </div>

                        <p className="font-black text-red-400">
                          ₹{item.price}
                        </p>

                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditMenuItem(item)}
                            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deactivateMenuItem(item)}
                            disabled={menuSaving}
                            className="px-3 py-2 rounded-lg bg-red-950 text-red-300 hover:bg-red-900 text-xs font-bold"
                          >
                            Deactivate
                          </button>
                        </div>
                      </div>
                    ))}

                    {cloudMenu.length === 0 && (
                      <div className="p-10 text-center text-slate-500">
                        No active menu items.
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* ======================================================
          ANALYTICS
      ====================================================== */}

      {activeTab === "analytics" && (

        <section className="p-4 md:p-6">

          <div className="max-w-7xl mx-auto">

            <div className="mb-6">

              <h2 className="text-2xl font-black">
                Sales Analytics
              </h2>

              <p className="text-xs text-slate-400 mt-1">
                Sales and item movement from completed orders
              </p>

            </div>

            {/* SUMMARY */}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">

                <p className="text-xs text-slate-500 uppercase font-bold">
                  Total Sales
                </p>

                <p className="text-3xl font-black mt-2 text-red-400">
                  ₹{analytics.totalSales}
                </p>

              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">

                <p className="text-xs text-slate-500 uppercase font-bold">
                  Total Orders
                </p>

                <p className="text-3xl font-black mt-2">
                  {analytics.totalOrders}
                </p>

              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">

                <p className="text-xs text-slate-500 uppercase font-bold">
                  Items Sold
                </p>

                <p className="text-3xl font-black mt-2">
                  {analytics.itemsSold}
                </p>

              </div>

              <div className="bg-slate-900 border border-red-950 rounded-2xl p-5">

                <p className="text-xs text-slate-500 uppercase font-bold">
                  Cancelled Orders
                </p>

                <p className="text-3xl font-black mt-2 text-red-400">
                  {analytics.cancelledOrders}
                </p>

              </div>

              <div className="bg-slate-900 border border-red-950 rounded-2xl p-5">

                <p className="text-xs text-slate-500 uppercase font-bold">
                  Cancelled Value
                </p>

                <p className="text-3xl font-black mt-2 text-red-400">
                  ₹{analytics.cancelledValue}
                </p>

              </div>

            </div>
            {/* SALES REPORT */}

<div className="mt-6 bg-slate-900 border border-slate-800 rounded-2xl p-5">

  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">

    <div>
      <h3 className="text-xl font-black text-white">
        📄 Sales Report
      </h3>

      <p className="text-xs text-slate-500 mt-1">
        Report for the selected Analytics period
      </p>
    </div>

  </div>

  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
      <p className="text-xs text-slate-500 uppercase font-bold">
        Total Sales
      </p>

      <p className="text-2xl font-black text-green-400 mt-2">
        ₹{reportData.totalSales}
      </p>
    </div>

    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
      <p className="text-xs text-slate-500 uppercase font-bold">
        Orders
      </p>

      <p className="text-2xl font-black mt-2">
        {reportData.totalOrders}
      </p>
    </div>

    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
      <p className="text-xs text-slate-500 uppercase font-bold">
        Cash
      </p>

      <p className="text-2xl font-black text-green-400 mt-2">
        ₹{reportData.cashSales}
      </p>
    </div>

    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
      <p className="text-xs text-slate-500 uppercase font-bold">
        Online
      </p>

      <p className="text-2xl font-black text-blue-400 mt-2">
        ₹{reportData.onlineSales}
      </p>
    </div>

  </div>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">

    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
      <p className="text-xs text-slate-500 uppercase font-bold">
        Items Sold
      </p>

      <p className="text-2xl font-black mt-2">
        {reportData.itemsSold}
      </p>
    </div>

    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
      <p className="text-xs text-slate-500 uppercase font-bold">
        Cancelled Orders
      </p>

      <p className="text-2xl font-black text-red-400 mt-2">
        {reportData.cancelledBills.length}
      </p>
    </div>

    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
      <p className="text-xs text-slate-500 uppercase font-bold">
        Cancelled Value
      </p>

      <p className="text-2xl font-black text-red-400 mt-2">
        ₹{reportData.cancelledValue}
      </p>
    </div>

  </div>

</div>

            {/* ANALYTICS PERIOD FILTER */}

<div className="mb-6">
  <div className="flex items-center justify-between mb-3">
    <div>
      <h3 className="text-lg font-black text-white">
        📅 Sales Period
      </h3>
      <p className="text-xs text-slate-500 mt-1">
        Select the period for Analytics
      </p>
    </div>
  </div>

  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
  {(
    ["Today", "Yesterday", "This Week", "This Month"] as const
  ).map((period) => (
    <button
      key={period}
      type="button"
      onClick={() => setAnalyticsPeriod(period)}
      className={`py-3 px-4 rounded-xl font-black text-sm transition ${
        analyticsPeriod === period
          ? "bg-red-600 text-white"
          : "bg-slate-900 text-slate-400 border border-slate-800"
      }`}
    >
      {period}
    </button>
  ))}

  <button
    type="button"
    onClick={() => setAnalyticsPeriod("Custom")}
    className={`py-3 px-4 rounded-xl font-black text-sm transition ${
      analyticsPeriod === "Custom"
        ? "bg-red-600 text-white"
        : "bg-slate-900 text-slate-400 border border-slate-800"
    }`}
  >
    Custom Date
  </button>
</div>
{analyticsPeriod === "Custom" && (
  <div className="mt-4 bg-slate-900 border border-slate-800 rounded-2xl p-4">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">

      <div>
        <label className="text-xs text-slate-400 font-bold block mb-2">
          From Date
        </label>

        <input
          type="date"
          value={customStartDate}
          onChange={(e) => setCustomStartDate(e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-3 text-sm text-white"
        />
      </div>

      <div>
        <label className="text-xs text-slate-400 font-bold block mb-2">
          To Date
        </label>

        <input
          type="date"
          value={customEndDate}
          onChange={(e) => setCustomEndDate(e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-3 text-sm text-white"
        />
      </div>

      <button
        type="button"
        onClick={() => {
          if (customStartDate && customEndDate) {
            setAnalyticsPeriod("Custom");
          }
        }}
        className="py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-sm"
      >
        Apply Date Range
      </button>

    </div>
  </div>
)}
</div>
{/* DAILY SUMMARY */}

<div className="mb-6">
  <div className="flex items-center justify-between mb-4">
    <div>
      <h3 className="text-xl font-black text-white">
  📅 {analyticsPeriod === "Today"
    ? "Today's Summary"
    : analyticsPeriod === "Yesterday"
    ? "Yesterday's Summary"
    : analyticsPeriod === "This Week"
    ? "This Week's Summary"
    : "This Month's Summary"}
</h3>
      <p className="text-xs text-slate-500 mt-1">
        Completed orders for today
      </p>
    </div>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <p className="text-xs text-slate-500 uppercase font-bold">
        💰 {analyticsPeriod === "Today"
  ? "Today's Sales"
  : analyticsPeriod === "Yesterday"
  ? "Yesterday's Sales"
  : analyticsPeriod === "This Week"
  ? "This Week's Sales"
  : "This Month's Sales"}
      </p>
      <p className="text-3xl font-black mt-2 text-green-400">
        ₹{analytics.periodSales}
      </p>
    </div>

    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <p className="text-xs text-slate-500 uppercase font-bold">
        🧾 {analyticsPeriod === "Today"
  ? "Today's Orders"
  : analyticsPeriod === "Yesterday"
  ? "Yesterday's Orders"
  : analyticsPeriod === "This Week"
  ? "This Week's Orders"
  : "This Month's Orders"}
      </p>
      <p className="text-3xl font-black mt-2">
        {analytics.periodOrders}
      </p>
    </div>

    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <p className="text-xs text-slate-500 uppercase font-bold">
        💵 {analyticsPeriod === "Today"
  ? "Today's Cash"
  : analyticsPeriod === "Yesterday"
  ? "Yesterday's Cash"
  : analyticsPeriod === "This Week"
  ? "This Week's Cash"
  : "This Month's Cash"}
      </p>
      <p className="text-3xl font-black mt-2 text-green-400">
        ₹{analytics.periodCashSales}
      </p>
    </div>

    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <p className="text-xs text-slate-500 uppercase font-bold">
        📱 {analyticsPeriod === "Today"
  ? "Today's Online"
  : analyticsPeriod === "Yesterday"
  ? "Yesterday's Online"
  : analyticsPeriod === "This Week"
  ? "This Week's Online"
  : "This Month's Online"}
      </p>
      <p className="text-3xl font-black mt-2 text-blue-400">
        ₹{analytics.periodOnlineSales}
      </p>
    </div>

  </div>
</div>
{/* PAYMENT SUMMARY */}

<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">

  <div className="bg-slate-900 border border-green-950 rounded-2xl p-5">
    <p className="text-xs text-slate-500 uppercase font-bold">
      💵 Cash Collection
    </p>

    <p className="text-3xl font-black mt-2 text-green-400">
      ₹{analytics.cashSales}
    </p>

    <p className="text-xs text-slate-500 mt-2">
      {analytics.cashOrders} cash order(s)
    </p>
  </div>

  <div className="bg-slate-900 border border-blue-950 rounded-2xl p-5">
    <p className="text-xs text-slate-500 uppercase font-bold">
      📱 Online Collection
    </p>

    <p className="text-3xl font-black mt-2 text-blue-400">
      ₹{analytics.onlineSales}
    </p>

    <p className="text-xs text-slate-500 mt-2">
      {analytics.onlineOrders} online order(s)
    </p>
  </div>

  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
    <p className="text-xs text-slate-500 uppercase font-bold">
      💵 Cash Orders
    </p>

    <p className="text-3xl font-black mt-2">
      {analytics.cashOrders}
    </p>
  </div>

  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
    <p className="text-xs text-slate-500 uppercase font-bold">
      📱 Online Orders
    </p>

    <p className="text-3xl font-black mt-2">
      {analytics.onlineOrders}
    </p>
  </div>

</div>
{/* DESTINATION TABLE */}

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden mb-6">

              <div className="p-5 border-b border-slate-800">

                <h3 className="font-black">
                  Table / Takeaway Sales
                </h3>

              </div>

              <div className="overflow-x-auto">

                <table className="w-full text-sm">

                  <thead className="bg-slate-950">

                    <tr>

                      <th className="text-left p-4">
                        Destination
                      </th>

                      <th className="text-right p-4">
                        Orders
                      </th>

                      <th className="text-right p-4">
                        Items Sold
                      </th>

                      <th className="text-right p-4">
                        Collection
                      </th>

                      <th className="text-right p-4">
                        Avg Bill
                      </th>

                      <th className="text-left p-4">
                        Most Ordered
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {ORDER_DESTINATIONS.map(
                      (destination) => {

                        const stats =
                          getDestinationStats(
                            destination
                          );

                        return (

                          <tr
                            key={destination}
                            className="border-t border-slate-800"
                          >

                            <td className="p-4 font-bold">
                              {destination}
                            </td>

                            <td className="p-4 text-right">
                              {stats.orders}
                            </td>

                            <td className="p-4 text-right">
                              {stats.itemsSold}
                            </td>

                            <td className="p-4 text-right font-black text-red-400">
                              ₹{stats.sales}
                            </td>

                            <td className="p-4 text-right">
                              ₹
                              {Math.round(
                                stats.averageBill
                              )}
                            </td>

                            <td className="p-4">
                              {stats
                                .mostOrdered?.[0] ||
                                "—"}
                            </td>

                          </tr>

                        );

                      }
                    )}

                  </tbody>

                </table>

              </div>

            </div>

            {/* CANCELLED ORDERS */}

            <div className="bg-slate-900 border border-red-950 rounded-2xl overflow-hidden mb-6">

              <div className="p-5 border-b border-red-950 flex items-center justify-between">

                <div>
                  <h3 className="font-black">Cancelled Orders</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Cancelled bills are kept for record purposes and are not included in sales totals.
                  </p>
                </div>

                <span className="text-xs bg-red-950 text-red-300 px-3 py-2 rounded-lg font-black">
                  {analytics.cancelledOrders} order(s)
                </span>

              </div>

              <div className="overflow-x-auto">
                {billHistory.filter((bill) => bill.status.toLowerCase() === "cancelled").length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm">
                    No cancelled orders.
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-slate-950">
                      <tr>
                        <th className="text-left p-4">Order</th>
                        <th className="text-left p-4">Destination</th>
                        <th className="text-left p-4">Date / Time</th>
                        <th className="text-right p-4">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billHistory
                        .filter((bill) => bill.status.toLowerCase() === "cancelled")
                        .map((bill) => (
                          <tr key={bill.id} className="border-t border-slate-800">
                            <td className="p-4 font-black text-red-300">{bill.id}</td>
                            <td className="p-4">{bill.orderType}</td>
                            <td className="p-4 text-slate-500">{bill.timestamp}</td>
                            <td className="p-4 text-right font-black text-slate-400 line-through">₹{bill.total}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                )}
              </div>

            </div>

            {/* ALL ORDERS */}

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden mb-6">

              <div className="p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-black">All Orders</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Every completed and cancelled order. Cancel a completed order directly from here.
                  </p>
                </div>
                <span className="text-xs bg-slate-950 text-slate-300 px-3 py-2 rounded-lg font-black">
                  {billHistory.length} order(s)
                </span>
              </div>

              <div className="divide-y divide-slate-800">
                {[...billHistory]
                  .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
                  .map((bill) => {
                    const isCancelled = bill.status.toLowerCase() === "cancelled";
                    const isCancelling = cancellingOrderId === bill.dbId;

                    return (
                      <div
                        key={bill.id}
                        className={`p-4 hover:bg-slate-800/40 ${isCancelled ? "opacity-70" : ""}`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-red-400 font-black font-mono">
                                #{bill.id}
                              </span>
                              <span className="text-sm font-bold">
                                {bill.orderType}
                              </span>
                              <span className={`text-[10px] font-black px-2 py-1 rounded ${
                                isCancelled
                                  ? "bg-red-950 text-red-300"
                                  : "bg-emerald-950 text-emerald-300"
                              }`}>
                                {bill.status.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                              {bill.timestamp}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className={`text-lg font-black ${
                              isCancelled
                                ? "text-slate-500 line-through"
                                : "text-red-400"
                            }`}>
                              ₹{bill.total}
                            </span>

                            {!isCancelled && (
                              <button
                                onClick={() => cancelOrder(bill)}
                                disabled={cancellingOrderId !== null}
                                className="text-[10px] px-3 py-2 rounded-lg bg-red-950 text-red-300 hover:bg-red-900 disabled:opacity-50 disabled:cursor-not-allowed font-black"
                              >
                                {isCancelling ? "Cancelling..." : "Cancel Order"}
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 space-y-1">
                          {bill.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-xs text-slate-300">
                              <span>{item.name} × {item.quantity}</span>
                              <span>₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                {billHistory.length === 0 && (
                  <div className="p-10 text-center text-slate-500 text-sm">
                    No orders yet.
                  </div>
                )}
              </div>

            </div>

            {/* ITEM ANALYSIS */}

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

              <div className="p-5 border-b border-slate-800">

                <h3 className="font-black">
                  Most Ordered Items
                </h3>

              </div>

              <div className="overflow-x-auto">

                <table className="w-full text-sm">

                  <thead className="bg-slate-950">

                    <tr>

                      <th className="text-left p-4">
                        #
                      </th>

                      <th className="text-left p-4">
                        Item
                      </th>

                      <th className="text-right p-4">
                        Quantity Sold
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {analytics.topItems.map(
                      ([name, quantity], index) => (

                        <tr
                          key={name}
                          className="border-t border-slate-800"
                        >

                          <td className="p-4 text-slate-500">
                            {index + 1}
                          </td>

                          <td className="p-4 font-bold">
                            {name}
                          </td>

                          <td className="p-4 text-right font-black text-emerald-400">
                            {quantity}
                          </td>

                        </tr>

                      )
                    )}

                    {analytics.topItems.length ===
                      0 && (

                      <tr>

                        <td
                          colSpan={3}
                          className="p-10 text-center text-slate-500"
                        >
                          No sales data yet.
                        </td>

                      </tr>

                    )}

                  </tbody>

                </table>

              </div>

            </div>

          </div>

        </section>

      )}

    </main>
  );
}