import expect from 'expect';
import { validUsernameCharacters, validUsernameLength } from '../validators';

describe('validUsernameCharacters', () => {
  it('returns true for valid names', () => {
    expect(validUsernameCharacters('abc')).toEqual(true);
    expect(validUsernameCharacters('ABC')).toEqual(true);
    expect(validUsernameCharacters('123')).toEqual(true);
  });

  it('does not allow empty string', () => {
    expect(validUsernameCharacters('')).toEqual(false);
  });

  it('does not allow spaces', () => {
    expect(validUsernameCharacters('a b c')).toEqual(false);
  });

  it('does not allow non-alphanumeric characters', () => {
    expect(validUsernameCharacters('abc😀def')).toEqual(false);
  });
});

describe('validUsernameLength', () => {
  it('does not allow names over 16 characters', () => {
    expect(validUsernameLength('1234567890123456')).toEqual(true);
    expect(validUsernameLength('12345678901234567')).toEqual(false);
  });
});
