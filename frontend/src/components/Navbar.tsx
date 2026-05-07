
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();

    const handleLogout = async () => {
        try {
            const endpoint_logout = `${process.env.REACT_APP_BACKEND_ORIGIN || window.location.origin}/user/logout`
            await fetch(endpoint_logout, {
                method: 'POST',
                credentials: 'include',
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            logout();
            navigate('/');
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-brand">
                    Matcha
                </Link>
                <ul className="navbar-list">
                    <li className="navbar-item">
                        <Link
                            to="/"
                            className={`navbar-link ${location.pathname === '/' || location.pathname === '/home' ? 'active' : ''}`}
                        >
                            Home
                        </Link>
                    </li>
                    <li className="navbar-item">
                        <Link
                            to="/about"
                            className={`navbar-link ${location.pathname === '/about' ? 'active' : ''}`}
                        >
                            About
                        </Link>
                    </li>
                    {!isAuthenticated ? (
                        <>
                            <li className="navbar-item">
                                <Link
                                    to="/register"
                                    className={`navbar-link ${location.pathname === '/register' ? 'active' : ''}`}
                                >
                                    Register
                                </Link>
                            </li>
                            <li className="navbar-item">
                                <Link
                                    to="/login"
                                    className={`navbar-link ${location.pathname === '/login' ? 'active' : ''}`}
                                >
                                    Login
                                </Link>
                            </li>
                        </>
                    ) : (
                        <>
                            <li className="navbar-item">
                                <Link
                                    to="/profile"
                                    className={`navbar-link ${location.pathname === '/profile' ? 'active' : ''}`}
                                >
                                    Profile
                                </Link>
                            </li>
                            <li className="navbar-item">
                                <span className="navbar-user">
                                    Welcome, {user?.username}
                                </span>
                            </li>
                            <li className="navbar-item">
                                <button onClick={handleLogout} className="navbar-logout">
                                    Logout
                                </button>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
}

export default Navbar;


