import { Share2, Twitter, Facebook, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  copyShareLink,
  copyShareMessage,
  shareContent,
  shareToFacebook,
  shareToTelegram,
  shareToTwitter,
  shareToWhatsApp,
} from "@/lib/share";
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
      return;
    }

    const copied = await copyShareMessage(text, shareUrl);
    toast({
      title: copied ? "Link copied" : "Share ready",
      description: copied ? "The share link was copied to your clipboard." : "Copy and share this link manually.",
    });
  };

  const handleShareAction = async (
    action: () => Promise<string>,
    fallback?: () => Promise<boolean>,
  ) => {
    const result = await action();

    if (result === "shared") {
      toast({ title: "Shared!", description: "Content shared successfully." });
      return;
    }

    const copied = fallback ? await fallback() : false;
    if (copied) {
      toast({ title: "Link copied", description: "The share details were copied in case the app blocks popups." });
      return;
    }

    toast({
      title: result === "opened" ? "Opened share" : "Share app blocked",
      description:
        result === "opened"
          ? "Your share app opened in a new tab."
          : "This app blocked the share popup, so use the copied link instead.",
    });
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
        <DropdownMenuItem onClick={() => void handleShareAction(() => shareToTwitter(title, text, shareUrl), () => copyShareMessage(text, shareUrl))} className="gap-2">
          <Twitter className="h-4 w-4" /> X (Twitter)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => void handleShareAction(() => shareToFacebook(title, text, shareUrl), () => copyShareLink(shareUrl))} className="gap-2">
          <Facebook className="h-4 w-4" /> Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => void handleShareAction(() => shareToWhatsApp(title, text, shareUrl), () => copyShareMessage(text, shareUrl))} className="gap-2">
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => void handleShareAction(() => shareToTelegram(title, text, shareUrl), () => copyShareMessage(text, shareUrl))} className="gap-2">
          <Send className="h-4 w-4" /> Telegram
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareMenu;
