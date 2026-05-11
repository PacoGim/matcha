import './Home.css'
import Navbar from '../../components/Navbar'

export default function Home() {
    return (
        <div id="home-page">
            <Navbar />
            <div className="home-inner">
                <h1>Connect with your next meaningful match</h1>
                <p>Matcha blends intentional discovery with local community energy. Update your profile, review favorites, and keep your location in sync for better matches.</p>
            </div>
        </div>
    )
}