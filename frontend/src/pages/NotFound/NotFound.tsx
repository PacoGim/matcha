import { useNavigate } from 'react-router-dom';
import './NotFound.css';

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div id="notfound-page">
            <h1>404</h1>
            <p>Page not found</p>
            <button onClick={() => navigate('/')}>
                Go back home
            </button>
        </div>
    );
}
