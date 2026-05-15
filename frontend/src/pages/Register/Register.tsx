import { useEffect, useState } from 'react'
// @ts-ignore
import './Register.css'
import Navbar from '../../components/Navbar'
import { validateUsername, getValidationRulesDescription } from '../../validators/usernameValidator'
import { validateName, getValidationRulesDescription as getNameValidationRulesDescription } from '../../validators/nameValidator'
import { validatePassword, getValidationRulesDescription as getPasswordValidationRulesDescription } from '../../validators/passwordValidator'
import { validateBirthdate, getValidationRulesDescription as getBirthValidationRulesDescription } from '../../validators/birthdateValidator'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import type { FieldErrorType } from '../../../../interfaces/FieldError.type'
import { api } from "../../api/routes"

export default function Register() {
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        first_name: '',
        last_name: '',
        birthdate: ''
    })
    const [message, setMessage] = useState<string>('')
    const [error, setError] = useState<string>('')
    const [fieldErrors, setFieldErrors] = useState<FieldErrorType>({})
    const [loading, setLoading] = useState<boolean>(false)
    const { isAuthenticated } = useAuth()
    const navigate = useNavigate()

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

        // Clear field error when user starts typing
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError('')
        setMessage('')
        setFieldErrors({})
        setLoading(true)

        // Accumulate all errors
        const newErrors: FieldErrorType = {}

        // Client-side validation for username
        const usernameError = validateUsername(formData.username)
        if (usernameError) {
            newErrors['username'] = usernameError.message
        }

        // Client-side validation for first_name
        const firstNameError = validateName(formData.first_name, 'first_name')
        if (firstNameError) {
            newErrors['first_name'] = firstNameError.message
        }

        // Client-side validation for last_name
        const lastNameError = validateName(formData.last_name, 'last_name')
        if (lastNameError) {
            newErrors['last_name'] = lastNameError.message
        }

        // Client-side validation for password
        const passwordError = validatePassword(formData.password)
        if (passwordError) {
            newErrors['password'] = passwordError.message
        }

        // Client-side validation for password
        const birthdateError = validateBirthdate(formData.birthdate)
        if (birthdateError) {
            newErrors['password'] = birthdateError.message
        }

        // If there are validation errors, show them all and stop
        if (Object.keys(newErrors).length > 0) {
            setFieldErrors(newErrors)
            setLoading(false)
            return
        }

        try {
            const response = await api.auth.register.fetch(formData)

            const data = await response.json()

            if (!response.ok) {
                // Handle field-specific errors from backend
                if (data.errors) {
                    setFieldErrors(data.errors)
                } else {
                    setError(data.error || 'Registration failed')
                }
                return
            }

            setMessage('Registration successful! Check your email to verify your account.')
            setFormData({
                email: '',
                username: '',
                password: '',
                first_name: '',
                last_name: '',
                birthdate: ''
            })
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Navbar />
            <div id="register-page">
                <div className="register-container">
                    <h1>Register</h1>
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
                            {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                            {fieldErrors.username && <span className="field-error">{fieldErrors.username}</span>}
                            <span className="field-help">{getValidationRulesDescription()}</span>
                        </div>

                        <div className="form-group">
                            <label htmlFor="first_name">First Name</label>
                            <input
                                type="text"
                                id="first_name"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                required
                            />
                            {fieldErrors.first_name && <span className="field-error">{fieldErrors.first_name}</span>}
                            <span className="field-help">{getNameValidationRulesDescription()}</span>
                        </div>

                        <div className="form-group">
                            <label htmlFor="last_name">Last Name</label>
                            <input
                                type="text"
                                id="last_name"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                required
                            />
                            {fieldErrors.last_name && <span className="field-error">{fieldErrors.last_name}</span>}
                            <span className="field-help">{getNameValidationRulesDescription()}</span>
                        </div>
                        <div className="form-group">
                            <label htmlFor="birthdate">Birthdate</label>
                            <input
                                type="date"
                                id="birthdate"
                                name="birthdate"
                                value={formData.birthdate}
                                onChange={handleChange}
                                required
                            />
                            {fieldErrors.birthdate && <span className="field-error">{fieldErrors.birthdate}</span>}
                            <span className="field-help">{getBirthValidationRulesDescription()}</span>
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
                            {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
                            <span className="field-help">{getPasswordValidationRulesDescription()}</span>
                        </div>

                        <button type="submit" disabled={loading}>
                            {loading ? 'Registering...' : 'Register'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    )
}
