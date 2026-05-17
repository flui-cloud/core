import { Injectable } from '@nestjs/common';
import * as fs from 'node:fs';
import * as path from 'node:path';

@Injectable()
export class TemplateRendererService {
  private readonly cache = new Map<string, string>();
  private readonly templateRoot = TemplateRendererService.resolveTemplateRoot();

  private static resolveTemplateRoot(): string {
    const candidates = [
      path.join(__dirname, '..', 'templates'),
      path.join(__dirname, 'modules', 'backups', 'templates'),
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
    return candidates[0];
  }

  render(relativePath: string, vars: Record<string, string>): string {
    let tpl = this.cache.get(relativePath);
    if (!tpl) {
      const full = path.join(this.templateRoot, relativePath);
      tpl = fs.readFileSync(full, 'utf-8');
      this.cache.set(relativePath, tpl);
    }
    let out = tpl;
    for (const [k, v] of Object.entries(vars)) {
      out = out.split(`{{${k}}}`).join(v);
    }
    return out;
  }
}
