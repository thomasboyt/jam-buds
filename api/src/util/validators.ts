// got this from stack overflow, iunno
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validEmail(email: string): boolean {
  return !!email.match(emailRe);
}

export function validUsernameCharacters(username: string): boolean {
  return !!username.match(/^[a-zA-Z0-9_]+$/);
}

export function validUsernameLength(username: string): boolean {
  return username.length <= 16;
}
