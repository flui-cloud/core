import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  WsException,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WsAuthService } from '../services/ws-auth.service';
import { installWsAuth } from '../utils/ws-auth-middleware.util';

/**
 * Per-user WebSocket gateway. Clients join the room `user:{fluiUserId}` to
 * receive events scoped to their account (e.g. post-OAuth-callback "refresh
 * this page now" signals).
 *
 * Namespace: /user
 */
@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/user',
})
export class UserEventsGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(UserEventsGateway.name);

  constructor(private readonly wsAuth: WsAuthService) {}

  afterInit(server: Server): void {
    installWsAuth(server, this.wsAuth, this.logger);
  }

  @SubscribeMessage('subscribe:user')
  handleSubscribe(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ): void {
    const auth = client.data.user;
    if (!auth) {
      throw new WsException('Unauthenticated');
    }
    if (!auth.isAdmin && data.userId !== auth.userId) {
      this.logger.warn(
        `User ${auth.userId} attempted to subscribe to foreign room user:${data.userId}`,
      );
      throw new WsException('Forbidden: cannot subscribe to another user');
    }
    const room = `user:${data.userId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} (user=${auth.userId}) joined ${room}`);
    client.emit('subscribed', { room });
  }

  @SubscribeMessage('unsubscribe:user')
  handleUnsubscribe(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ): void {
    const room = `user:${data.userId}`;
    client.leave(room);
    client.emit('unsubscribed', { room });
  }

  emitGithubConnected(
    fluiUserId: string,
    payload: { githubLogin: string; installationId: string | null },
  ): void {
    const room = `user:${fluiUserId}`;
    this.server.to(room).emit('github:connected', payload);
    this.logger.log(
      `Emitted github:connected to ${room} (${payload.githubLogin})`,
    );
  }
}
