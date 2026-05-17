import { Hook } from '@oclif/core';

function initCell(i: number, j: number): number {
  if (i === 0) return j;
  if (j === 0) return i;
  return 0;
}

function levenshtein(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => initCell(i, j)),
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

const hook: Hook<'command_not_found'> = async function ({ config, id }) {
  const input = id ?? '';
  const allCommands = config.commands.map((c) => c.id);

  let best: string | null = null;
  let bestScore = Infinity;

  for (const cmd of allCommands) {
    const score = levenshtein(input, cmd);
    if (score < bestScore) {
      bestScore = score;
      best = cmd;
    }
  }

  const threshold = Math.max(3, Math.floor(input.length / 2));

  const fmt = (id: string) => id.replaceAll(':', ' ');

  if (best && bestScore <= threshold) {
    process.stderr.write(
      `Command "flui ${fmt(input)}" not found. Did you mean "flui ${fmt(best)}"?\n`,
    );
  } else {
    process.stderr.write(
      `Command "flui ${fmt(input)}" not found. Run "flui --help" to see available commands.\n`,
    );
  }

  process.exit(0);
};

export default hook;
