import './App.css';
import Home from './pages/Home/Home';
import About from './pages/About/About';
import Register from './pages/Register/Register';
import CheckEmail from './pages/CheckEmail/CheckEmail';
import Login from './pages/Login/Login';
import ResetPassword from './pages/ResetPassword/ResetPassword';
import Profile from './pages/Profile/Profile';
import Search from './pages/Search/Search';
import NotFound from './pages/NotFound/NotFound';
import { AuthProvider } from './contexts/AuthContext';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/verify-email" element={<CheckEmail />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
