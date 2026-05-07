import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './CheckEmail.css';
import Navbar from '../../components/Navbar';

export default function CheckEmail() {
    const [message, setMessage] = useState('Verifying your email...');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const verifyToken = async () => {
            const token = searchParams.get('token');

            if (!token) {
                setError('No verification token provided');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch('http://10.171.62.221:3000/user/check-email-token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Token verification failed');
                }

                setMessage('Email verified successfully! Redirecting to login...');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);

            } catch (err) {
                setError(err instanceof Error ? err.message : 'Verification failed');
            } finally {
                setLoading(false);
            }
        };

        verifyToken();
    }, [searchParams, navigate]);

    return (
        <div id="check-email-page">
            <Navbar />
            <div className="check-email-container">
                <h1>Email Verification</h1>
                {loading && <div className="loading-spinner"></div>}
                {message && !error && <div className="success-message">{message}</div>}
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
