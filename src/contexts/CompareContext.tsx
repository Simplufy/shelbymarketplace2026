"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface CompareItem {
  id: string;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  price: number;
  mileage: number;
  transmission: string;
  drivetrain: string;
  engine?: string | null;
  exterior_color?: string | null;
  interior_color?: string | null;
  location: string | null;
  primary_image_url: string | null;
  is_featured: boolean;
  dealership_name: string | null;
}

interface CompareContextType {
  comparedItems: CompareItem[];
  addToCompare: (item: CompareItem) => boolean;
  removeFromCompare: (id: string) => void;
  isInCompare: (id: string) => boolean;
  clearCompare: () => void;
  maxItems: number;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [comparedItems, setComparedItems] = useState<CompareItem[]>([]);
  const maxItems = 3;

  const addToCompare = useCallback((item: CompareItem) => {
    if (comparedItems.length >= maxItems) {
      return false;
    }
    if (comparedItems.find((i) => i.id === item.id)) {
      return true;
    }
    setComparedItems((prev) => [...prev, item]);
    return true;
  }, [comparedItems, maxItems]);

  const removeFromCompare = useCallback((id: string) => {
    setComparedItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const isInCompare = useCallback((id: string) => {
    return comparedItems.some((item) => item.id === id);
  }, [comparedItems]);

  const clearCompare = useCallback(() => {
    setComparedItems([]);
  }, []);

  return (
    <CompareContext.Provider
      value={{
        comparedItems,
        addToCompare,
        removeFromCompare,
        isInCompare,
        clearCompare,
        maxItems,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return context;
}
