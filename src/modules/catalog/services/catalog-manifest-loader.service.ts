import { Injectable, BadRequestException } from '@nestjs/common';
import {
  parseYaml,
  computeChecksum,
  FluiYamlParseError,
} from '@flui-cloud/spec';
import { CatalogManifest } from '../interfaces/catalog-manifest.interface';
import { CatalogSchemaValidatorService } from './catalog-schema-validator.service';

export interface LoadedManifest {
  manifest: CatalogManifest;
  checksum: string;
}

@Injectable()
export class CatalogManifestLoaderService {
  constructor(private readonly validator: CatalogSchemaValidatorService) {}

  load(rawYaml: string): LoadedManifest {
    let parsed: unknown;
    try {
      parsed = parseYaml(rawYaml);
    } catch (err) {
      throw new BadRequestException(formatParseError(err));
    }

    const manifest = this.validator.validate(parsed);
    const checksum = computeChecksum(manifest);
    return { manifest, checksum };
  }
}

function formatParseError(err: unknown): string {
  if (err instanceof FluiYamlParseError) return err.message;
  if (err instanceof Error) return `Invalid YAML: ${err.message}`;
  return `Invalid YAML: ${String(err)}`;
}
