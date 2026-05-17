import * as fs from 'node:fs';
import * as path from 'node:path';

export interface PostCheckIssue {
  level: 'warn' | 'info';
  title: string;
  detail: string;
  hint: string;
}

export interface FrameworkPostCheck {
  framework: string;
  run(targetDir: string): PostCheckIssue[];
}

function readIfExists(file: string): string | undefined {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch {
    return undefined;
  }
}

function findFirstExisting(
  targetDir: string,
  names: string[],
): string | undefined {
  for (const name of names) {
    const p = path.join(targetDir, name);
    if (fs.existsSync(p)) return p;
  }
  return undefined;
}

const NEXTJS_CONFIG_FILES = [
  'next.config.js',
  'next.config.mjs',
  'next.config.cjs',
  'next.config.ts',
];

const NEXTJS_STANDALONE_RX = /output\s*:\s*['"`]standalone['"`]/;

const NEXTJS_CHECK: FrameworkPostCheck = {
  framework: 'nextjs',
  run(targetDir) {
    const configPath = findFirstExisting(targetDir, NEXTJS_CONFIG_FILES);

    if (!configPath) {
      return [
        {
          level: 'warn',
          title: 'Missing next.config — standalone output not configured',
          detail:
            'The Dockerfile copies from `.next/standalone` and `.next/static`, which only exist when Next.js is built with `output: "standalone"`. Without it the build will fail with "/app/.next/standalone: not found".',
          hint: 'Create `next.config.js` at the project root containing:\n    module.exports = { output: "standalone" };',
        },
      ];
    }

    const raw = readIfExists(configPath) ?? '';
    if (NEXTJS_STANDALONE_RX.test(raw)) return [];

    const filename = path.basename(configPath);
    return [
      {
        level: 'warn',
        title: `${filename} does not enable Next.js standalone output`,
        detail:
          'The Dockerfile copies from `.next/standalone` and `.next/static`, which only exist when Next.js is built with `output: "standalone"`. Without it the build will fail with "/app/.next/standalone: not found".',
        hint: `Add \`output: "standalone"\` to the config object in ${filename}, for example:\n    /** @type {import("next").NextConfig} */\n    const nextConfig = {\n      output: "standalone",\n      // ...your existing options\n    };\n    module.exports = nextConfig;`,
      },
    ];
  },
};

const NUXT_CONFIG_FILES = [
  'nuxt.config.ts',
  'nuxt.config.js',
  'nuxt.config.mjs',
];
const NUXT_NODE_PRESET_RX = /preset\s*:\s*['"`]node[_-]server['"`]/;

const NUXT_CHECK: FrameworkPostCheck = {
  framework: 'nuxt',
  run(targetDir) {
    const configPath = findFirstExisting(targetDir, NUXT_CONFIG_FILES);
    if (!configPath) {
      return [
        {
          level: 'info',
          title: 'No nuxt.config found',
          detail:
            'The Dockerfile runs `.output/server/index.mjs`, the default Nitro Node preset output. If you have set a custom Nitro preset (vercel, cloudflare, ...) the build artifacts will differ and the Dockerfile may need adjusting.',
          hint: 'No action needed if you use the default Node preset. Otherwise, ensure the Nitro preset emits a Node server entrypoint.',
        },
      ];
    }
    const raw = readIfExists(configPath) ?? '';
    if (!NUXT_NODE_PRESET_RX.test(raw)) return [];
    return [];
  },
};

const SVELTEKIT_PKG = 'package.json';
const SVELTEKIT_ADAPTER_RX = /@sveltejs\/adapter-node/;

const SVELTEKIT_CHECK: FrameworkPostCheck = {
  framework: 'sveltekit',
  run(targetDir) {
    const pkgPath = path.join(targetDir, SVELTEKIT_PKG);
    const raw = readIfExists(pkgPath);
    if (!raw) return [];
    if (SVELTEKIT_ADAPTER_RX.test(raw)) return [];
    return [
      {
        level: 'warn',
        title: 'SvelteKit project is not using @sveltejs/adapter-node',
        detail:
          'The Dockerfile runs `node build/index.js`, the output of the Node adapter. Other adapters (vercel, cloudflare, static) emit different artifacts and the container build will fail.',
        hint: 'Install the Node adapter and reference it in svelte.config.js:\n    npm i -D @sveltejs/adapter-node\n    // svelte.config.js\n    import adapter from "@sveltejs/adapter-node";\n    export default { kit: { adapter: adapter() } };',
      },
    ];
  },
};

const CHECKS: Map<string, FrameworkPostCheck> = new Map([
  [NEXTJS_CHECK.framework, NEXTJS_CHECK],
  [NUXT_CHECK.framework, NUXT_CHECK],
  [SVELTEKIT_CHECK.framework, SVELTEKIT_CHECK],
]);

export function runFrameworkPostChecks(
  framework: string,
  targetDir: string,
): PostCheckIssue[] {
  const check = CHECKS.get(framework);
  if (!check) return [];
  try {
    return check.run(targetDir);
  } catch {
    return [];
  }
}
