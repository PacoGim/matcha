import { Link, useLocation } from 'react-router-dom';


export default function Navitem(props: any) {
    const location = useLocation();
    return (
        <li className="navbar-item">
            <Link
                to={props.to}
                className={`navbar-link ${location.pathname === props.to ? 'active' : ''}`}
            >
                {props.name}
            </Link>
        </li>
    )
}
