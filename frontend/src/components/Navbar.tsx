
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { useAuth } from '../contexts/AuthContext';
import Navitem from './Navitem';

function Navbar() {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();

    const privatePaths = [
        {
            to: '/search',
            name: 'Search'
        }
    ]

    const publicPaths = [
        {
            to: '/',
            name: 'Home'
        },
        {
            to: '/about',
            name: 'About'
        },
        {
            to: '/register',
            name: 'Register'
        },
        {
            to: '/login',
            name: 'Login'
        }
    ]

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
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-brand">
                    Matcha
                </Link>
                <ul className="navbar-list">

                    {
                        isAuthenticated ?
                            (
                                <>
                                    {privatePaths.map((route, idx) => <Navitem key={idx} to={route.to} name={route.name} />)}
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
                            )
                            :
                            (
                                <>
                                    {publicPaths.map((route, idx) => <Navitem key={idx} to={route.to} name={route.name} />)}
                                </>
                            )
                    }
                </ul>
            </div>
        </nav>
    );
}

export default Navbar;


