"use client";

import React, { useEffect, useMemo, useState } from "react";

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

interface BillRecord {
  id: string;
  orderNumber: number;
  orderType: string;
  items: OrderItem[];
  total: number;
  timestamp: string;
  createdAt: number;
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
  Beverages: makeImage("☕", "Beverages"),
  Pasta: makeImage("🍝", "Pasta"),
  Sides: makeImage("🍟", "Sides"),
  "Snacks / Toasts": makeImage("🥪", "Snacks & Toasts"),
  "Burgers & Combos": makeImage("🍔", "Burgers & Combos"),
  Pizza: makeImage("🍕", "Pizza"),
  "Chicken Delights": makeImage("🍗", "Chicken Delights"),
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
    image: makeImage("🍵", "Tea"),
  },
  {
    id: "b2",
    name: "Hot Coffee",
    price: 21,
    category: "Beverages",
    image: makeImage("☕", "Hot Coffee"),
  },
  {
    id: "b3",
    name: "Cold Coffee",
    price: 39,
    category: "Beverages",
    image: makeImage("🥤", "Cold Coffee"),
  },
  {
    id: "b4",
    name: "Cold Coffee with Ice Cream",
    price: 49,
    category: "Beverages",
    image: makeImage("🍨", "Cold Coffee + Ice Cream"),
  },
  {
    id: "b5",
    name: "Mango Ice Tea",
    price: 39,
    category: "Beverages",
    image: makeImage("🥭", "Mango Ice Tea"),
  },
  {
    id: "b6",
    name: "Strawberry Ice Tea",
    price: 39,
    category: "Beverages",
    image: makeImage("🍓", "Strawberry Ice Tea"),
  },
  {
    id: "b7",
    name: "Water Bottle",
    price: 20,
    category: "Beverages",
    image: makeImage("💧", "Water Bottle"),
  },
  {
    id: "b8",
    name: "Soft Drink",
    price: 20,
    category: "Beverages",
    image: makeImage("🥤", "Soft Drink"),
  },
  {
    id: "b9",
    name: "Mojito",
    price: 39,
    category: "Beverages",
    image: makeImage("🍹", "Mojito"),
  },

  // ---------------- PASTA ----------------
  {
    id: "p1",
    name: "Pink Sauce Pasta",
    price: 129,
    category: "Pasta",
    image: makeImage("🍝", "Pink Sauce Pasta"),
  },
  {
    id: "p2",
    name: "White Sauce Pasta",
    price: 129,
    category: "Pasta",
    image: makeImage("🍝", "White Sauce Pasta"),
  },
  {
    id: "p3",
    name: "Red Sauce Pasta",
    price: 129,
    category: "Pasta",
    image: makeImage("🍝", "Red Sauce Pasta"),
  },

  // ---------------- SIDES ----------------
  {
    id: "s1",
    name: "French Fries",
    price: 59,
    category: "Sides",
    image: makeImage("🍟", "French Fries"),
  },
  {
    id: "s2",
    name: "Peri Peri Fries",
    price: 69,
    category: "Sides",
    image: makeImage("🍟", "Peri Peri Fries"),
  },
  {
    id: "s3",
    name: "Masala Omelette",
    price: 49,
    category: "Sides",
    image: makeImage("🍳", "Masala Omelette"),
  },

  // ---------------- SNACKS ----------------
  {
    id: "st1",
    name: "Chilli Cheese Toast (2 Pc)",
    price: 49,
    category: "Snacks / Toasts",
    image: makeImage("🥪", "Chilli Cheese Toast"),
  },
  {
    id: "st2",
    name: "Garlic Bread (2 Pc)",
    price: 39,
    category: "Snacks / Toasts",
    image: makeImage("🥖", "Garlic Bread"),
  },
  {
    id: "st3",
    name: "Garlic Bread & Cheese",
    price: 59,
    category: "Snacks / Toasts",
    image: makeImage("🧀", "Garlic Bread & Cheese"),
  },
  {
    id: "st4",
    name: "Masala Toast Sandwich",
    price: 59,
    category: "Snacks / Toasts",
    image: makeImage("🥪", "Masala Toast Sandwich"),
  },
  {
    id: "st5",
    name: "Lays Cheesy Nachos",
    price: 89,
    category: "Snacks / Toasts",
    image: makeImage("🧀", "Cheesy Nachos"),
  },
  {
    id: "st6",
    name: "Classic Toast Sandwich",
    price: 49,
    category: "Snacks / Toasts",
    image: makeImage("🥪", "Classic Toast Sandwich"),
  },

  // ---------------- BURGERS ----------------
  {
    id: "bg1",
    name: "Classic Veg Burger",
    price: 49,
    category: "Burgers & Combos",
    image: makeImage("🍔", "Classic Veg Burger"),
  },
  {
    id: "bg2",
    name: "Cheesy Veg Burger",
    price: 59,
    category: "Burgers & Combos",
    image: makeImage("🍔", "Cheesy Veg Burger"),
  },
  {
    id: "bg3",
    name: "Loaded Veg Burger",
    price: 69,
    category: "Burgers & Combos",
    image: makeImage("🍔", "Loaded Veg Burger"),
  },
  {
    id: "bg4",
    name: "Millennialz Special Veg Burger",
    price: 99,
    category: "Burgers & Combos",
    image: makeImage("🍔", "Special Veg Burger"),
  },
  {
    id: "bg5",
    name: "Millennialz Special Non Veg Burger",
    price: 119,
    category: "Burgers & Combos",
    image: makeImage("🍔", "Special Non Veg Burger"),
  },
  {
    id: "bg6",
    name: "Veg Combo (Burger + Fries + Mojito)",
    price: 99,
    category: "Burgers & Combos",
    image: makeImage("🍔🍟", "Veg Combo"),
  },
  {
    id: "bg7",
    name: "Non Veg Combo (Burger + Fries + Mojito)",
    price: 119,
    category: "Burgers & Combos",
    image: makeImage("🍔🍟", "Non Veg Combo"),
  },
  {
    id: "bg8",
    name: "Veg Burger Combo (Burger + Fries + Cold Coffee)",
    price: 119,
    category: "Burgers & Combos",
    image: makeImage("🍔🥤", "Burger + Fries + Coffee"),
  },
  {
    id: "bg9",
    name: "Non Veg Burger Combo (Burger + Fries + Cold Coffee)",
    price: 129,
    category: "Burgers & Combos",
    image: makeImage("🍔🥤", "Non Veg Burger + Coffee"),
  },

  // ---------------- PIZZA ----------------
  {
    id: "pz1",
    name: "Classic Pizza",
    price: 69,
    category: "Pizza",
    image: makeImage("🍕", "Classic Pizza"),
  },
  {
    id: "pz2",
    name: "Fresh Farm Pizza",
    price: 89,
    category: "Pizza",
    image: makeImage("🍕", "Fresh Farm Pizza"),
  },
  {
    id: "pz3",
    name: "Loaded Pizza",
    price: 99,
    category: "Pizza",
    image: makeImage("🍕", "Loaded Pizza"),
  },

  // ---------------- CHICKEN ----------------
  {
    id: "cd1",
    name: "Chicken Nuggets",
    price: 89,
    category: "Chicken Delights",
    image: makeImage("🍗", "Chicken Nuggets"),
  },
  {
    id: "cd2",
    name: "Chicken Popcorn",
    price: 89,
    category: "Chicken Delights",
    image: makeImage("🍗", "Chicken Popcorn"),
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
    "billing" | "history" | "analytics"
  >("billing");

  const [activeDestination, setActiveDestination] =
    useState("Table 1");

  const [selectedCategory, setSelectedCategory] =
    useState<string | null>(null);

  const [historyDestination, setHistoryDestination] =
    useState<string | null>(null);

  const [activeOrders, setActiveOrders] = useState<
    Record<string, OrderItem[]>
  >({
    "Table 1": [],
    "Table 2": [],
    "Table 3": [],
    Takeaway: [],
  });

  const [billHistory, setBillHistory] = useState<BillRecord[]>([]);

  // ----------------------------------------------------------
  // LOAD HISTORY
  // ----------------------------------------------------------

  useEffect(() => {
    try {
      const saved = localStorage.getItem(
        "millennialz_orders_records"
      );

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setBillHistory(parsed);
        }
      }
    } catch (error) {
      console.error("Unable to load billing history:", error);
    }
  }, []);

  // ----------------------------------------------------------
  // SAVE HISTORY
  // ----------------------------------------------------------

  const saveHistory = (updated: BillRecord[]) => {
    setBillHistory(updated);

    try {
      localStorage.setItem(
        "millennialz_orders_records",
        JSON.stringify(updated)
      );
    } catch (error) {
      console.error("Unable to save billing history:", error);
    }
  };

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

  const handleCheckout = () => {
    if (currentOrder.length === 0) {
      return;
    }

    const nextOrderNumber =
      billHistory.length + 1;

    const newBill: BillRecord = {
      id: `MZ-${String(nextOrderNumber).padStart(
        4,
        "0"
      )}`,

      orderNumber: nextOrderNumber,

      orderType: activeDestination,

      items: currentOrder.map((item) => ({
        ...item,
      })),

      total: totalAmount,

      timestamp: new Date().toLocaleString(
        "en-IN",
        {
          dateStyle: "medium",
          timeStyle: "short",
        }
      ),

      createdAt: Date.now(),
    };

    saveHistory([
      ...billHistory,
      newBill,
    ]);

    // Clear current cart automatically.
    setActiveOrders((previous) => ({
      ...previous,
      [activeDestination]: [],
    }));
  };

  // ----------------------------------------------------------
  // CATEGORY MENU
  // ----------------------------------------------------------

  const selectedItems = useMemo(() => {
    if (!selectedCategory) {
      return [];
    }

    return MENU_DATA.filter(
      (item) =>
        item.category === selectedCategory
    );
  }, [selectedCategory]);

  // ----------------------------------------------------------
  // HISTORY
  // ----------------------------------------------------------

  const visibleHistory = useMemo(() => {
    const sorted = [...billHistory].sort(
      (a, b) =>
        (b.createdAt || 0) -
        (a.createdAt || 0)
    );

    if (!historyDestination) {
      return sorted;
    }

    return sorted.filter(
      (bill) =>
        bill.orderType === historyDestination
    );
  }, [
    billHistory,
    historyDestination,
  ]);

  // ----------------------------------------------------------
  // DESTINATION SCORECARD
  // ----------------------------------------------------------

  const getDestinationStats = (
    destination: string
  ) => {
    const orders = billHistory.filter(
      (bill) =>
        bill.orderType === destination
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

  const analytics = useMemo(() => {
    const itemMap: Record<string, number> =
      {};

    let totalSales = 0;

    billHistory.forEach((bill) => {
      totalSales += bill.total;

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

    return {
      totalSales,
      totalOrders: billHistory.length,
      itemsSold: Object.values(itemMap).reduce(
        (sum, value) => sum + value,
        0
      ),
      topItems: sortedItems.slice(0, 10),
    };
  }, [billHistory]);

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
                Order History
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

            {!selectedCategory && (

              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">

                {CATEGORIES.map(
                  (category) => (

                    <button
                      key={category}
                      onClick={() =>
                        setSelectedCategory(
                          category
                        )
                      }
                      className="group overflow-hidden bg-slate-900 border border-slate-800 hover:border-red-500 rounded-2xl text-left transition"
                    >

                      <div className="aspect-[4/3] overflow-hidden">

                        <img
                          src={
                            CATEGORY_IMAGES[
                              category
                            ]
                          }
                          alt={category}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />

                      </div>

                      <div className="p-3">

                        <h3 className="font-bold text-sm">
                          {category}
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

                <p className="text-[11px] text-slate-500 mt-1">
                  No GST / No additional tax
                </p>

                <button
                  disabled={
                    currentOrder.length === 0
                  }
                  onClick={handleCheckout}
                  className={`w-full mt-5 py-4 rounded-xl font-black tracking-wide ${
                    currentOrder.length > 0
                      ? "bg-red-600 hover:bg-red-500 text-white"
                      : "bg-slate-800 text-slate-600 cursor-not-allowed"
                  }`}
                >
                  COMPLETE BILL
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

            <div className="mb-6">

              <h2 className="text-2xl font-black">
                Order History
              </h2>

              <p className="text-xs text-slate-400 mt-1">
                All completed orders in chronological order
              </p>

            </div>

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

                  </div>

                  <div className="divide-y divide-slate-800">

                    {visibleHistory.length ===
                    0 ? (

                      <div className="p-12 text-center text-slate-500">
                        No completed orders yet.
                      </div>

                    ) : (

                      visibleHistory.map(
                        (bill) => (

                          <div
                            key={bill.id}
                            className="p-4 hover:bg-slate-800/40"
                          >

                            <div className="flex flex-wrap justify-between gap-3">

                              <div>

                                <span className="text-red-400 font-black font-mono">
                                  #{bill.id}
                                </span>

                                <span className="ml-3 text-sm font-bold">
                                  {bill.orderType}
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

                              <span className="text-lg font-black text-red-400">
                                ₹{bill.total}
                              </span>

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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

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