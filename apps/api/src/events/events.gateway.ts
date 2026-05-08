import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({ cors: { origin: '*' } })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);

  constructor(private readonly jwt: JwtService) {}

  handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token?.replace('Bearer ', '');
      if (!token) throw new Error('No token');
      const payload = this.jwt.verify(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
      client.data.user = payload;
      this.logger.log(`Client connected: ${client.id} (user: ${payload.sub})`);
    } catch {
      this.logger.warn(`Rejected connection: ${client.id}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-order')
  handleJoinOrder(
    @MessageBody() data: { orderId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`order:${data.orderId}`);
  }

  @SubscribeMessage('join-merchant')
  handleJoinMerchant(
    @MessageBody() data: { merchantId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`merchant:${data.merchantId}`);
  }

  @SubscribeMessage('join-driver')
  handleJoinDriver(
    @MessageBody() data: { driverId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`driver:${data.driverId}`);
  }

  emitOrderStatus(orderId: string, status: string) {
    this.server.to(`order:${orderId}`).emit('order:status', { orderId, status });
  }

  emitNewOrder(driverIds: string[], payload: {
    orderId: string;
    reward: number;
    distanceKm: number;
    type: string;
    pickup: string;
  }) {
    for (const driverId of driverIds) {
      this.server.to(`driver:${driverId}`).emit('order:new', payload);
    }
  }

  emitDriverStatus(driverId: string, status: string) {
    this.server.to(`driver:${driverId}`).emit('driver:status', { driverId, status });
  }
}
