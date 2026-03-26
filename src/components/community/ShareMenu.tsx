import { Share2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { shareContent, copyShareLink } from "@/lib/share";
import { useToast } from "@/hooks/use-toast";

interface ShareMenuProps {
  title: string;
  text: string;
  url?: string;
}

const ShareMenu = ({ title, text, url }: ShareMenuProps) => {
  const { toast } = useToast();
  const shareUrl = url || "https://eliamap.site/community";

  const handleShare = async () => {
    const result = await shareContent({ title, text, url: shareUrl });

    if (result === "shared") {
      toast({ title: "Shared!", description: "Content shared successfully." });
    } else if (result === "copied") {
      toast({ title: "Link copied", description: "The share link was copied to your clipboard." });
    } else {
      // Last resort: try copy
      const copied = await copyShareLink(shareUrl);
      toast({
        title: copied ? "Link copied" : "Share failed",
        description: copied
          ? "The share link was copied to your clipboard."
          : "Could not share. Please copy the link manually.",
      });
    }
  };

  return (
    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg" onClick={handleShare}>
      <Share2 className="h-4 w-4 text-muted-foreground" />
    </Button>
  );
};

export default ShareMenu;
