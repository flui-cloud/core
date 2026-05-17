import { Injectable, BadRequestException } from '@nestjs/common';
import { validate as fluiValidate, catalogAppSchema } from '@flui-cloud/spec';
import { CatalogManifest } from '../interfaces/catalog-manifest.interface';

@Injectable()
export class CatalogSchemaValidatorService {
  getSchema(): unknown {
    return catalogAppSchema;
  }

  validate(parsed: unknown): CatalogManifest {
    // Strip forward-compat fields not yet in the published @flui-cloud/spec
    // schema (currently `persistence` on standalone/building-block/component).
    // We re-attach them on the validated manifest before returning so the
    // catalog installer can still use them.
    const stripped = this.stripForwardCompatFields(parsed);

    const result = fluiValidate(stripped.value);
    if (!result.valid) {
      throw new BadRequestException({
        message: 'Invalid catalog manifest',
        errors: result.errors.map(
          (e) =>
            `${e.path} ${e.message}${e.params ? ' ' + JSON.stringify(e.params) : ''}`,
        ),
      });
    }
    if (result.manifest.kind !== 'CatalogApp') {
      throw new BadRequestException({
        message: 'Invalid catalog manifest',
        errors: [
          `<root> expected kind "CatalogApp", received "${result.manifest.kind}"`,
        ],
      });
    }
    const manifest = result.manifest as unknown as CatalogManifest;
    this.reattachForwardCompatFields(manifest, stripped.persistenceByPath);
    return manifest;
  }

  private stripForwardCompatFields(parsed: unknown): {
    value: unknown;
    persistenceByPath: Map<string, unknown>;
  } {
    const persistenceByPath = new Map<string, unknown>();
    if (!parsed || typeof parsed !== 'object') {
      return { value: parsed, persistenceByPath };
    }
    const clone = structuredClone(parsed) as Record<string, unknown>;
    const spec = (clone as { spec?: Record<string, unknown> }).spec;
    if (spec && typeof spec === 'object') {
      if ('persistence' in spec) {
        persistenceByPath.set('spec', spec.persistence);
        delete spec.persistence;
      }
      const components = (spec as { components?: unknown[] }).components;
      if (Array.isArray(components)) {
        components.forEach((c, i) => {
          if (
            c &&
            typeof c === 'object' &&
            'persistence' in (c as Record<string, unknown>)
          ) {
            persistenceByPath.set(
              `spec.components[${i}]`,
              (c as Record<string, unknown>).persistence,
            );
            delete (c as Record<string, unknown>).persistence;
          }
        });
      }
    }
    return { value: clone, persistenceByPath };
  }

  private reattachForwardCompatFields(
    manifest: CatalogManifest,
    persistenceByPath: Map<string, unknown>,
  ): void {
    if (persistenceByPath.size === 0) return;
    const spec = manifest.spec as unknown as Record<string, unknown>;
    const fromSpec = persistenceByPath.get('spec');
    if (fromSpec !== undefined) {
      spec.persistence = fromSpec;
    }
    const components = (spec as { components?: unknown[] }).components;
    if (Array.isArray(components)) {
      components.forEach((c, i) => {
        const v = persistenceByPath.get(`spec.components[${i}]`);
        if (v !== undefined && c && typeof c === 'object') {
          (c as Record<string, unknown>).persistence = v;
        }
      });
    }
  }
}
