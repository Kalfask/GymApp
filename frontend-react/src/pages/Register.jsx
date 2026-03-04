import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Dumbbell, AlertCircle, Loader2, User, Phone } from 'lucide-react';
import { register } from '../api';

function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        console.log("1. Button clicked, starting registration...");

        try {
            console.log("2. Sending request to backend...");
            const result = await register(email, password, name, phone);
            
            console.log("3. Backend responded with:", result);
            
            // Catching standard error responses
            if (result.error) {
                 setError(result.error);
            } else if (result.message && result.message.toLowerCase().includes('already exists')) {
                 setError(result.message);
            } else if (result.message && !result.message.toLowerCase().includes('success') && !result.token) {
                 // Catches generic error messages that don't say "success" or return a token
                 setError(result.message);
            } else {
                console.log("4. Registration successful! Navigating to login...");
                navigate('/login');
                return; // Stop here so we don't flash the spinner off while navigating
            }
        } catch (err) {
            console.error("Fetch Error:", err);
            setError('Connection error. Is your backend server running?');
        }
        
        console.log("5. Stopping loading spinner.");
        setLoading(false);
    };

    return (
        // Changed to min-h-screen so it naturally fills the page without forcing a fixed cut-off
        <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4 relative overflow-x-hidden font-sans">
            
            {/* Background Ambient Glows */}
            <div className="absolute top-0 left-[-10%] w-96 h-96 bg-sky-600/20 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 right-[-10%] w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>

            {/* Main Glass Card: Removed max-h and overflow, tightened padding to p-6/sm:p-8 */}
            <div className="relative w-full max-w-md backdrop-blur-xl bg-slate-900/60 border border-slate-700/50 p-6 sm:p-8 rounded-3xl shadow-2xl z-10">
                
                {/* Header Section: Tightened margins and slightly smaller icon */}
                <div className="flex flex-col items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-tr from-sky-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-sky-500/25 transform rotate-3">
                        <Dumbbell className="text-white w-6 h-6 -rotate-3" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-1">
                        Join GymApp
                    </h1>
                    <p className="text-slate-400 text-xs">Create your account to get started</p>
                </div>

                {/* Error Banner: Made slightly more compact */}
                {error && (
                    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2.5 rounded-xl mb-5 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    
                    {/* Full Name Input */}
                    <div className="mb-4">
                        <label className="block text-xs font-medium text-slate-300 pl-1 mb-1">Full Name</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <User className="h-4 w-4 text-slate-500" />
                            </div>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all duration-200"
                                placeholder="John Doe"
                                required
                            />
                        </div>
                    </div>

                    {/* Email Input */}
                    <div className="mb-4">
                        <label className="block text-xs font-medium text-slate-300 pl-1 mb-1">Email Address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Mail className="h-4 w-4 text-slate-500" />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all duration-200"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                    </div>

                    {/* Phone Input */}
                    <div className="mb-4">
                        <label className="block text-xs font-medium text-slate-300 pl-1 mb-1">Phone Number</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Phone className="h-4 w-4 text-slate-500" />
                            </div>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all duration-200"
                                placeholder="+1 (555) 000-0000"
                                required
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="mb-5">
                        <label className="block text-xs font-medium text-slate-300 pl-1 mb-1">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Lock className="h-4 w-4 text-slate-500" />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all duration-200"
                                placeholder="••••••••"
                                required
                                minLength="6"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full relative group flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-sky-500/30 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:active:scale-100"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm">Creating account...</span>
                            </>
                        ) : (
                            <span className="text-sm">Create Account</span>
                        )}
                    </button>
                </form>

                {/* Footer Link */}
                <div className="mt-6 text-center text-xs text-slate-400">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-sky-400 hover:text-sky-300 transition-colors">
                        Sign in instead
                    </Link>
                </div>

            </div>
        </div>
    );
}

export default Register;