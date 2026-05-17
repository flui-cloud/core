import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WsAuthService } from '../services/ws-auth.service';

/**
 * Installs a socket.io middleware that authenticates every incoming connection
 * via WsAuthService. Rejects the connection (handshake error) when the token
 * is missing or invalid. On success, attaches the AuthenticatedUser to
 * `socket.data.user`.
 */
export function installWsAuth(
  server: Server,
  wsAuth: WsAuthService,
  logger: Logger,
): void {
  server.use(async (socket: Socket, next: (err?: Error) => void) => {
    try {
      const user = await wsAuth.authenticate(socket);
      socket.data.user = user;
      next();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unauthorized socket connection';
      logger.warn(
        `Rejected socket ${socket.id} from ${socket.handshake.address}: ${message}`,
      );
      next(new Error(message));
    }
  });
}
