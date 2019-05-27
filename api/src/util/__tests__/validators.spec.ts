import expect from 'expect';
import { validUsername } from '../validators';

describe('validUsername', () => {
  it('returns true for valid names', () => {
    expect(validUsername('abc')).toEqual(true);
    expect(validUsername('ABC')).toEqual(true);
    expect(validUsername('123')).toEqual(true);
  });

  it('does not allow empty string', () => {
    expect(validUsername('')).toEqual(false);
  });

  it('does not allow spaces', () => {
    expect(validUsername('a b c')).toEqual(false);
  });

  it('does not allow non-alphanumeric characters', () => {
    expect(validUsername('abc😀def')).toEqual(false);
  });

  it('does not allow names over 16 characters', () => {
    expect(validUsername('1234567890123456')).toEqual(true);
    expect(validUsername('12345678901234567')).toEqual(false);
  });
});
