import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";

type SharePayload = { title: string; text: string; url?: string; imageUrl?: string };

const canUseNativeShare = () => typeof navigator !== "undefined" && typeof navigator.share === "function";

const tryNativeShare = async (data: SharePayload) => {
  const shareUrl = data.url || window.location.href;

  if (!canUseNativeShare()) {
    return false;
  }

  try {
    await navigator.share({ title: data.title, text: data.text, url: shareUrl });
    return true;
  } catch {
    return false;
  }
};

const copyToClipboard = async (value: string) => {
  if (typeof navigator === "undefined" || !navigator.clipboard || !window.isSecureContext) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
};

export const shareContent = async (data: { title: string; text: string; url?: string; imageUrl?: string }) => {
  const shareUrl = data.url || window.location.href;

  if (await tryNativeShare(data)) {
    return;
  }

  return { shareUrl, title: data.title, text: data.text };
};

const openLink = (url: string) => {
  if (Capacitor.isNativePlatform()) {
    void Browser.open({ url });
    return;
  }

  const newWindow = window.open(url, "_blank", "noopener,noreferrer");

  if (!newWindow) {
    window.location.assign(url);
  }
};

export const copyShareLink = async (url: string) => copyToClipboard(url);

export const copyShareMessage = async (text: string, url: string) => copyToClipboard(`${text} ${url}`.trim());

export const shareToTwitter = async (title: string, text: string, url: string) => {
  if (await tryNativeShare({ title, text, url })) {
    return "shared";
  }

  openLink(`https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
  return "opened";
};

export const shareToFacebook = async (title: string, text: string, url: string) => {
  if (await tryNativeShare({ title, text, url })) {
    return "shared";
  }

  openLink(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
  return "opened";
};

export const shareToWhatsApp = async (title: string, text: string, url: string) => {
  if (await tryNativeShare({ title, text, url })) {
    return "shared";
  }

  openLink(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`);
  return "opened";
};

export const shareToTelegram = async (title: string, text: string, url: string) => {
  if (await tryNativeShare({ title, text, url })) {
    return "shared";
  }

  openLink(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`);
  return "opened";
};
