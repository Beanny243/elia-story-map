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

const openLink = (url: string) => {
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
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
