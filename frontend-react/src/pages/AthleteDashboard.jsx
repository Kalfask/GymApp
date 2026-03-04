import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Dumbbell, LogOut, Trophy, Activity, 
    Flame, Download, MessageSquare, PlayCircle, X, Loader2
} from 'lucide-react';
import { 
    getCurrentUser, logout, getProgram, 
    getStats, completeWorkout, requestProgram, downloadProgram 
} from '../api';

function AthleteDashboard() {
    const [user, setUser] = useState(null);
    const [program, setProgram] = useState(null);
    const [stats, setStats] = useState({ workoutsCompleted: 0, points: 0 });
    const [loading, setLoading] = useState(true);
    
    // Modal States
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [requestForm, setRequestForm] = useState({ goal: '', level: 'beginner' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const navigate = useNavigate();

   useEffect(() => {
        const currentUser = getCurrentUser();
        if (!currentUser || currentUser.role !== 'athlete') {
            navigate('/login');
            return;
        }
        setUser(currentUser);

        const fetchDashboardData = async () => {
            try {
                // We define programData here...
                const [programData, statsData] = await Promise.all([
                    getProgram(currentUser.id).catch(() => null),
                    getStats(currentUser.id).catch(() => ({ workoutsCompleted: 0, points: 0 }))
                ]);
                
                // ...and we check programData right here!
                if (programData && programData.program) {
                    setProgram(programData.program);
                }
                
                if (statsData && !statsData.error) {
                    setStats(statsData);
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [navigate]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleCompleteWorkout = async () => {
        try {
            await completeWorkout(user.id);
            setStats(prev => ({
                ...prev,
                workoutsCompleted: prev.workoutsCompleted + 1,
                points: prev.points + 50
            }));
            alert("Workout completed! +50 Points! 🎉");
        } catch (error) {
            alert("Failed to log workout.");
        }
    };

    const handleDownloadProgram = async () => {
        if (!user) return;
        await downloadProgram(user.id);
    };

    const submitProgramRequest = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await requestProgram(user.id, requestForm.goal, requestForm.level);
            alert("Program requested successfully! Your coach will review it soon.");
            setShowRequestModal(false);
            setRequestForm({ goal: '', level: 'beginner' }); // Reset form
        } catch (error) {
            alert("Failed to send request. Please try again.");
        }
        setIsSubmitting(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="text-sky-500 w-10 h-10 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans relative overflow-x-hidden">
            
            {/* Background Ambient Glows */}
            <div className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] bg-sky-600/10 rounded-full blur-[150px] pointer-events-none z-0"></div>
            <div className="fixed bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none z-0"></div>

            {/* Top Navigation */}
            <nav className="relative z-10 backdrop-blur-md bg-slate-900/50 border-b border-slate-800 sticky top-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-tr from-sky-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-sky-500/20">
                                <Dumbbell className="text-white w-5 h-5" />
                            </div>
                            <span className="font-bold text-lg tracking-wide text-white">GymApp</span>
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                
                {/* Welcome Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                            Welcome back, {user?.name?.split(' ')[0] || 'Athlete'}!
                        </h1>
                        <p className="text-slate-400 mt-1">Ready to crush your goals today?</p>
                    </div>
                    
                    <div className="flex gap-3">
                        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2 flex items-center gap-3 backdrop-blur-sm">
                            <Flame className="text-orange-400 w-5 h-5" />
                            <div>
                                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Workouts</p>
                                <p className="text-sm font-bold leading-none">{stats?.workoutsCompleted || 0}</p>
                            </div>
                        </div>
                        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2 flex items-center gap-3 backdrop-blur-sm">
                            <Trophy className="text-yellow-400 w-5 h-5" />
                            <div>
                                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Points</p>
                                <p className="text-sm font-bold leading-none">{stats?.points || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left Column: Current Program */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="backdrop-blur-xl bg-slate-900/60 border border-slate-700/50 rounded-3xl p-6 shadow-xl">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Activity className="text-sky-400 w-5 h-5" />
                                    Your Active Program
                                </h2>
                                {program && (
                                    <button 
                                        onClick={handleDownloadProgram}
                                        className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors border border-slate-700 hover:text-sky-400"
                                    >
                                        <Download className="w-3 h-3" /> PDF
                                    </button>
                                )}
                            </div>

                            {program ? (
                                <div className="space-y-4">
                                    <p className="text-slate-300 text-sm">Keep up the great work! Complete your daily workout to earn points.</p>
                                    
                                    {/* UPDATE: Map through the days dynamically */}
                                    <div className="max-h-64 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                                        {Array.isArray(program.days) ? program.days.map((dayObj, index) => (
                                            <div key={index} className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 flex justify-between items-center">
                                                <div>
                                                    <h3 className="font-semibold text-sky-400">
                                                        Day {index + 1}: {dayObj.dayName || 'Training Session'}
                                                    </h3>
                                                    {/* If your day object has an array of exercises, you can show the count */}
                                                    <p className="text-xs text-slate-400 mt-1">
                                                        {dayObj.exercises ? `${dayObj.exercises.length} Exercises` : 'Follow plan details'}
                                                    </p>
                                                </div>
                                            </div>
                                        )) : (
                                            // Fallback just in case 'days' is stored as a simple string or text block
                                            <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-sm text-slate-300">
                                                {typeof program.days === 'string' ? program.days : JSON.stringify(program.days)}
                                            </div>
                                        )}
                                    </div>

                                    <button 
                                        onClick={handleCompleteWorkout}
                                        className="w-full mt-4 bg-slate-800 hover:bg-sky-500/20 hover:border-sky-500/50 border border-slate-700 text-white hover:text-sky-400 font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                                    >
                                        Mark Workout as Complete ✅
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center py-10 px-4">
                                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Dumbbell className="text-slate-500 w-8 h-8" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">No active program</h3>
                                    <p className="text-sm text-slate-400 mb-6 max-w-sm mx-auto">
                                        You don't have a workout plan assigned yet. Request a custom program from your coach to get started!
                                    </p>
                                    <button 
                                        onClick={() => setShowRequestModal(true)}
                                        className="bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-semibold py-2.5 px-6 rounded-xl hover:shadow-lg hover:shadow-sky-500/25 transition-all active:scale-95"
                                    >
                                        Request Custom Program
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Quick Actions */}
                    <div className="space-y-6">
                        <div className="backdrop-blur-xl bg-gradient-to-br from-indigo-900/40 to-slate-900/60 border border-indigo-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px]"></div>
                            <h2 className="text-lg font-bold flex items-center gap-2 mb-2 text-indigo-300">
                                <MessageSquare className="w-5 h-5" />
                                AI Fitness Coach
                            </h2>
                            <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                                Need form tips or dietary advice? Chat with our AI to optimize your gains.
                            </p>
                            <button className="w-full bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/50 text-indigo-300 font-semibold py-2.5 rounded-xl transition-all">
                                Ask the AI
                            </button>
                        </div>

                        <div className="backdrop-blur-xl bg-slate-900/60 border border-slate-700/50 rounded-3xl p-6 shadow-xl">
                            <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                                <PlayCircle className="text-sky-400 w-5 h-5" />
                                Exercise Library
                            </h2>
                            <p className="text-sm text-slate-400 mb-4">
                                Browse our collection of video tutorials to perfect your form.
                            </p>
                            <button className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold py-2.5 rounded-xl transition-all">
                                View Videos
                            </button>
                        </div>
                    </div>

                </div>
            </main>

            {/* Request Program Modal Overlay */}
            {showRequestModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">Request Program</h3>
                            <button 
                                onClick={() => setShowRequestModal(false)}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <form onSubmit={submitProgramRequest} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">What is your primary goal?</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g., Lose weight, build muscle, marathon prep..."
                                    value={requestForm.goal}
                                    onChange={(e) => setRequestForm({...requestForm, goal: e.target.value})}
                                    className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Current Fitness Level</label>
                                <select
                                    value={requestForm.level}
                                    onChange={(e) => setRequestForm({...requestForm, level: e.target.value})}
                                    className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors appearance-none"
                                >
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full mt-6 bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Request'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AthleteDashboard;