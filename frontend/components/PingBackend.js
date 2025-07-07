// src/components/PingBackend.js
"use client";

import { useEffect } from "react";

export default function PingBackend() {
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/ping`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) {
          console.log("✅ Backend awake");
        }
      })
      .catch((err) => {
        console.error("❌ Ping to backend failed:", err);
      });
  }, []);

  return null;
}
