// Tests for socketService.js — the WebSocket management layer that connects
// the driver app to the backend via Socket.io. connectSocket must be idempotent
// (re-using an existing connected socket), decodeJwtSub must never throw even
// on malformed tokens, and disconnectSocket must cleanly nullify the singleton
// so the next connectSocket call creates a fresh connection.

import { io } from 'socket.io-client';
import { connectSocket, disconnectSocket, getSocket } from '../../../src/services/socketService';

// The jest.setup.js mock returns a shared socket object. We grab a reference
// to the same object so we can mutate its `connected` state per test.
const mockSocket = io.mock.results[0]?.value ?? {
  connected: false,
  id: 'test-socket-id',
  on: jest.fn(),
  emit: jest.fn(),
  disconnect: jest.fn(),
};

// Reset the singleton between tests by always disconnecting first.
beforeEach(() => {
  disconnectSocket();
  jest.clearAllMocks();

  // Re-configure the io mock to return a fresh socket-like object each call.
  io.mockImplementation(() => ({
    connected: false,
    id: 'test-socket-id',
    on: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
  }));
});

describe('getSocket', () => {
  test('returns null before any connection is established', () => {
    expect(getSocket()).toBeNull();
  });

  test('returns the socket object after connectSocket is called', () => {
    connectSocket('valid.jwt.token');
    expect(getSocket()).not.toBeNull();
  });
});

describe('connectSocket', () => {
  test('calls io with the configured base URL', () => {
    connectSocket('valid.jwt.token');
    expect(io).toHaveBeenCalledTimes(1);
    const calledUrl = io.mock.calls[0][0];
    expect(typeof calledUrl).toBe('string');
    expect(calledUrl.length).toBeGreaterThan(0);
  });

  test('passes the bearer token in the auth option', () => {
    connectSocket('my-jwt-token');
    const options = io.mock.calls[0][1];
    expect(options.auth.token).toBe('Bearer my-jwt-token');
  });

  test('enables WebSocket transport', () => {
    connectSocket('my-jwt-token');
    const options = io.mock.calls[0][1];
    expect(options.transports).toContain('websocket');
  });

  test('enables reconnection', () => {
    connectSocket('my-jwt-token');
    const options = io.mock.calls[0][1];
    expect(options.reconnection).toBe(true);
  });

  test('registers connect, connect_error and disconnect handlers', () => {
    const socket = connectSocket('my-jwt-token');
    const registeredEvents = socket.on.mock.calls.map(([event]) => event);
    expect(registeredEvents).toContain('connect');
    expect(registeredEvents).toContain('connect_error');
    expect(registeredEvents).toContain('disconnect');
  });

  test('returns the existing socket if already connected', () => {
    // Simulate an already-connected socket.
    const connectedSocket = {
      connected: true,
      id: 'existing-id',
      on: jest.fn(),
      emit: jest.fn(),
      disconnect: jest.fn(),
    };
    io.mockReturnValueOnce(connectedSocket);
    const first = connectSocket('token-a');

    // Manually mark it as connected.
    first.connected = true;

    // Override io to return something different to detect if it is called again.
    io.mockImplementation(() => ({ connected: false, on: jest.fn(), emit: jest.fn(), disconnect: jest.fn() }));
    const second = connectSocket('token-b');

    expect(second).toBe(first);
    // io should only have been called once for the first connection.
    expect(io).toHaveBeenCalledTimes(1);
  });

  test('disconnects stale socket and creates a new one if not connected', () => {
    const staleSocket = {
      connected: false,
      id: 'stale',
      on: jest.fn(),
      emit: jest.fn(),
      disconnect: jest.fn(),
    };
    io.mockReturnValueOnce(staleSocket);
    connectSocket('token-a');

    // staleSocket.connected is false, so the next call should disconnect it and create a new socket.
    connectSocket('token-b');

    expect(staleSocket.disconnect).toHaveBeenCalledTimes(1);
    expect(io).toHaveBeenCalledTimes(2);
  });
});

describe('disconnectSocket', () => {
  test('calls disconnect on the active socket', () => {
    const socket = connectSocket('token');
    disconnectSocket();
    expect(socket.disconnect).toHaveBeenCalledTimes(1);
  });

  test('sets the socket to null so getSocket returns null afterwards', () => {
    connectSocket('token');
    disconnectSocket();
    expect(getSocket()).toBeNull();
  });

  test('is safe to call when no socket exists', () => {
    expect(() => disconnectSocket()).not.toThrow();
    expect(getSocket()).toBeNull();
  });
});
