import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import ImageSearch from "./ImageSearch";

const ImageSearchButton = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsSearchOpen(true)}
        className="flex items-center gap-2"
      >
        <Camera className="h-4 w-4" />
        <span className="hidden sm:inline">Visual Search</span>
      </Button>
      
      <ImageSearch 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </>
  );
};

export default ImageSearchButton;