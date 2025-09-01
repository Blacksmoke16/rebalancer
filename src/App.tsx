import { ErrorBoundary } from "./components/ErrorBoundary";
import { AppContent } from "./components/AppContent";
import { PortfolioProvider } from "./contexts/PortfolioProvider";

export default function App() {
  return (
    <ErrorBoundary>
      <PortfolioProvider>
        <AppContent />
      </PortfolioProvider>
    </ErrorBoundary>
  );
}
