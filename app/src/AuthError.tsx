import type { AuthFailure } from './lib/auth'

export type AuthErrorInfo = Extract<AuthFailure, { kind: 'error' }>

export function AuthError({ failure }: { failure: AuthErrorInfo }) {
  return (
    <div className="lg-err" role="alert">
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3 2 20h20L12 3z" /><path d="M12 10v4M12 17.5v.01" />
      </svg>
      <div>
        <p>{failure.message}</p>
        {failure.code && <small>{failure.code}</small>}
      </div>
    </div>
  )
}
