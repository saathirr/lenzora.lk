import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { HiLockClosed, HiEye, HiEyeOff, HiCheckCircle } from 'react-icons/hi'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [welcome, setWelcome] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const justRegistered = searchParams.get('registered') === 'true'

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) {
        setError(authError.message || 'Login failed. Please try again.')
        return
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()
      setSuccess(true)
      setWelcome(data.user?.user_metadata?.full_name || '')
      setLoading(false)
      setTimeout(() => {
        if (profile?.role === 'admin') {
          navigate('/admin')
        } else {
          navigate('/')
        }
      }, 2200)
    } catch (err) {
      setError(err?.message || 'An unexpected error occurred.')
      setLoading(false)
      return
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Enter your email address first.')
      return
    }
    setResetting(true)
    setError('')
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      })
      if (resetError) {
        setError(resetError.message || 'Failed to send reset email.')
        return
      }
      setResetSent(true)
    } catch (err) {
      setError(err?.message || 'An unexpected error occurred.')
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HiLockClosed className="text-primary" size={28} />
          </div>
          <h1 className="text-3xl font-bold text-dark">Welcome Back</h1>
          <p className="text-gray-500 mt-2">Sign in to your account</p>
        </div>

        {success && (
          <div className="bg-white border border-green-200 rounded-2xl p-8 shadow-xl text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiCheckCircle className="text-green-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-dark mb-2">Welcome back, {welcome.split(' ')[0] || 'friend'}! 👋</h2>
            <p className="text-green-600 font-semibold mb-1">Login successful!</p>
            <p className="text-gray-500 text-sm">Redirecting you to your dashboard...</p>
          </div>
        )}

        {!success && justRegistered && (
          <div className="p-3 mb-6 bg-green-50 text-green-700 text-sm rounded-xl border border-green-200 flex items-center gap-2">
            <HiCheckCircle size={18} className="shrink-0" />
            <span>Welcome to Lenzora! Registration successful. Please sign in to continue.</span>
          </div>
        )}

        {resetSent ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-xl text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiLockClosed className="text-green-600" size={28} />
            </div>
            <h2 className="text-xl font-bold text-dark mb-2">Check Your Email</h2>
            <p className="text-gray-500 text-sm">
              Password reset link has been sent to <strong>{email}</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleLogin} className={`bg-white border border-gray-100 rounded-2xl p-8 shadow-xl space-y-4 ${success ? 'hidden' : ''}`}>
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-200">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={resetting}
                className="text-sm text-primary font-semibold hover:underline"
              >
                {resetting ? 'Sending...' : 'Forgot Password?'}
              </button>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary-dark transition shadow-lg shadow-primary/25 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-semibold hover:underline">
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
