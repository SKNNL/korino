import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CommentCaMarche from "./pages/CommentCaMarche";
import Auth from "./pages/Auth";
import Swipe from "./pages/Swipe";
import Matches from "./pages/Matches";
import AddItem from "./pages/AddItem";
import Profile from "./pages/Profile";
import MyItems from "./pages/MyItems";
import Favorites from "./pages/Favorites";
import Settings from "./pages/Settings";
import InterestMessages from "./pages/InterestMessages";
import PublicDashboard from "./pages/PublicDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/comment-ca-marche" element={<CommentCaMarche />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/swipe" element={<Swipe />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/add-item" element={<AddItem />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/my-items" element={<MyItems />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/interest-messages" element={<InterestMessages />} />
          <Route path="/dashboard/:userId" element={<PublicDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
