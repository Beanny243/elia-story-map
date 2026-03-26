import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";

export const shareContent = async (data: { title: string; text: string; url?: string; imageUrl?: string }) => {
  const shareUrl = data.url || window.location.href;

  if (navigator.share) {
    try {
      await navigator.share({ title: data.title, text: data.text, url: shareUrl });
      return;
    } catch {
      // Fall through to manual share links
    }
  }

  return { shareUrl, title: data.title, text: data.text };
};

const openLink = (url: string) => {
  if (Capacitor.isNativePlatform()) {
    void Browser.open({ url });
    return;
  }

  window.location.assign(url);
};

export const shareToTwitter = (text: string, url: string) => {
  openLink(`https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
};

export const shareToFacebook = (url: string) => {
  openLink(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
};

export const shareToWhatsApp = (text: string, url: string) => {
  openLink(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`);
};

export const shareToTelegram = (text: string, url: string) => {
  openLink(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`);
};
