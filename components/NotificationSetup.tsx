'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/plants';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return new Uint8Array(Array.from(rawData).map((c) => c.charCodeAt(0)));
}

export default function NotificationSetup() {
  const [status, setStatus] = useState<'idle' | 'subscribed' | 'denied' | 'unsupported'>('idle');
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (!('Notification' in window)) { setStatus('unsupported'); return; }
    if (Notification.permission === 'granted') setStatus('subscribed');
    if (Notification.permission === 'denied') setStatus('denied');
  }, []);

  const subscribe = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') { setStatus('denied'); return; }

    const registration = await navigator.serviceWorker.ready;
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) return;

    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    });

    const subJson = sub.toJSON();
    await supabase.from('push_subscriptions').upsert({
      endpoint: subJson.endpoint,
      p256dh: subJson.keys?.p256dh,
      auth: subJson.keys?.auth,
      label: navigator.userAgent.includes('iPhone') ? 'iPhone' :
             navigator.userAgent.includes('Android') ? 'Android' : 'Browser',
    }, { onConflict: 'endpoint' });

    setStatus('subscribed');
  };

  if (status === 'unsupported') return null;

  return (
    <div className="relative">
      <button
        onClick={status === 'idle' ? subscribe : () => setShowTooltip(!showTooltip)}
        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border transition-all
          ${status === 'subscribed'
            ? 'bg-leaf-800/60 border-leaf-700/40 text-leaf-400'
            : status === 'denied'
            ? 'bg-red-900/40 border-red-800/40 text-red-400'
            : 'bg-leaf-700/60 border-leaf-600/50 text-leaf-200 hover:bg-leaf-600/60'
          }`}
      >
        {status === 'subscribed' && <><span>🔔</span><span>On</span></>}
        {status === 'denied'     && <><span>🔕</span><span>Blocked</span></>}
        {status === 'idle'       && <><span>🔔</span><span>Notify me</span></>}
      </button>

      {showTooltip && status === 'subscribed' && (
        <div className="absolute right-0 top-10 w-56 bg-leaf-800 border border-leaf-700/50 rounded-xl px-3 py-2.5 text-xs text-leaf-300 shadow-xl z-10">
          Push notifications are enabled on this device. To manage them, go to your browser or phone notification settings.
          <button onClick={() => setShowTooltip(false)} className="block mt-1.5 text-leaf-500">Close</button>
        </div>
      )}

      {showTooltip && status === 'denied' && (
        <div className="absolute right-0 top-10 w-56 bg-leaf-800 border border-leaf-700/50 rounded-xl px-3 py-2.5 text-xs text-leaf-300 shadow-xl z-10">
          Notifications are blocked. Enable them in your browser settings, then reload.
          <button onClick={() => setShowTooltip(false)} className="block mt-1.5 text-leaf-500">Close</button>
        </div>
      )}
    </div>
  );
}
