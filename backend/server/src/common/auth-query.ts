export function isAuthQuery(auth?: string): boolean {
  return auth === '1' || auth === 'true';
}

export function authRedirectSuffix(auth?: string): string {
  return isAuthQuery(auth) ? '?auth=1' : '';
}
