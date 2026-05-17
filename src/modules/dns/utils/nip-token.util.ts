import { randomBytes } from 'node:crypto';

const ADJECTIVES = [
  'clever',
  'silent',
  'cosmic',
  'gentle',
  'brave',
  'swift',
  'mellow',
  'sunny',
  'lucky',
  'witty',
  'breezy',
  'cheerful',
  'eager',
  'fancy',
  'jolly',
  'kind',
  'lively',
  'merry',
  'noble',
  'plucky',
  'quiet',
  'royal',
  'shiny',
  'tidy',
  'vivid',
  'warm',
  'zesty',
  'amber',
  'cobalt',
  'jade',
];

const NOUNS = [
  'otter',
  'panda',
  'falcon',
  'mole',
  'lynx',
  'badger',
  'heron',
  'koala',
  'puffin',
  'gecko',
  'beaver',
  'meerkat',
  'narwhal',
  'oryx',
  'quokka',
  'raven',
  'sparrow',
  'tapir',
  'urchin',
  'vole',
  'walrus',
  'yak',
  'zebra',
  'finch',
  'marmot',
  'newt',
  'owl',
  'pika',
  'robin',
  'seal',
];

const TOKEN_REGEX = /^[a-z0-9-]+$/;
const TOKEN_MAX_LENGTH = 30;

// nip.io extracts the IPv4 from the rightmost numeric labels of the FQDN.
// A token whose trailing chunk is purely digits collides with that scan and
// the IP gets mis-parsed (e.g. `royal-gecko-72.162.55.56.10.nip.io` resolves
// to `72.162.55.56`). Forcing a letter at the tail prevents the collision.
function randomLowerLetter(): string {
  const buf = randomBytes(1);
  return String.fromCodePoint(97 + (buf[0] % 26));
}

export function generateNipHostnameToken(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const suffix = randomLowerLetter() + randomLowerLetter();
  return `${adj}-${noun}-${suffix}`;
}

export function isValidNipHostnameToken(token: string): boolean {
  return (
    typeof token === 'string' &&
    token.length > 0 &&
    token.length <= TOKEN_MAX_LENGTH &&
    TOKEN_REGEX.test(token) &&
    !token.startsWith('-') &&
    !token.endsWith('-') &&
    !/\d$/.test(token)
  );
}
