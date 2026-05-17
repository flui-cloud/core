import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CatalogSchemaValidatorService } from '../src/modules/catalog/services/catalog-schema-validator.service';
import { CatalogManifestLoaderService } from '../src/modules/catalog/services/catalog-manifest-loader.service';

const validator = new CatalogSchemaValidatorService();
const loader = new CatalogManifestLoaderService(validator);
const dir = 'src/modules/catalog/seed';
const files = readdirSync(dir).filter((f) => f.endsWith('.flui.yaml'));

let ok = 0;
let fail = 0;
for (const f of files) {
  try {
    const { manifest, checksum } = loader.load(
      readFileSync(join(dir, f), 'utf-8'),
    );
    console.log(
      'OK ',
      f.padEnd(32),
      manifest.metadata.id.padEnd(20),
      checksum.slice(0, 12),
    );
    ok++;
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error('FAIL', f, message);
    fail++;
  }
}
console.log('---');
console.log(`Total: ${files.length}  OK: ${ok}  FAIL: ${fail}`);
process.exit(fail === 0 ? 0 : 1);
