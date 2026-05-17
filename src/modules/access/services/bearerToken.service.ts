import {
  Injectable,
  HttpException,
  HttpStatus,
  NotImplementedException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { BearerTokenDto } from '../dto/bearer-token.dto';
import { CreateBearerTokenDto } from '../dto/create-bearer-token.dto';
import { CloudProvider } from '../../providers/enums/cloud-provider.enum';
import { ProviderRefreshTokenDto } from '../dto/refresh-token.dto';

@Injectable()
export class BearerTokenService {
  constructor(private readonly httpService: HttpService) {}

  async generateToken(
    provider: CloudProvider,
    dto: CreateBearerTokenDto,
  ): Promise<BearerTokenDto> {
    try {
      switch (provider) {
        case CloudProvider.CONTABO:
          return this.generateContaboToken(dto);
        case CloudProvider.HETZNER:
          return this.generateHetznerToken(dto);
        default:
          throw new HttpException(
            `Provider ${provider} not supported`,
            HttpStatus.BAD_REQUEST,
          );
      }
    } catch (error) {
      throw new HttpException(
        error.response?.data?.error || 'Authentication failed',
        error.response?.status || HttpStatus.UNAUTHORIZED,
      );
    }
  }

  private async generateContaboToken(
    dto: CreateBearerTokenDto,
  ): Promise<BearerTokenDto> {
    const response = await lastValueFrom(
      this.httpService.post(
        'https://auth.contabo.com/auth/realms/contabo/protocol/openid-connect/token',
        new URLSearchParams({
          grant_type: 'password',
          client_id: dto.client_id,
          username: dto.username,
          password: dto.password,
          client_secret: dto.client_secret,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      ),
    );

    return {
      access_token: response.data.access_token,
      token_type: 'Bearer',
      expires_in: response.data.expires_in,
      refresh_token: response.data.refresh_token,
    };
  }

  private async generateHetznerToken(
    dto: CreateBearerTokenDto,
  ): Promise<BearerTokenDto> {
    throw new NotImplementedException(
      'Hetzner uses API keys and does not support OAuth token generation',
    );
  }

  async refreshToken(
    provider: CloudProvider,
    dto: ProviderRefreshTokenDto,
  ): Promise<BearerTokenDto> {
    try {
      switch (provider) {
        case CloudProvider.CONTABO:
          return this.refreshContaboToken(dto);
        case CloudProvider.HETZNER:
          return this.refreshHetznerToken(dto);
        default:
          throw new HttpException(
            `Provider ${provider} not supported`,
            HttpStatus.BAD_REQUEST,
          );
      }
    } catch (error) {
      if (
        error.response?.status === 400 &&
        (error.response?.data?.error === 'invalid_grant' ||
          error.response?.data?.error_description?.includes('expired'))
      ) {
        throw new HttpException(
          'Refresh token has expired. Please log in again.',
          HttpStatus.UNAUTHORIZED,
        );
      }

      throw new HttpException(
        error.response?.data?.error_description ||
          error.response?.data?.error ||
          'Token refresh failed',
        error.response?.status || HttpStatus.UNAUTHORIZED,
      );
    }
  }

  private async refreshContaboToken(
    dto: ProviderRefreshTokenDto,
  ): Promise<BearerTokenDto> {
    const response = await lastValueFrom(
      this.httpService.post(
        'https://auth.contabo.com/auth/realms/contabo/protocol/openid-connect/token',
        new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: dto.client_id,
          client_secret: dto.client_secret,
          refresh_token: dto.refresh_token,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      ),
    );

    return {
      access_token: response.data.access_token,
      token_type: 'Bearer',
      expires_in: response.data.expires_in,
      refresh_token: response.data.refresh_token,
      scope: response.data.scope,
    };
  }

  private async refreshHetznerToken(
    dto: ProviderRefreshTokenDto,
  ): Promise<BearerTokenDto> {
    throw new NotImplementedException(
      'Hetzner uses API keys and does not support OAuth token refresh',
    );
  }
}
