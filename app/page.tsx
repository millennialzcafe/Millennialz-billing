<<<<<<< HEAD
"use client";

import React, { useState, useEffect, useMemo } from "react";

// --- Types ---
interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface BillRecord {
  id: string;
  orderNumber: number;
  orderType: string; // 'Table 1' | 'Table 2' | 'Table 3' | 'Takeaway'
  items: OrderItem[];
  total: number;
  timestamp: string;
}

// Menu Items organized strictly by the Menu Card categories
const MENU_DATA: MenuItem[] = [
  // 1. Beverages
  { id: "b1", name: "Tea", price: 21, category: "Beverages" },
  { id: "b2", name: "Hot Coffee", price: 21, category: "Beverages" },
  { id: "b3", name: "Cold Coffee", price: 39, category: "Beverages" },
  { id: "b4", name: "Cold Coffee with Ice Cream", price: 49, category: "Beverages" },
  { id: "b5", name: "Mango Ice Tea", price: 39, category: "Beverages" },
  { id: "b6", name: "Strawberry Ice Tea", price: 39, category: "Beverages" },
  { id: "b7", name: "Water Bottle", price: 20, category: "Beverages" },
  { id: "b8", name: "Soft Drink", price: 20, category: "Beverages" },
  { id: "b9", name: "Mojito", price: 39, category: "Beverages" },

  // 2. Pasta
  { id: "p1", name: "Pink Sauce Pasta", price: 129, category: "Pasta" },
  { id: "p2", name: "White Sauce Pasta", price: 129, category: "Pasta" },
  { id: "p3", name: "Red Sauce Pasta", price: 129, category: "Pasta" },

  // 3. Sides
  { id: "s1", name: "French Fries", price: 59, category: "Sides" },
  { id: "s2", name: "Peri Peri Fries", price: 69, category: "Sides" },
  { id: "s3", name: "Masala Omelette", price: 49, category: "Sides" },

  // 4. Snacks / Toasts
  { id: "st1", name: "Chilli Cheese Toast (2 Pc)", price: 49, category: "Snacks / Toasts" },
  { id: "st2", name: "Garlic Bread (2 Pc)", price: 39, category: "Snacks / Toasts" },
  { id: "st3", name: "Garlic Bread & Cheese", price: 59, category: "Snacks / Toasts" },
  { id: "st4", name: "Masala Toast Sandwich", price: 59, category: "Snacks / Toasts" },
  { id: "st5", name: "Lays Cheesy Nachos", price: 89, category: "Snacks / Toasts" },
  { id: "st6", name: "Classic Toast Sandwich", price: 49, category: "Snacks / Toasts" },

  // 5. Burgers & Combos
  { id: "bg1", name: "Classic Veg Burger", price: 49, category: "Burgers & Combos" },
  { id: "bg2", name: "Cheesy Veg Burger", price: 59, category: "Burgers & Combos" },
  { id: "bg3", name: "Loaded Veg Burger", price: 69, category: "Burgers & Combos" },
  { id: "bg4", name: "Millennialz Special Veg Burger", price: 99, category: "Burgers & Combos" },
  { id: "bg5", name: "Millennialz Special Non Veg Burger", price: 119, category: "Burgers & Combos" },
  { id: "bg6", name: "Veg Combo (Burger + Fries + Mojito)", price: 99, category: "Burgers & Combos" },
  { id: "bg7", name: "Non Veg Combo (Burger + Fries + Mojito)", price: 119, category: "Burgers & Combos" },
  { id: "bg8", name: "Veg Burger Combo (Burger + Fries + Cold Coffee)", price: 119, category: "Burgers & Combos" },
  { id: "bg9", name: "Non Veg Burger Combo (Burger + Fries + Cold Coffee)", price: 129, category: "Burgers & Combos" },

  // 6. Pizza
  { id: "pz1", name: "Classic Pizza", price: 69, category: "Pizza" },
  { id: "pz2", name: "Fresh Farm Pizza", price: 89, category: "Pizza" },
  { id: "pz3", name: "Loaded Pizza", price: 99, category: "Pizza" },

  // 7. Chicken Delights
  { id: "cd1", name: "Chicken Nuggets", price: 89, category: "Chicken Delights" },
  { id: "cd2", name: "Chicken Popcorn", price: 89, category: "Chicken Delights" },
];

