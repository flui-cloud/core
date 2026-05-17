import {
  generateNipHostnameToken,
  isValidNipHostnameToken,
} from './nip-token.util';

describe('nip-token.util', () => {
  describe('generateNipHostnameToken', () => {
    it('produces a DNS-safe token ending with two letters', () => {
      const token = generateNipHostnameToken();
      expect(token).toMatch(/^[a-z]+-[a-z]+-[a-z]{2}$/);
      expect(isValidNipHostnameToken(token)).toBe(true);
    });

    it('never produces a token ending with a digit (nip.io IP-parsing collision)', () => {
      for (let i = 0; i < 1000; i++) {
        const token = generateNipHostnameToken();
        expect(token).not.toMatch(/\d$/);
      }
    });

    it('produces values within the 30-char DNS label limit', () => {
      for (let i = 0; i < 100; i++) {
        const token = generateNipHostnameToken();
        expect(token.length).toBeLessThanOrEqual(30);
      }
    });

    it('has reasonable uniqueness across 1000 generations', () => {
      const seen = new Set<string>();
      for (let i = 0; i < 1000; i++) {
        seen.add(generateNipHostnameToken());
      }
      expect(seen.size).toBeGreaterThan(800);
    });
  });

  describe('isValidNipHostnameToken', () => {
    it.each([
      ['clever-otter-7k', true],
      ['clever-otter-72', false],
      ['witty-badger-09', false],
      ['clever-otter-7', false],
      ['a', true],
      ['simple', true],
      ['Clever-Otter', false],
      ['clever_otter', false],
      ['clever otter', false],
      ['-clever', false],
      ['clever-', false],
      ['', false],
      ['a'.repeat(31), false],
    ])('isValidNipHostnameToken(%p) === %p', (token, expected) => {
      expect(isValidNipHostnameToken(token)).toBe(expected);
    });
  });
});
