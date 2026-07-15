// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// 🔥 CONFIGURACIÓN DE FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyAjOrKIFp_Ml5RssrXduujNZW7ai1XIlRw",
  authDomain: "snaap-mx.firebaseapp.com",
  projectId: "snaap-mx",
  storageBucket: "snaap-mx.firebasestorage.app",
  messagingSenderId: "933191996234",
  appId: "1:933191996234:web:f45259cdd819f76d27e7b3",
  measurementId: "G-MTTZBGRWYM"
};

// 🔥 INICIALIZAR FIREBASE
firebase.initializeApp(firebaseConfig);

// 🔥 OBTENER MESSAGING
const messaging = firebase.messaging();

// 🔥 NOTIFICACIÓN EN SEGUNDO PLANO
messaging.onBackgroundMessage((payload) => {
  console.log('📨 Notificación en segundo plano:', payload);

  const notificationTitle = payload.notification?.title || 'SNAAP';
  const notificationOptions = {
    body: payload.notification?.body || 'Tienes una nueva notificación',
    icon: payload.notification?.icon || '/assets/images/Snaap.png',
    badge: '/assets/images/Snaap.png',
    data: payload.data || {},
    vibrate: [200, 100, 200],
    actions: [
      {
        action: 'open',
        title: 'Ver'
      },
      {
        action: 'close',
        title: 'Cerrar'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// 🔥 CLIC EN NOTIFICACIÓN
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  const url = data.link || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// 🔥 NOTIFICACIÓN CERRADA
self.addEventListener('notificationclose', (event) => {
  console.log('❌ Notificación cerrada:', event.notification);
});