import { Share2, Twitter, Facebook, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { shareContent, shareToTwitter, shareToFacebook, shareToWhatsApp, shareToTelegram } from "@/lib/share";
import { useToast } from "@/hooks/use-toast";

interface ShareMenuProps {
  title: string;
  text: string;
  url?: string;
}

const ShareMenu = ({ title, text, url }: ShareMenuProps) => {
  const { toast } = useToast();
  const shareUrl = url || "https://eliamap.site/community";

  const handleNativeShare = async () => {
    const result = await shareContent({ title, text, url: shareUrl });
    if (!result) {
      toast({ title: "Shared!", description: "Content shared successfully." });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
          <Share2 className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {typeof navigator.share === 'function' && (
          <DropdownMenuItem onClick={handleNativeShare} className="gap-2">
            <Share2 className="h-4 w-4" /> Share...
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => shareToTwitter(text, shareUrl)} className="gap-2">
          <Twitter className="h-4 w-4" /> X (Twitter)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => shareToFacebook(shareUrl)} className="gap-2">
          <Facebook className="h-4 w-4" /> Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => shareToWhatsApp(text, shareUrl)} className="gap-2">
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => shareToTelegram(text, shareUrl)} className="gap-2">
          <Send className="h-4 w-4" /> Telegram
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareMenu;
