import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Fields from "@/pages/Fields";
import Crops from "@/pages/Crops";
import Tasks from "@/pages/Tasks";
import Weather from "@/pages/Weather";
import Header from "@/components/layout/Header";
import BottomNavigation from "@/components/layout/BottomNavigation";
import SyncStatusBar from "@/components/layout/SyncStatusBar";

function Router() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-grow overflow-auto">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/fields" component={Fields} />
          <Route path="/crops" component={Crops} />
          <Route path="/tasks" component={Tasks} />
          <Route path="/weather" component={Weather} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <BottomNavigation />
      <SyncStatusBar />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
