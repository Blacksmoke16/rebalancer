import { ReactNode } from "react";
import { usePortfolioData } from "../hooks/usePortfolioData";
import { PortfolioContext } from "./PortfolioContext";

interface PortfolioProviderProps {
  children: ReactNode;
}

export function PortfolioProvider({ children }: PortfolioProviderProps) {
  const portfolio = usePortfolioData();
  return <PortfolioContext value={portfolio}>{children}</PortfolioContext>;
}
