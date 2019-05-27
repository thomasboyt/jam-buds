// got this from stack overflow, iunno
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validEmail(email: string): boolean {
  return !!email.match(emailRe);
}

export function validUsername(username: string): boolean {
  return !!username.match(/^[a-zA-Z0-9_]+$/) && username.length <= 16;
}
