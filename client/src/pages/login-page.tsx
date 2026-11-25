import { AuthShell } from '@/layouts/auth-shell'
import { AuthCard } from '@/components/organisms/auth-card'
import { TextInput } from '@/components/ui/text-input'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { useState, type FormEvent, type KeyboardEvent } from 'react'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

type BackendRole = 'GATE_CLERK' | 'EXECUTIVE' | 'ADMIN'
type FrontendRole = 'STAFF' | 'EXEC'

// Maps backend roles to frontend roles
const mapRole = (backendRole: BackendRole): FrontendRole => {
  return (backendRole === 'EXECUTIVE' || backendRole === 'ADMIN') ? 'EXEC' : 'STAFF'
}

export function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!username.trim() || !password) {
      setError('Please enter both username and password')
      return
    }

    setLoading(true)

    try {
      const response = await axios.post<{ success: boolean; message: string; token: string; user: { role: BackendRole } }>(`${API_BASE_URL}/auth/login`, {
        username: username.trim(),
        password
      })

      if (response.data.success) {
        const { token, user } = response.data
        localStorage.setItem('auth_token', token)

        // Map backend role to frontend role for redirect
        const frontendRole = mapRole(user.role)
        if (frontendRole === 'EXEC') {
          window.location.href = '/dashboard'
        } else {
          window.location.href = '/waybills'
        }
      } else {
        setError(response.data.message || 'Login failed')
      }
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError('Invalid credentials. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleSubmit(e as FormEvent)
    }
  }

  return (
    <AuthShell>
      <AuthCard
        title="Login"
        subtitle="Login as staff"
        titleIcon="Ship"
        infoContent={
          <div className="text-xs text-white/60">
            Use your assigned credentials to access the portal.
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5" onKeyDown={handleKeyDown}>
          <TextInput
            label="Username"
            variant="auth"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter Staff User Name"
            autoComplete="username"
            error={error}
            disabled={loading}
            onKeyDown={handleKeyDown}
          />

          <TextInput
            label="Password"
            variant="auth"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter Password"
            autoComplete="current-password"
            disabled={loading}
            onKeyDown={handleKeyDown}
          >
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-textMuted hover:text-white transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <Icon name={showPassword ? 'EyeOff' : 'Eye'} size="md" aria-hidden="true" />
            </button>
          </TextInput>

          <p className="text-sm text-white/60 text-center">
            Forgot password? Contact administrator
          </p>

          {error && (
            <div className="p-3 bg-error/20 border border-error rounded-[var(--radius-control)] text-sm text-error" role="alert">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="full-width"
            loading={loading}
            disabled={loading}
          >
            Sign In
          </Button>
        </form>
      </AuthCard>
    </AuthShell>
  )
}