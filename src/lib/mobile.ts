import { useEffect, useState } from 'react';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

export const isMobile = () => {
  return typeof (window as any).Capacitor !== 'undefined';
};

export const isIOS = () => {
  return isMobile() && (window as any).Capacitor.getPlatform() === 'ios';
};

export const isAndroid = () => {
  return isMobile() && (window as any).Capacitor.getPlatform() === 'android';
};

export const useMobileApp = () => {
  const [appUrlOpen, setAppUrlOpen] = useState<string | null>(null);

  useEffect(() => {
    if (!isMobile()) return;

    // Hide splash screen after app loads
    SplashScreen.hide();

    // Set status bar style
    StatusBar.setStyle({ style: Style.Dark });
    StatusBar.setBackgroundColor({ color: '#ffffff' });

    // Handle app URL open (deep linking)
    App.addListener('appUrlOpen', (data) => {
      console.log('App opened with URL:', data.url);
      setAppUrlOpen(data.url);
    });

    // Handle back button on Android
    App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        App.exitApp();
      }
    });

    return () => {
      App.removeAllListeners();
    };
  }, []);

  return { appUrlOpen, isMobile: isMobile(), isIOS: isIOS(), isAndroid: isAndroid() };
};

// Open checkout URL in system browser for mobile
export const openCheckout = async (checkoutUrl: string): Promise<void> => {
  if (isMobile()) {
    // On mobile, use the Browser plugin for better UX
    await Browser.open({ url: checkoutUrl, presentationStyle: 'popover' });
  } else {
    // On web, use regular redirect
    window.location.href = checkoutUrl;
  }
};

// Close browser and return to app
export const closeCheckout = async (): Promise<void> => {
  if (isMobile()) {
    await Browser.close();
  }
};

// Handle deep link return from Stripe
export const handleStripeReturn = (url: string): { success: boolean; canceled: boolean } => {
  const urlObj = new URL(url);
  const path = urlObj.pathname;
  const searchParams = new URLSearchParams(urlObj.search);
  
  if (path.includes('/subscription')) {
    return {
      success: searchParams.get('success') === 'true',
      canceled: searchParams.get('canceled') === 'true',
    };
  }
  
  return { success: false, canceled: false };
};
