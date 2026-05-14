import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
//@ts-ignore
import './CheckEmail.css';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../contexts/AuthContext';

export default function CheckEmail() {
    const [message, setMessage] = useState<string>('Verifying your email...');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { logout } = useAuth()

    useEffect(() => {
        const verifyToken = async () => {
            const token = searchParams.get('token');

            if (!token) {
                setError('No verification token provided');
                setLoading(false);
                return;
            }

            try {
                const endpoint_check_email = `${process.env.REACT_APP_BACKEND_ORIGIN || window.location.origin}/user/check-email-token`
                const response = await fetch(endpoint_check_email, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token }),
                });

                // const data = await response.json();
                if (response.ok === false) {
                    return logout("Token verification failed");
                }

                setMessage('Email verified successfully! Redirecting to login...');
                setTimeout(() => {
                    localStorage.setItem('firstLogin', 'true');
                    navigate('/login');
                }, 1000);

            } catch (err) {
                setError(err instanceof Error ? err.message : 'Verification failed');
            } finally {
                setLoading(false);
            }
        };

        verifyToken();
    }, [searchParams, navigate, logout]);

    return (
        <div id="check-email-page">
            <Navbar />
            <div className="check-email-container">
                <h1>Email Verification</h1>
                {loading && <div className="loading-spinner"></div>}
                {message && !error && <div className="info-message">{message}</div>}
                {error && <div className="error-message">{error}</div>}
                {!loading && error && (
                    <button onClick={() => navigate('/register')} className="retry-button">
                        Try registering again
                    </button>
                )}
            </div>
        </div>
    );
}