const CATEGORIES = [
  "All Categories",
  "Beverages",
  "Pasta",
  "Sides",
  "Snacks / Toasts",
  "Burgers & Combos",
  "Pizza",
  "Chicken Delights",
];

const ORDER_DESTINATIONS = ["Table 1", "Table 2", "Table 3", "Takeaway"];

export default function MillennialzBillingApp() {
  const [activeTab, setActiveTab] = useState<"billing" | "history" | "ai_insights">("billing");
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [activeDestination, setActiveDestination] = useState<string>("Table 1");

  const [activeOrders, setActiveOrders] = useState<{ [key: string]: OrderItem[] }>({
    "Table 1": [],
    "Table 2": [],
    "Table 3": [],
    Takeaway: [],
  });

  const [billHistory, setBillHistory] = useState<BillRecord[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("millennialz_orders_records");
    if (saved) {
      try {
        setBillHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Storage parse error", e);
      }
    }
  }, []);

  const saveHistory = (updated: BillRecord[]) => {
    setBillHistory(updated);
    localStorage.setItem("millennialz_orders_records", JSON.stringify(updated));
  };

  const currentOrder = activeOrders[activeDestination] || [];

  const addToOrder = (item: MenuItem) => {
    setActiveOrders((prev) => {
      const currentList = prev[activeDestination] || [];
      const exists = currentList.find((i) => i.id === item.id);
      let updated: OrderItem[];

      if (exists) {
        updated = currentList.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        updated = [...currentList, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
      }

      return { ...prev, [activeDestination]: updated };
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setActiveOrders((prev) => {
      const currentList = prev[activeDestination] || [];
      const updated = currentList
        .map((i) => {
          if (i.id === itemId) {
            const nextQty = i.quantity + delta;
            return nextQty > 0 ? { ...i, quantity: nextQty } : null;
          }
          return i;
        })
        .filter(Boolean) as OrderItem[];

      return { ...prev, [activeDestination]: updated };
    });
  };

  const totalAmount = currentOrder.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (currentOrder.length === 0) return;

    const nextOrderNum = billHistory.length + 1;
    const newBill: BillRecord = {
      id: `MZ-${String(nextOrderNum).padStart(4, "0")}`,
      orderNumber: nextOrderNum,
      orderType: activeDestination,
      items: [...currentOrder],
      total: totalAmount,
      timestamp: new Date().toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    };

    saveHistory([newBill, ...billHistory]);

    setActiveOrders((prev) => ({
      ...prev,
      [activeDestination]: [],
    }));

    alert(`Order ${newBill.id} settled for ${activeDestination}! Total: ₹${newBill.total}`);
  };

  // Grouped Menu view by Category
  const categorizedSections = useMemo(() => {
    const list = selectedCategory === "All Categories"
      ? CATEGORIES.filter((c) => c !== "All Categories")
      : [selectedCategory];

    return list.map((cat) => ({
      categoryName: cat,
      items: MENU_DATA.filter((item) => item.category === cat),
    }));
  }, [selectedCategory]);

  // AI Demand Intelligence
  const aiAnalytics = useMemo(() => {
    const itemVolumeMap: { [name: string]: number } = {};
    let totalGross = 0;
    const destinationRevenue: { [key: string]: number } = {
      "Table 1": 0,
      "Table 2": 0,
      "Table 3": 0,
      Takeaway: 0,
    };

    billHistory.forEach((bill) => {
      totalGross += bill.total;
      destinationRevenue[bill.orderType] = (destinationRevenue[bill.orderType] || 0) + bill.total;

      bill.items.forEach((it) => {
        itemVolumeMap[it.name] = (itemVolumeMap[it.name] || 0) + it.quantity;
      });
    });

    const sortedItems = Object.entries(itemVolumeMap).sort((a, b) => b[1] - a[1]);
    const topSellers = sortedItems.slice(0, 3);
    const lowSellers = sortedItems.length > 3 ? sortedItems.slice(-3).reverse() : [];

    const insights: string[] = [];
    if (sortedItems.length === 0) {
      insights.push("Start punching orders to let AI track item movement and suggest menu strategies.");
    } else {
      if (topSellers.length > 0) {
        insights.push(
          `Highest Movement: "${topSellers[0][0]}" is the top-selling item (${topSellers[0][1]} portions sold). Keep essential ingredients in stock.`
        );
      }
      if (lowSellers.length > 0) {
        insights.push(
          `Low Movement: "${lowSellers[0][0]}" has lowest demand (${lowSellers[0][1]} portions sold). Consider pairing it into a value combo.`
        );
      }
      const takeawayRev = destinationRevenue["Takeaway"] || 0;
      const tablesRev =
        (destinationRevenue["Table 1"] || 0) +
        (destinationRevenue["Table 2"] || 0) +
        (destinationRevenue["Table 3"] || 0);

      if (takeawayRev > tablesRev) {
        insights.push("Takeaway orders exceed dine-in tables. Ensure packaging supplies are adequately stocked.");
      } else {
        insights.push("Dine-in turnover is active. Keep table clearance cycles fast to maximize seating.");
      }
    }

    return {
      totalGross,
      totalOrders: billHistory.length,
      topSellers,
      lowSellers,
      destinationRevenue,
      insights,
    };
  }, [billHistory]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-amber-600 flex items-center justify-center font-black text-white text-xl shadow-lg">
            M
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-wider text-red-500 uppercase">
              Millennialz
            </h1>
            <p className="text-xs text-slate-400">Smart Billing & Category POS</p>
          </div>
        </div>

        <nav className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("billing")}
            className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition ${
              activeTab === "billing"
                ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Billing POS
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition ${
              activeTab === "history"
                ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            History ({billHistory.length})
          </button>
          <button
            onClick={() => setActiveTab("ai_insights")}
            className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition flex items-center gap-1.5 ${
              activeTab === "ai_insights"
                ? "bg-gradient-to-r from-purple-600 to-red-600 text-white shadow-md shadow-purple-600/30"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <span>✨</span> AI Analytics
          </button>
        </nav>
      </header>

      {/* POS Billing Screen */}
      {activeTab === "billing" && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Main Content: Tables & Categorized Menu */}
          <div className="lg:col-span-8 p-6 flex flex-col gap-5 overflow-y-auto max-h-[calc(100vh-80px)]">
            {/* Table 1, 2, 3 + Takeaway */}
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-2.5 block">
                Select Order Destination
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {ORDER_DESTINATIONS.map((dest) => {
                  const itemsCount = (activeOrders[dest] || []).reduce(
                    (sum, i) => sum + i.quantity,
                    0
                  );
                  return (
                    <button
                      key={dest}
                      onClick={() => setActiveDestination(dest)}
                      className={`p-3.5 rounded-xl font-semibold text-sm transition relative text-left flex flex-col justify-between border ${
                        activeDestination === dest
                          ? "bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/20"
                          : "bg-slate-800/80 border-slate-700/60 text-slate-200 hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="font-bold">{dest}</span>
                        {itemsCount > 0 && (
                          <span className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
                        )}
                      </div>
                      <span className="text-[11px] opacity-80 mt-2">
                        {itemsCount > 0 ? `${itemsCount} item(s)` : "Empty"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category Navigation Bar */}
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
              <span className="text-[11px] font-bold text-slate-400 uppercase mr-1 hidden sm:inline">
                Categories:
              </span>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition border ${
                    selectedCategory === cat
                      ? "bg-red-600 border-red-500 text-white shadow-md shadow-red-600/20"
                      : "bg-slate-850 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Categorized Menu Sections */}
            <div className="space-y-6">
              {categorizedSections.map((section) => (
                <div key={section.categoryName} className="space-y-3">
                  <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
                    <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider">
                      {section.categoryName}
                    </h3>
                    <span className="text-[11px] font-mono text-slate-500">
                      ({section.items.length} items)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                    {section.items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => addToOrder(item)}
                        className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-red-500/60 hover:bg-slate-850 cursor-pointer transition shadow group"
                      >
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            {item.category}
                          </span>
                          <h4 className="font-semibold text-slate-100 group-hover:text-red-400 transition mt-1 text-xs">
                            {item.name}
                          </h4>
                        </div>
                        <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-800/80">
                          <span className="text-sm font-black text-slate-100">₹{item.price}</span>
                          <button className="bg-slate-800 group-hover:bg-red-600 text-white rounded-lg px-2.5 py-1 text-xs font-semibold transition">
                            + Add
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Bill Sidebar */}
          <div className="lg:col-span-4 bg-slate-900 border-l border-slate-800 p-6 flex flex-col justify-between max-h-[calc(100vh-80px)] overflow-y-auto">
            <div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
                <div>
                  <h3 className="text-lg font-black text-white">Active Order</h3>
                  <p className="text-xs text-red-400 font-bold">{activeDestination}</p>
                </div>
                <span className="text-xs bg-slate-800 border border-slate-700 px-2.5 py-1 rounded text-slate-300 font-mono">
                  {currentOrder.length} Items
                </span>
              </div>

              {currentOrder.length === 0 ? (
                <div className="text-center py-20 text-slate-500 text-sm">
                  No items in {activeDestination}. Click any item from categorized list to add.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                  {currentOrder.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-800"
                    >
                      <div className="flex-1 pr-2">
                        <div className="text-xs font-semibold text-slate-200">{item.name}</div>
                        <div className="text-[11px] text-slate-400">₹{item.price} each</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-xs"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-xs"
                        >
                          +
                        </button>
                        <div className="text-xs font-bold w-12 text-right text-slate-100">
                          ₹{item.price * item.quantity}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Total (Zero Tax) */}
            <div className="border-t border-slate-800 pt-4 mt-4 space-y-3">
              <div className="flex justify-between text-xs text-slate-400 font-medium">
                <span>Tax / GST:</span>
                <span className="text-slate-500 font-mono">₹0.00 (None)</span>
              </div>
              <div className="flex justify-between text-lg font-black text-white">
                <span>Final Total:</span>
                <span className="text-red-400 text-xl font-mono">₹{totalAmount}</span>
              </div>

              <button
                disabled={currentOrder.length === 0}
                onClick={handleCheckout}
                className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg transition ${
                  currentOrder.length > 0
                    ? "bg-red-600 hover:bg-red-500 text-white cursor-pointer shadow-red-600/20"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50"
                }`}
              >
                Checkout & Save Bill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Screen */}
      {activeTab === "history" && (
        <div className="flex-1 p-6 overflow-y-auto max-w-5xl mx-auto w-full">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-black text-white">Billing History</h2>
              <p className="text-xs text-slate-400">Past settled records with order IDs and timestamps</p>
            </div>
            {billHistory.length > 0 && (
              <button
                onClick={() => {
                  if (confirm("Reset order history?")) {
                    saveHistory([]);
                  }
                }}
                className="text-xs text-red-400 hover:underline border border-red-500/30 px-3 py-1.5 rounded-lg"
              >
                Clear History
              </button>
            )}
          </div>

          {billHistory.length === 0 ? (
            <div className="bg-slate-900 rounded-xl p-16 text-center text-slate-400 border border-slate-800">
              No bills recorded yet. Complete an order to view history.
            </div>
          ) : (
            <div className="space-y-3">
              {billHistory.map((bill) => (
                <div
                  key={bill.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition"
                >
                  <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-800 pb-2.5 mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="px-2.5 py-0.5 bg-red-600/20 text-red-400 border border-red-500/30 rounded font-mono text-xs font-bold">
                        #{bill.id}
                      </span>
                      <span className="font-bold text-slate-200 text-sm">{bill.orderType}</span>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">{bill.timestamp}</span>
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="text-xs text-slate-300 space-y-1">
                      {bill.items.map((it) => (
                        <div key={it.id}>
                          • {it.name} × {it.quantity} (₹{it.price * it.quantity})
                        </div>
                      ))}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-red-400 font-mono">₹{bill.total}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AI Demand Analytics Screen */}
      {activeTab === "ai_insights" && (
        <div className="flex-1 p-6 overflow-y-auto max-w-5xl mx-auto w-full space-y-6">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <span>✨</span> Smart Sales & Demand Intelligence
            </h2>
            <p className="text-xs text-slate-400">
              AI analysis of food item movement and sales share across tables & takeaways.
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-900 border border-purple-800/40 rounded-xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-purple-300 uppercase tracking-wider mb-3">
              AI Demand Observations & Advice
            </h3>
            <ul className="space-y-2">
              {aiAnalytics.insights.map((insight, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                  <span className="text-purple-400 font-bold">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-xs font-semibold text-slate-400">Total Revenue</span>
              <p className="text-2xl font-black text-white mt-1">₹{aiAnalytics.totalGross}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-xs font-semibold text-slate-400">Orders Settled</span>
              <p className="text-2xl font-black text-white mt-1">{aiAnalytics.totalOrders}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-xs font-semibold text-slate-400">Takeaway Sales</span>
              <p className="text-2xl font-black text-amber-400 mt-1">
                ₹{aiAnalytics.destinationRevenue["Takeaway"] || 0}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <span>🔥</span> Top Demand Items (Fast Moving)
              </h3>
              {aiAnalytics.topSellers.length === 0 ? (
                <p className="text-xs text-slate-500">No order history available yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {aiAnalytics.topSellers.map(([name, count], index) => (
                    <div
                      key={name}
                      className="flex justify-between items-center bg-slate-950 p-2.5 rounded-lg border border-slate-800/80"
                    >
                      <span className="text-xs text-slate-200 font-medium">
                        #{index + 1} {name}
                      </span>
                      <span className="text-xs font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40">
                        {count} sold
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <span>❄️</span> Slow Moving Items (Needs Attention)
              </h3>
              {aiAnalytics.lowSellers.length === 0 ? (
                <p className="text-xs text-slate-500">Punch more orders to reveal slow-moving items.</p>
              ) : (
                <div className="space-y-2.5">
                  {aiAnalytics.lowSellers.map(([name, count]) => (
                    <div
                      key={name}
                      className="flex justify-between items-center bg-slate-950 p-2.5 rounded-lg border border-slate-800/80"
                    >
                      <span className="text-xs text-slate-300">{name}</span>
                      <span className="text-xs font-bold text-rose-400 px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800/40">
                        {count} sold
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">
              Revenue Breakdown: Tables & Takeaway
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ORDER_DESTINATIONS.map((dest) => (
                <div key={dest} className="bg-slate-950 border border-slate-800 p-3 rounded-lg">
                  <span className="text-xs text-slate-400">{dest}</span>
                  <p className="text-lg font-bold text-slate-100 font-mono mt-1">
                    ₹{aiAnalytics.destinationRevenue[dest] || 0}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
=======
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert h-5 w-[100px]"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            To get started, edit the{" "}
            <code className="rounded bg-black/[.06] px-1.5 py-0.5 font-mono text-[0.9em] dark:bg-white/[.08]">
              page.tsx
            </code>{" "}
            file.
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert h-[14px] w-4"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={14}
            />
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}
>>>>>>> 4f74304f1a65843156fcfe74a0274ee09f162fee
