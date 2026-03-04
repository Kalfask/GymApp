import { Link } from 'react-router-dom';
import { Dumbbell, Users, Activity, ArrowRight, Target, ShieldCheck, Zap } from 'lucide-react';

function Home() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-sky-500/30 overflow-x-hidden relative">
            
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-sky-600/10 rounded-full blur-[150px] pointer-events-none z-0"></div>
            <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none z-0"></div>

            {/* Navbar */}
            <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-tr from-sky-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/20 transform rotate-3">
                        <Dumbbell className="text-white w-6 h-6 -rotate-3" />
                    </div>
                    <span className="font-extrabold text-2xl tracking-wide text-white">GymApp</span>
                </div>
                <div className="flex items-center gap-4">
                    <Link to="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
                        Sign In
                    </Link>
                    <Link to="/register" className="text-sm bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold py-2 px-5 rounded-full transition-all">
                        Get Started
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32 flex flex-col items-center text-center">
                
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide uppercase mb-8">
                    <Zap className="w-3 h-3" />
                    The Ultimate Training Platform
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
                    Connect. Train. <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500">
                        Conquer Your Goals.
                    </span>
                </h1>
                
                <p className="max-w-2xl text-lg md:text-xl text-slate-400 mb-10 leading-relaxed">
                    Whether you are an elite coach looking to scale your business, or an athlete searching for the perfect custom program, GymApp bridges the gap.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <Link to="/register" className="group relative flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-bold py-4 px-8 rounded-full transition-all hover:shadow-xl hover:shadow-sky-500/30 active:scale-95 text-lg">
                        Join as an Athlete
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link to="/register" className="flex items-center justify-center gap-2 bg-slate-900/80 backdrop-blur-md border border-slate-700 hover:bg-slate-800 text-white font-bold py-4 px-8 rounded-full transition-all text-lg">
                        I am a Coach
                    </Link>
                </div>
            </main>

            {/* Feature Cards Grid */}
            <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    {/* Feature 1 */}
                    <div className="backdrop-blur-xl bg-slate-900/60 border border-slate-700/50 rounded-3xl p-8 hover:-translate-y-2 transition-transform duration-300">
                        <div className="w-14 h-14 bg-sky-500/10 rounded-2xl flex items-center justify-center mb-6 border border-sky-500/20">
                            <Target className="text-sky-400 w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Custom Programs</h3>
                        <p className="text-slate-400 leading-relaxed">
                            Athletes can request tailored workout plans based on their specific goals, fitness level, and available equipment.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="backdrop-blur-xl bg-slate-900/60 border border-slate-700/50 rounded-3xl p-8 hover:-translate-y-2 transition-transform duration-300">
                        <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/20">
                            <Users className="text-indigo-400 w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Client Management</h3>
                        <p className="text-slate-400 leading-relaxed">
                            Coaches get a powerful dashboard to manage their roster, assign PDF programs, and track client progress seamlessly.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="backdrop-blur-xl bg-slate-900/60 border border-slate-700/50 rounded-3xl p-8 hover:-translate-y-2 transition-transform duration-300">
                        <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/20">
                            <Activity className="text-purple-400 w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Gamified Tracking</h3>
                        <p className="text-slate-400 leading-relaxed">
                            Stay motivated with built-in stats tracking, workout completion streaks, and AI-powered form tips.
                        </p>
                    </div>

                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-slate-800/60 bg-slate-950/50 backdrop-blur-md py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Dumbbell className="text-slate-500 w-5 h-5" />
                        <span className="font-bold text-slate-400 tracking-wide">GymApp</span>
                    </div>
                    <p className="text-sm text-slate-500">© 2026 GymApp Platform. All rights reserved.</p>
                </div>
            </footer>

        </div>
    );
}

export default Home;