import './About.css'
import Navbar from '../../components/Navbar'

export default function About() {
    return (
        <div id="about-page">
            <Navbar />
            <div className="about-inner">
                <h1>About Matcha</h1>
                <p>Matcha is built for curated social discovery and mindful connections. We help you express your interests, preferences, and location with a clean, calm interface.</p>
            </div>
        </div>
    )
}