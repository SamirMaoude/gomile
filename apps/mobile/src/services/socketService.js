import { io } from 'socket.io-client';
import Constants from 'expo-constants';

const DEFAULT_API_BASE_URL = 'http://localhost:3000';

function resolveApiBaseUrl() {
  const expoExtra = Constants.expoConfig?.extra ?? {};
  return (
    process.env.EXPO_PUBLIC_API_BASE_URL ??
    expoExtra.apiBaseUrl ??
    DEFAULT_API_BASE_URL
  );
}

// base64url → base64 → JSON
function decodeJwtSub(token) {
  try {
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(b64)).sub ?? null;
  } catch {
    return null;
  }
}

let _socket = null;

export function getSocket() {
  return _socket;
}

export function connectSocket(token) {
  if (_socket?.connected) return _socket;

  if (_socket) {
    _socket.disconnect();
    _socket = null;
  }

  const url = resolveApiBaseUrl();

  _socket = io(url, {
    auth: { token: `Bearer ${token}` },
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 2000,
    reconnectionAttempts: Infinity,
  });

  _socket.on('connect', () => {
    const driverId = decodeJwtSub(token);
    if (driverId) _socket.emit('join-driver', { driverId });
  });

  _socket.on('connect_error', (err) => {
    // Affiche le type d'erreur ET le message complet pour diagnostiquer
    console.warn('[socket] erreur de connexion →', err.type ?? '?', '|', err.message);
    console.warn('[socket] URL utilisée :', url);
  });

  _socket.on('disconnect', (reason) => {
  });

  return _socket;
}

export function disconnectSocket() {
  if (_socket) {
    _socket.disconnect();
    _socket = null;
  }
}
