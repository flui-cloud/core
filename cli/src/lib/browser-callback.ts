import * as http from 'node:http';
import { execFile } from 'node:child_process';

const CALLBACK_PORTS = [8899, 8900, 8901, 8902, 8910];

function tryListen(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = http.createServer();
    server.once('error', () => resolve(false));
    server.listen(port, '127.0.0.1', () => {
      server.close(() => resolve(true));
    });
  });
}

export async function findFreeCallbackPort(): Promise<number> {
  for (const port of CALLBACK_PORTS) {
    if (await tryListen(port)) return port;
  }
  throw new Error(
    `No free local callback port available in [${CALLBACK_PORTS.join(', ')}]`,
  );
}

export function openInBrowser(url: string): boolean {
  let cmd: string;
  let args: string[];
  if (process.platform === 'darwin') {
    cmd = 'open';
    args = [url];
  } else if (process.platform === 'win32') {
    cmd = 'cmd';
    args = ['/c', 'start', '', url];
  } else {
    cmd = 'xdg-open';
    args = [url];
  }
  try {
    execFile(cmd, args, () => undefined);
    return true;
  } catch {
    return false;
  }
}

export function renderPage(title: string, body: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>body{font-family:sans-serif;max-width:480px;margin:80px auto;text-align:center}</style></head><body>${body}</body></html>`;
}
