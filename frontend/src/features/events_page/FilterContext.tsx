import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";

export interface FilterState {
  keyword: string;
  city: string;
  latitude?: number;
  longitude?: number;
  radius: number;
  selectedCategories: string[];
  dateFrom?: string;
  dateTo?: string;
  priceMin?: number;
  priceMax?: number;
  isFree: boolean;
  isReady: boolean;
}

interface FilterContextType {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  updateKeyword: (keyword: string) => void;
  updateCity: (city: string, lat?: number, lon?: number) => void;
  updateRadius: (radius: number) => void;
  updateCategories: (categories: string[]) => void;
  updatePosition: (lat: number, lon: number) => void;
  updateDateRange: (dateFrom?: string, dateTo?: string) => void;
  updatePrice: (priceMin?: number, priceMax?: number, isFree?: boolean) => void;
  resetFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

const DEFAULT_FILTERS: FilterState = {
  keyword: "",
  city: "",
  latitude: undefined,
  longitude: undefined,
  radius: 5,
  selectedCategories: [],
  dateFrom: undefined,
  dateTo: undefined,
  priceMin: undefined,
  priceMax: undefined,
  isFree: false,
  isReady: false,
};

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const updateKeyword = useCallback((keyword: string) => {
    setFilters((prev) => ({ ...prev, keyword }));
  }, []);

  const updateCity = useCallback((city: string, lat?: number, lon?: number) => {
    setFilters((prev) => ({
      ...prev,
      city,
      latitude: lat ?? prev.latitude,
      longitude: lon ?? prev.longitude,
    }));
  }, []);

  const updateRadius = useCallback((radius: number) => {
    setFilters((prev) => ({ ...prev, radius }));
  }, []);

  const updateCategories = useCallback((categories: string[]) => {
    setFilters((prev) => ({ ...prev, selectedCategories: categories }));
  }, []);

  const updatePosition = useCallback((lat: number, lon: number) => {
    setFilters((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lon,
      isReady: true,
    }));
  }, []);

  const updateDateRange = useCallback((dateFrom?: string, dateTo?: string) => {
    setFilters((prev) => ({ ...prev, dateFrom, dateTo }));
  }, []);

  const updatePrice = useCallback((priceMin?: number, priceMax?: number, isFree?: boolean) => {
    setFilters((prev) => ({ ...prev, priceMin, priceMax, isFree: isFree ?? false }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  return (
    <FilterContext.Provider
      value={{
        filters,
        setFilters,
        updateKeyword,
        updateCity,
        updateRadius,
        updateCategories,
        updatePosition,
        updateDateRange,
        updatePrice,
        resetFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilters must be used within FilterProvider");
  }
  return context;
}
