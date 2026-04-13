"use client";

import { useState, useEffect } from "react";

export function useSearchPlaceholder() {
  const [placeholder, setPlaceholder] = useState("Search by Model, Year, or ZIP...");

  useEffect(() => {
    fetch("/api/search-placeholder")
      .then(res => res.json())
      .then(data => {
        if (data.searchPlaceholder) {
          setPlaceholder(data.searchPlaceholder);
        }
      })
      .catch(() => {});
  }, []);

  return placeholder;
}