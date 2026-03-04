import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login(email, password);
            
            if (result.token) {
                localStorage.setItem('authToken', result.token);
                localStorage.setItem('user', JSON.stringify(result.member));
                
                // Redirect based on role
                if (result.member.role === 'coach') {
                    navigate('/coach');
                } else {
                    navigate('/athlete');
                }
            } else {
                setError(result.message || 'Login failed');
            }
        } catch (err) {
            setError('Connection error. Try again.');
        }
        
        setLoading(false);
    };

    return (
        <div className="flex-1 bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md">
                
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-sky-400 mb-2">🏋️ GymApp</h1>
                    <p className="text-slate-400">Welcome back!</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}


                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-slate-300 mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-sky-400 transition"
                            placeholder="you@email.com"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-slate-300 mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-sky-400 transition"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-sky-500 hover:bg-sky-400 text-slate-900 font-bold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Logging in...' : '🔐 Login'}
                    </button>
                </form>

                {/* Register Link */}
                <p className="text-center text-slate-400 mt-6">
                    Don't have an account?{' '}
                    <a href="/register" className="text-sky-400 hover:text-sky-300 transition">
                        Register here
                    </a>
                </p>
            </div>
        </div>
    );
}

export default Login;