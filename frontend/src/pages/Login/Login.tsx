import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
//@ts-ignore
import './Login.css'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../contexts/AuthContext'

export default function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [message, setMessage] = useState<string>('')
    const [error, setError] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const navigate = useNavigate()
    const { login, isAuthenticated } = useAuth()

    useEffect(() => {
        if (isAuthenticated === true) {
            navigate('/')
        }
    }, [isAuthenticated, navigate])

    if (isAuthenticated === true) return null

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError('')
        setMessage('')
        setLoading(true)

        try {
            const endpoint_login = `/api/user/login`

            const response = await fetch(endpoint_login, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })


            if (!response.ok) {
                throw new Error('Login failed')
            }
            const data = await response.json()

            // Store authenticated user in context; JWT is kept in an HttpOnly cookie
            login(data.user)

            setMessage('Login successful! Welcome back.')
            setTimeout(() => {
                if (localStorage.getItem('firstLogin')) {
                    localStorage.removeItem('firstLogin')
                    navigate('/profile')
                } else {
                    navigate('/')
                }
            }, 1000)

        } catch (err) {

            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    const handleForgotPassword = async () => {
        const response = await fetch(`/api/user/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: formData.email }),
        })

        const data = await response.json()
        if (!response.ok) {
            setError(data.error || 'Failed to send reset link')
        } else {
            setMessage('If an account with that email exists, a reset link has been sent.')
            setFormData(prev => ({
                ...prev,
                email: ''
            }))
        }

    }

    return (
        <>
            <Navbar />
            <div id="login-page">
                <div className="login-container">
                    <h1>Login</h1>
                    {message && <div className="success-message">{message}</div>}
                    {error && <div className="error-message">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="register-link">
                            <p>Forgot your password? <button type="button" className="link-button" onClick={() => handleForgotPassword()}>Reset it here</button></p>
                        </div>
                        <button type="submit" disabled={loading}>
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>

                    <div className="register-link">
                        <p>Don't have an account? <button type="button" className="link-button" onClick={() => navigate('/register')}>Register here</button></p>
                    </div>
                </div>
            </div>
        </>
    )
}
