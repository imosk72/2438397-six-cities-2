import {createHmac} from 'node:crypto';

export function createSHA256Hash(line: string, salt?: string): string {
  const shaHasher = createHmac('sha256', salt || '');
  return shaHasher.update(line).digest('hex');
}
