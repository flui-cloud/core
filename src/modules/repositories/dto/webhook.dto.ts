import { IsString, IsArray, IsUrl } from 'class-validator';

export class CreateWebhookDto {
  @IsUrl()
  callbackUrl: string;

  @IsArray()
  @IsString({ each: true })
  events: string[];
}

export class WebhookPayloadDto {
  repositoryId: string;
  event: string;
  branch: string;
  commitSha: string;
  commitMessage: string;
  commitAuthor: {
    name: string;
    email: string;
  };
  timestamp: Date;
}

export class ValidateWebhookDto {
  @IsString()
  signature: string;

  @IsString()
  payload: string;
}
