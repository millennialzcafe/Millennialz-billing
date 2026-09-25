"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function SupabaseTest() {
  const [message, setMessage] = useState("Loading menu...");
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    async function loadMenu() {
      const { data, error } = await supabase
        .from("Menu_Items")
        .select("id, Name, Price, Image_url, Category_id")
        .order("id");

      if (error) {
        setMessage("ERROR: " + error.message);
        return;
      }

      setItems(data || []);
      setMessage(`Connected! ${data?.length ?? 0} menu items found.`);
    }

    loadMenu();
  }, []);

  return (
    <main style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>Millennialz Menu Test</h1>

      <h2>{message}</h2>

      {items.map((item) => (
        <div
          key={item.id}
          style={{
            padding: 10,
            marginBottom: 5,
            borderBottom: "1px solid #ddd",
          }}
        >
          {item.id}. {item.Name} — ₹{item.Price}
        </div>
      ))}
    </main>
  );
}