import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";


function Router() {
  return (
    <Switch>
      <Route path={"/"} component={() => {
        // Redirect to game.html
        if (typeof window !== 'undefined') {
          window.location.href = '/game.html';
        }
        return null;
      }} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

import { useEffect } from "react";

function App() {
  useEffect(() => {
    document.title = "Super Kart Racing 3D - Free Online Racing Game";
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
