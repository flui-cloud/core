import { Injectable, Logger } from '@nestjs/common';
import {
  CrashPattern,
  PatternDiagnosis,
  CRASH_PATTERNS,
} from '../patterns/crash-patterns';

export interface PatternMatchResult {
  pattern: CrashPattern;
  diagnosis: PatternDiagnosis;
}

@Injectable()
export class CrashPatternMatcherService {
  private readonly logger = new Logger(CrashPatternMatcherService.name);

  match(logs: string): PatternMatchResult | null {
    if (!logs) return null;

    for (const pattern of CRASH_PATTERNS) {
      for (const regex of pattern.regexes) {
        const m = regex.exec(logs);
        if (m) {
          const diagnosis = pattern.build({ logs, match: m });
          return { pattern, diagnosis };
        }
      }
    }

    return null;
  }
}
