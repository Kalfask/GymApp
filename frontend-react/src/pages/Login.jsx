import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Dumbbell, AlertCircle, Loader2 } from 'lucide-react';
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
                
                if (result.member.role === 'coach') {
                    navigate('/coach');
                } else {
                    navigate('/athlete');
                }
            } else {
                setError(result.message || 'Invalid credentials. Please try again.');
            }
        } catch (err) {
            setError('Connection error. Please check your network.');
        }
        
        setLoading(false);
    };

    return (
        // Full screen wrapper with deep dark background and hidden overflow
        <div className="fixed inset-0 bg-slate-950 flex items-center justify-center p-4 overflow-hidden font-sans z-50">
            
            {/* Background Ambient Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-sky-600/20 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>

            {/* Main Glass Card */}
            <div className="relative w-full max-w-md backdrop-blur-xl bg-slate-900/60 border border-slate-700/50 p-8 sm:p-10 rounded-3xl shadow-2xl z-10">
                
                {/* Header Section */}
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 bg-gradient-to-tr from-sky-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-sky-500/25 transform rotate-3">
                        <Dumbbell className="text-white w-8 h-8 -rotate-3" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-2">
                        GymApp
                    </h1>
                    <p className="text-slate-400 text-sm">Sign in to continue your fitness journey</p>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* Email Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 pl-1">Email Address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-slate-500" />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all duration-200"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between pl-1">
                            <label className="text-sm font-medium text-slate-300">Password</label>
                            {/* Optional: Add a forgot password link here in the future */}
                            <a href="#" className="text-xs text-sky-400 hover:text-sky-300 transition-colors">Forgot?</a>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-slate-500" />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all duration-200"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full relative group mt-8 flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-sky-500/30 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:active:scale-100"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Authenticating...</span>
                            </>
                        ) : (
                            <span>Sign In</span>
                        )}
                    </button>
                </form>

                {/* Footer Link */}
                <div className="mt-8 text-center text-sm text-slate-400">
                    Don't have an account yet?{' '}
                    <Link to="/register" className="font-semibold text-sky-400 hover:text-sky-300 transition-colors">
                        Create one now
                    </Link>
                </div>

            </div>
        </div>
    );
}

export default Login;