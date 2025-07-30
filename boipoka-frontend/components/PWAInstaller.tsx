'use client';

import { useEffect } from 'react';

export default function PWAInstaller() {
  useEffect(() => {
    // Register service worker with better error handling
    if ('serviceWorker' in navigator) {
      // Unregister any existing service workers to prevent conflicts
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          if (registration.scope !== location.origin + '/') {
            registration.unregister();
          }
        });
      });

      // Register the main service worker
      navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none' // Prevent caching issues
      })
        .then((registration) => {
          console.log('SW registered successfully');

          // Handle updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker is available
                  console.log('New service worker available');
                }
              });
            }
          });
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });

      // Handle service worker errors and messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'PRECACHE_ERROR') {
          console.warn('Precache error handled:', event.data.url);
          // Handle precache errors gracefully without breaking the app
        }
      });

      // Listen for service worker errors
      navigator.serviceWorker.addEventListener('error', (event) => {
        console.warn('Service Worker error:', event);
      });
    }

    // Handle PWA install prompt
    let deferredPrompt: BeforeInstallPromptEvent | null = null;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e as BeforeInstallPromptEvent;
      showInstallPromotion();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
      console.log('PWA was installed');
      hideInstallPromotion();
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    function showInstallPromotion() {
      console.log('PWA install prompt available');
    }

    function hideInstallPromotion() {
      console.log('PWA install promotion hidden');
    }

    // Handle online/offline status with better network detection
    function updateOnlineStatus() {
      const isOnline = navigator.onLine;

      if (isOnline) {
        document.body.classList.remove('offline');
        document.body.classList.add('online');
        // Test actual connectivity with a simple ping
        fetch('/', {
          method: 'HEAD',
          cache: 'no-cache',
          signal: AbortSignal.timeout(5000)
        }).catch(() => {
          // If fetch fails, we're actually offline
          document.body.classList.remove('online');
          document.body.classList.add('offline');
        });
      } else {
        document.body.classList.remove('online');
        document.body.classList.add('offline');
        // Redirect to offline page if not already there
        if (window.location.pathname !== '/offline') {
          window.location.href = '/offline';
        }
      }
    }

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Set initial status
    updateOnlineStatus();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  return null;
}

// Add type declaration for BeforeInstallPromptEvent
declare global {
  interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
      outcome: 'accepted' | 'dismissed';
      platform: string;
    }>;
    prompt(): Promise<void>;
  }
}
