export const shareContent = async (data: { title: string; text: string; url?: string; imageUrl?: string }) => {
  const shareUrl = data.url || window.location.href;

  // Try native share sheet first
  if (navigator.share) {
    try {
      await navigator.share({ title: data.title, text: data.text, url: shareUrl });
      return;
    } catch (e) {
      // User cancelled or not supported, fall through
    }
  }

  return { shareUrl, title: data.title, text: data.text };
};

export const shareToTwitter = (text: string, url: string) => {
  const link = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  const w = window.open(link, '_blank', 'noopener,noreferrer');
  if (!w) window.location.href = link;
};

export const shareToFacebook = (url: string) => {
  const link = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const w = window.open(link, '_blank', 'noopener,noreferrer');
  if (!w) window.location.href = link;
};

export const shareToWhatsApp = (text: string, url: string) => {
  const link = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
  const w = window.open(link, '_blank', 'noopener,noreferrer');
  if (!w) window.location.href = link;
};

export const shareToTelegram = (text: string, url: string) => {
  const link = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
  const w = window.open(link, '_blank', 'noopener,noreferrer');
  if (!w) window.location.href = link;
};
