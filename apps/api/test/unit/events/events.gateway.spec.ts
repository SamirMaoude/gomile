import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EventsGateway } from 'src/events/events.gateway';
import { Socket } from 'socket.io';

jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});

const mockJwt = {
  verify: jest.fn(),
};

function makeSocket(authToken?: string): Partial<Socket> & { data: Record<string, unknown> } {
  return {
    id: 'socket-1',
    handshake: { auth: authToken ? { token: authToken } : {} } as any,
    data: {},
    join: jest.fn(),
    disconnect: jest.fn(),
  };
}

const mockEmit = jest.fn();
const mockTo = jest.fn().mockReturnValue({ emit: mockEmit });

describe('EventsGateway', () => {
  let gateway: EventsGateway;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockTo.mockReturnValue({ emit: mockEmit });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsGateway,
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    gateway = module.get(EventsGateway);
    gateway.server = { to: mockTo } as any;
  });

  describe('handleConnection', () => {
    it('sets user on client.data when token is valid', () => {
      mockJwt.verify.mockReturnValue({ sub: 'user1', role: 'DRIVER' });
      const socket = makeSocket('Bearer valid-token');

      gateway.handleConnection(socket as Socket);

      expect(socket.data.user).toEqual({ sub: 'user1', role: 'DRIVER' });
      expect(socket.disconnect).not.toHaveBeenCalled();
    });

    it('disconnects client when token is missing', () => {
      const socket = makeSocket();
      gateway.handleConnection(socket as Socket);
      expect(socket.disconnect).toHaveBeenCalled();
    });

    it('disconnects client when token is invalid', () => {
      mockJwt.verify.mockImplementation(() => { throw new Error('invalid'); });
      const socket = makeSocket('Bearer bad-token');
      gateway.handleConnection(socket as Socket);
      expect(socket.disconnect).toHaveBeenCalled();
    });

    it('strips Bearer prefix before verifying', () => {
      mockJwt.verify.mockReturnValue({ sub: 'user1' });
      const socket = makeSocket('Bearer my-token');
      gateway.handleConnection(socket as Socket);
      expect(mockJwt.verify).toHaveBeenCalledWith('my-token', expect.any(Object));
    });
  });

  describe('handleDisconnect', () => {
    it('logs on disconnect without throwing', () => {
      const socket = makeSocket();
      expect(() => gateway.handleDisconnect(socket as Socket)).not.toThrow();
    });
  });

  describe('handleJoinOrder', () => {
    it('joins the order room', () => {
      const socket = makeSocket();
      gateway.handleJoinOrder({ orderId: 'order1' }, socket as Socket);
      expect(socket.join).toHaveBeenCalledWith('order:order1');
    });
  });

  describe('handleJoinMerchant', () => {
    it('joins the merchant room', () => {
      const socket = makeSocket();
      gateway.handleJoinMerchant({ merchantId: 'merchant1' }, socket as Socket);
      expect(socket.join).toHaveBeenCalledWith('merchant:merchant1');
    });
  });

  describe('handleJoinDriver', () => {
    it('joins the driver room', () => {
      const socket = makeSocket();
      gateway.handleJoinDriver({ driverId: 'driver1' }, socket as Socket);
      expect(socket.join).toHaveBeenCalledWith('driver:driver1');
    });
  });

  describe('emitOrderStatus', () => {
    it('emits order:status to the order room', () => {
      gateway.emitOrderStatus('order1', 'DELIVERED');
      expect(mockTo).toHaveBeenCalledWith('order:order1');
      expect(mockEmit).toHaveBeenCalledWith('order:status', { orderId: 'order1', status: 'DELIVERED' });
    });
  });

  describe('emitNewOrder', () => {
    it('emits order:new to each driver room', () => {
      const payload = { orderId: 'order1', reward: 5, distanceKm: 2.5, type: 'FOOD', pickup: 'Paris' };
      gateway.emitNewOrder(['driver1', 'driver2'], payload);
      expect(mockTo).toHaveBeenCalledWith('driver:driver1');
      expect(mockTo).toHaveBeenCalledWith('driver:driver2');
      expect(mockEmit).toHaveBeenCalledTimes(2);
    });

    it('does nothing when driverIds list is empty', () => {
      gateway.emitNewOrder([], { orderId: 'o1', reward: 5, distanceKm: 1, type: 'FOOD', pickup: 'Paris' });
      expect(mockTo).not.toHaveBeenCalled();
    });
  });

  describe('emitDriverStatus', () => {
    it('emits driver:status to the driver room', () => {
      gateway.emitDriverStatus('driver1', 'AVAILABLE');
      expect(mockTo).toHaveBeenCalledWith('driver:driver1');
      expect(mockEmit).toHaveBeenCalledWith('driver:status', { driverId: 'driver1', status: 'AVAILABLE' });
    });
  });
});
