// got this from stack overflow, iunno
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validEmail(email: string): boolean {
  return !!email.match(emailRe);
}

export function validUsername(username: string): boolean {
  // TODO: further validation here, probably
  return !username.match(/\s/);
}
