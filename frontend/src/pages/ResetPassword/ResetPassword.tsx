import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
// @ts-ignore
import './ResetPassword.css';
import Navbar from '../../components/Navbar';
import { validatePassword } from '../../validators/passwordValidator';
import { api, apiFetch } from '../../api/routes';

export default function ResetPassword() {
    const [newPassword, setNewPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        const passwordError = validatePassword(newPassword);
        if (passwordError?.message) {
            setError(passwordError.message);
            setLoading(false);
            return;
        }

        try {
            let response
            if (token) {
                response = await api.user.forgotPassword.fetch({token, new_password:newPassword})
            } else {
                response = await api.user.changePassword.fetch({new_password:newPassword})
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to reset password');
            }

            setMessage('Password reset successfully! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div id="reset-password-page">
                <div className="reset-password-container">
                    <h1>Reset Password</h1>
                    {message && <div className="success-message">{message}</div>}
                    {error && <div className="error-message">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="newPassword">New Password</label>
                            <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" disabled={loading}>
                            {loading ? 'Resetting Password...' : 'Reset Password'}
                        </button>
                    </form>
                    <div className="login-link">
                        <p>Remember your password? <button type="button" className="link-button" onClick={() => navigate('/login')}>Login here</button></p>
                    </div>
                </div>
            </div>
        </>
    );
}
