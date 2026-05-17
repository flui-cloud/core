import { Injectable, Logger } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { getProjectPath } from '../../../common/utils/project-root.util';
import {
  ResourceProfileDto,
  ResourceProfilesResponseDto,
} from '../dto/images.dto';

export type ResourceProfileName =
  | 'nano'
  | 'small'
  | 'medium'
  | 'large'
  | 'xlarge';

interface ProfilesConfig {
  defaultProfile: ResourceProfileName;
  profiles: ResourceProfileDto[];
}

@Injectable()
export class ResourceProfilesService {
  private readonly logger = new Logger(ResourceProfilesService.name);
  private config: ProfilesConfig | null = null;

  getProfiles(): ResourceProfilesResponseDto {
    const { profiles, defaultProfile } = this.loadConfig();
    return { profiles, defaultProfile };
  }

  resolveResources(profileName: ResourceProfileName): ResourceProfileDto {
    const { profiles, defaultProfile } = this.loadConfig();
    const profile =
      profiles.find((p) => p.name === profileName) ??
      profiles.find((p) => p.name === defaultProfile) ??
      profiles[1]; // fallback to small (index 1)
    return profile;
  }

  getDefaultProfileName(): ResourceProfileName {
    return this.loadConfig().defaultProfile;
  }

  private loadConfig(): ProfilesConfig {
    if (!this.config) {
      try {
        const filePath = getProjectPath(
          'src',
          'modules',
          'images',
          'config',
          'resource-profiles.json',
        );
        this.config = JSON.parse(
          readFileSync(filePath, 'utf-8'),
        ) as ProfilesConfig;
        this.logger.log(
          `Loaded ${this.config.profiles.length} resource profiles`,
        );
      } catch (error) {
        this.logger.error(`Failed to load resource profiles: ${error.message}`);
        // Hardcoded fallback so the app doesn't crash
        this.config = {
          defaultProfile: 'small',
          profiles: [
            {
              name: 'small',
              cpu: { request: '100m', limit: '500m' },
              memory: { request: '128Mi', limit: '256Mi' },
            },
          ],
        };
      }
    }
    return this.config;
  }
}
