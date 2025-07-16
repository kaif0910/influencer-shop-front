import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Bot, User, Camera, X, Loader2 } from "lucide-react";
import AITypingBubble from "./AITypingBubble";
import { generateAIResponse } from "./aiChatUtils";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";
import { useRef } from "react";
interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
  image?: string;
}
interface AIChatRoomProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}
const AIChatRoom = ({
  isOpen,
  setIsOpen
}: AIChatRoomProps) => {
  const [messages, setMessages] = useState<Message[]>([{
    id: "1",
    text: "Hello! I'm your shopping assistant. I can help you find products, answer questions about our items, and provide recommendations. What are you looking for today?",
    sender: "ai",
    timestamp: new Date()
  }]);
  const [inputMessage, setInputMessage] = useState("");
  const [isAITyping, setIsAITyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleSendMessage = () => {
  const generateImageResponse = (query: string) => {
    const responses = [
      "I can see the image you've shared! Based on what I'm looking at, I can help you find similar products on our platform. Would you like me to search for similar items?",
      "Great image! I can see this looks like a fashion/lifestyle product. Let me help you find similar items or answer any questions about styling this piece.",
      "Thanks for sharing the image! I can analyze the style, colors, and type of product. What specific information would you like about this item?",
      "I can see the image clearly! This appears to be a great piece. Would you like recommendations for similar products, styling tips, or information about where to find this item?",
      "Perfect! I can analyze this image for you. I can help with product identification, finding similar items, styling suggestions, or price comparisons. What would you like to know?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size should be less than 10MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setIsAnalyzingImage(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
      setIsAnalyzingImage(false);
      toast.success("Image uploaded! You can now ask questions about it.");
    };
    reader.readAsDataURL(file);
  };

    if (!inputMessage.trim() && !selectedImage) return;
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage || (selectedImage ? "I've shared an image with you." : ""),
      sender: "user",
      timestamp: new Date(),
      image: selectedImage || undefined
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setSelectedImage(null);
    setIsAITyping(true);

    // Simulate AI response
    setTimeout(() => {
      let aiResponse;
      if (userMessage.image) {
        aiResponse = generateImageResponse(inputMessage);
      } else {
        aiResponse = generateAIResponse(inputMessage);
      }
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: "ai",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsAITyping(false);
    }, 1200);
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };
  return <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:w-[420px] max-w-full h-screen max-h-screen rounded-none flex flex-col p-0"
    // Make the sidebar full height, width on mobile, side panel on desktop
    side="right">
        <SheetHeader className="px-6 pt-6 pb-2">
          <SheetTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-brand-600" />
            <span className="text-brand-600 font-bold">Styli</span>
          </SheetTitle>
          <SheetDescription className="text-inherit">
            Your personal style BFF, powered by AI.
          </SheetDescription>
        </SheetHeader>
        {/* Make chat area flex-1 to take all space */}
        <div className="flex flex-col flex-1 h-0 min-h-0 px-6 pb-4">
          <ScrollArea className="flex-1 min-h-0 pr-2">
            <div className="space-y-4">
              {messages.map(message => <div key={message.id} className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                  {message.sender === "ai" && <div className="w-8 h-8 bg-white border border-brand-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="h-5 w-5 text-brand-600" />
                    </div>}
                  <div className={`max-w-[280px] p-3 rounded-lg ${message.sender === "user" ? "bg-brand-600 text-white" : "bg-brand-200 text-brand-700"}`}>
                    {message.image && (
                      <div className="mb-2">
                        <img 
                          src={message.image} 
                          alt="Shared image" 
                          className="max-w-full h-32 object-cover rounded"
                        />
                      </div>
                    )}
                    <p className="text-sm">{message.text}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                    </span>
                  </div>
                  {message.sender === "user" && <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>}
                </div>)}
              {isAITyping && <AITypingBubble />}
            </div>
          </ScrollArea>
          <div className="border-t pt-4 mt-4">
            {selectedImage && (
              <div className="mb-3 relative inline-block">
                <img 
                  src={selectedImage} 
                  alt="Selected" 
                  className="max-w-32 h-20 object-cover rounded border"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 p-0"
                  onClick={() => setSelectedImage(null)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isAnalyzingImage}
                className="flex-shrink-0"
              >
                {isAnalyzingImage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </Button>
              <Input placeholder="Ask about products, prices, recommendations..." value={inputMessage} onChange={e => setInputMessage(e.target.value)} onKeyPress={handleKeyPress} className="flex-1" />
              <Button onClick={handleSendMessage} size="sm">
                <span className="sr-only">Send</span>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M22 2 11 13" />
                  <path d="m22 2-7 20-4-9-9-4Z" />
                </svg>
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <Button variant="ghost" size="sm" className="w-full mt-3 text-xs text-gray-500 hover:text-brand-600" onClick={() => setIsOpen(false)} aria-label="Close chat">
              Close Chat
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>;
};
export default AIChatRoom;