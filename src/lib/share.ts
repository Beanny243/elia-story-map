const copyToClipboard = async (value: string) => {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
};

const nativeShare = async (title: string, text: string, url: string): Promise<"shared" | "copied" | "failed"> => {
  try {
    await navigator.share({ title, text, url });
    return "shared";
  } catch {
    // User cancelled or share failed — fallback to copy
    const copied = await copyToClipboard(`${text} ${url}`.trim());
    return copied ? "copied" : "failed";
  }
};

export const shareContent = async (data: { title: string; text: string; url?: string }) => {
  const url = data.url || window.location.href;
  return nativeShare(data.title, data.text, url);
};

export const copyShareLink = async (url: string) => copyToClipboard(url);

export const shareToTwitter = (title: string, text: string, url: string) => nativeShare(title, text, url);
export const shareToFacebook = (title: string, text: string, url: string) => nativeShare(title, text, url);
export const shareToWhatsApp = (title: string, text: string, url: string) => nativeShare(title, text, url);
export const shareToTelegram = (title: string, text: string, url: string) => nativeShare(title, text, url);
