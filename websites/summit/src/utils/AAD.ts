/**
 * Explicitly check if variable is of type AccountInfo
 * @param arg
 */
export function isAccountInfo(arg: any): boolean {
  return arg
    && typeof arg.homeAccountId === 'string'
    && typeof arg.environment === 'string'
    && typeof arg.tenantId === 'string'
    && typeof arg.username === 'string'
    && typeof arg.localAccountId === 'string'
    && (!arg.name || (arg.name && typeof arg.name === 'string'))
    && (!arg.idTokenClaims || (arg.idTokenClaims && typeof arg.idTokenClaims === 'object'))
}
