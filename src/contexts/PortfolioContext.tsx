import { createContext, use } from "react";
import type { usePortfolioData } from "../hooks/usePortfolioData";

export type PortfolioContextValue = ReturnType<typeof usePortfolioData>;

export const PortfolioContext = createContext<
  PortfolioContextValue | undefined
>(undefined);

export function usePortfolioContext(): PortfolioContextValue {
  const context = use(PortfolioContext);
  if (!context) {
    throw new Error(
      "usePortfolioContext must be used within a PortfolioProvider",
    );
  }
  return context;
}
