
import { Link, useNavigate } from 'react-router-dom'
import './Navbar.css'
import { useAuth } from '../contexts/AuthContext'
import Navitem from './Navitem'
import handleLogout from '../functions/handleLogout.fn'

function Navbar() {
    const { user, isAuthenticated, logout } = useAuth()

    const paths = [
        {
            to: '/',
            name: 'Home'
        },
        {
            to: '/about',
            name: 'About'
        }
    ]

    const privatePaths = [
        ...paths,
        {
            to: '/search',
            name: 'Search'
        },
        {
            to: '/profile',
            name: 'Profile'
        }
    ]

    const publicPaths = [
        ...paths,
        {
            to: '/register',
            name: 'Register'
        },
        {
            to: '/login',
            name: 'Login'
        }
    ]

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
                                        <button onClick={() => handleLogout(logout)} className="navbar-logout">
                                            Logout
                                        </button>
                                    </li>
                                </>
                            )
                            :
                            (<>
                                {publicPaths.map((route, idx) => <Navitem key={idx} to={route.to} name={route.name} />)}

                            </>)
                    }


                </ul>
            </div>
        </nav>
    )
}

export default Navbar;


