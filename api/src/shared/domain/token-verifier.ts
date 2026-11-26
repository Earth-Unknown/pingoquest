export type AuthenticatedUser = {
  uid: string
  isAnonymous: boolean
}

export interface TokenVerifier {
  verify(idToken: string): Promise<AuthenticatedUser>
}
