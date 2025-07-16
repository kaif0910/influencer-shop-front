import { useState } from "react";
import { Camera } from "lucide-react";
import ImageSearch from "./ImageSearch";

const VisualSearchFAB = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsSearchOpen(true)}
        className="fixed z-40 bottom-20 right-4 sm:bottom-24 sm:right-8 bg-purple-600 text-white shadow-lg rounded-full p-3 flex items-center gap-2 hover:bg-purple-700 animate-fade-in"
        aria-label="Visual Search"
        style={{ boxShadow: "0 2px 16px 0 #0002" }}
      >
        <Camera className="h-6 w-6" />
        <span className="font-semibold hidden sm:block">Visual Search</span>
      </button>
      
      <ImageSearch 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </>
  );
};

export default VisualSearchFAB;