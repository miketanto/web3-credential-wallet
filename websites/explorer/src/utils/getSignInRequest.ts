export interface SignInRequest {
  extraQueryParameters: { domain_hint: 'illinois.edu' }, // auto select based on domain
  redirectStartPage: string,
  scopes: string[],
}

export default function getSignInRequest(): SignInRequest {
  return {
    extraQueryParameters: { domain_hint: 'illinois.edu' },
    // prompt: 'select_account',
    redirectStartPage: window.location.href,
    scopes: ['openid', 'profile', 'user.read'],
    // sid: 1, // select account id automatically (use domain_hint instead)
  }
}
