import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ItemGrid from "@/components/ItemGrid";

import { useState } from "react";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <main>
        <Hero onSearch={setSearchQuery} />
        <ItemGrid searchQuery={searchQuery} />
      </main>
    </div>
  );
};

export default Index;
