export type BackendRole = 'GATE_CLERK' | 'EXECUTIVE' | 'ADMIN'
export type FrontendRole = 'STAFF' | 'EXEC'

export interface User {
  user_id: string
  username: string
  first_name: string
  last_name: string
  role: BackendRole
}

export interface LoginResponse {
  success: boolean
  message: string
  token: string
  user: User
}

export interface LoginResult {
  success: boolean
  user: User
  frontendRole: FrontendRole
}

export interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (username: string, password: string) => Promise<LoginResult>
  logout: () => void
}