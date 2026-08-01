import { shuffleString } from '@/utils/random';

interface TokenOptions {
  withUppercase?: boolean
  withLowercase?: boolean
  withNumbers?: boolean
  withSymbols?: boolean
  deniedChars?: string
  length?: number
  alphabet?: string
}

export const MAX_TOKEN_COUNT = 100;

export function createToken({
  withUppercase = true,
  withLowercase = true,
  withNumbers = true,
  withSymbols = false,
  deniedChars = '',
  length = 64,
  alphabet,
}: TokenOptions) {
  const allAlphabet = (alphabet ?? (
    (withUppercase ? 'ABCDEFGHIJKLMOPQRSTUVWXYZ' : '')
    + (withLowercase ? 'abcdefghijklmopqrstuvwxyz' : '')
    + (withNumbers ? '0123456789' : '')
    + (withSymbols ? '.,;:!?./-"\'#{([-|\\@)]=}*+' : '')
  )).split('').filter(c => !(deniedChars?.includes(c))).join('');

  const len = length < 1 ? 1 : length;
  return shuffleString(allAlphabet.repeat(len)).substring(0, len);
}

export function createTokens({ count = 1, ...tokenOptions }: TokenOptions & { count?: number }) {
  const safeCount = Number.isFinite(count)
    ? Math.min(MAX_TOKEN_COUNT, Math.max(1, Math.floor(count)))
    : 1;

  return Array.from({ length: safeCount }, () => createToken(tokenOptions)).join('\n');
}
