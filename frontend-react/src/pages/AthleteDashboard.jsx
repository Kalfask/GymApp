import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Dumbbell, LogOut, Trophy, Activity, 
    Flame, Download, MessageSquare, PlayCircle, X, Loader2,
    ChevronDown, ChevronUp, Sparkles
} from 'lucide-react';
import { 
    getCurrentUser, logout, getProgram, 
    getStats, completeWorkout, requestProgram, downloadProgram,
    getAITips, getExerciseVideos, getYoutubeEmbedUrl // <-- Added Video APIs
} from '../api';

function AthleteDashboard() {
    const [user, setUser] = useState(null);
    const [program, setProgram] = useState(null);
    const [stats, setStats] = useState({ totalWorkouts: 0, xp: 0 ,streak:0});
    const [loading, setLoading] = useState(true);
    
    // Accordion State
    const [expandedDay, setExpandedDay] = useState(null);
    
    // Modal States
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [requestForm, setRequestForm] = useState({ goal: '', level: 'beginner' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // AI States
    const [aiLoading, setAiLoading] = useState(false);
    const [showAIModal, setShowAIModal] = useState(false);
    const [aiTip, setAiTip] = useState('');

    // Video Library States
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [videos, setVideos] = useState([]);
    const [loadingVideos, setLoadingVideos] = useState(false);
    
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
                const [programData, statsData] = await Promise.all([
                    getProgram(currentUser.id).catch(() => null),
                    getStats(currentUser.id).catch(() => ({ workoutsCompleted: 0, points: 0 }))
                ]);
                
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
        navigate('/');
    };

    const handleDownloadProgram = async () => {
        if (!user) return;
        await downloadProgram(user.id);
    };

    const submitProgramRequest = async (e) => {
        e.preventDefault();
        if (!user) return;
        setIsSubmitting(true);
        try {
            await requestProgram(user.id, requestForm.goal, requestForm.level);
            alert("Program requested successfully! Your coach will review it soon.");
            setShowRequestModal(false);
            setRequestForm({ goal: '', level: 'beginner' });
        } catch (error) {
            alert("Failed to send request. Please try again.");
        }
        setIsSubmitting(false);
    };

    const toggleDay = (index) => {
        if (expandedDay === index) {
            setExpandedDay(null);
        } else {
            setExpandedDay(index);
        }
    };

    // AI Handler
    const handleGetAITips = async () => {
        if (!user) return;
        setAiLoading(true);
        try {
            let currentExercises = [];
            if (program && program.days) {
                program.days.forEach(day => {
                    if (day.exercises && Array.isArray(day.exercises)) {
                        currentExercises = [...currentExercises, ...day.exercises.map(ex => typeof ex === 'string' ? ex : ex.name)];
                    }
                });
            }

            const goal = user.goal || "improving overall fitness";
            const level = user.level || "intermediate";
            const response = await getAITips(user.name || "Athlete", goal, level, currentExercises);
            
            if (response.success && response.tips) {
                setAiTip(response.tips);
            } else {
                setAiTip(response.message || JSON.stringify(response));
            }
            setShowAIModal(true);
        } catch (error) {
            console.error(error);
            alert("Failed to connect to the AI Coach. Please try again later.");
        }
        setAiLoading(false);
    };

    // Video Handler
    const handleOpenVideos = async () => {
        setShowVideoModal(true);
        setLoadingVideos(true);
        try {
            const vids = await getExerciseVideos();
            setVideos(Array.isArray(vids) ? vids : []);
        } catch (error) {
            console.error("Failed to load videos", error);
        }
        setLoadingVideos(false);
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
            
            {/* Background Glows */}
            <div className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] bg-sky-600/10 rounded-full blur-[150px] pointer-events-none z-0"></div>
            <div className="fixed bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none z-0"></div>

            {/* Navbar */}
            <nav className="relative z-10 backdrop-blur-md bg-slate-900/50 border-b border-slate-800 sticky top-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-tr from-sky-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-sky-500/20">
                                <Dumbbell className="text-white w-5 h-5" />
                            </div>
                            <span className="font-bold text-lg tracking-wide text-white">GymApp</span>
                        </div>
                        <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                
                {/* Header & Stats */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                            Welcome back, {user?.name?.split(' ')[0] || 'Athlete'}!
                        </h1>
                        <p className="text-slate-400 mt-1">Ready to crush your goals today?</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2 flex items-center gap-3 backdrop-blur-sm">
                            <Dumbbell className="text-sky-400 w-5 h-5" />
                            <div>
                                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Workouts</p>
                                <p className="text-sm font-bold leading-none">{stats?.totalWorkouts || 0}</p>
                            </div>
                        </div>
                        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2 flex items-center gap-3 backdrop-blur-sm">
                            <Flame className="text-orange-400 w-5 h-5" />
                            <div>
                                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Streak</p>
                                <p className="text-sm font-bold leading-none">{stats?.streak || 0}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => navigate('/leaderboard')}
                            className="bg-slate-800/50 border border-slate-700/50 hover:border-yellow-500/50 hover:bg-slate-800 rounded-xl px-4 py-2 flex items-center gap-3 backdrop-blur-sm transition-all cursor-pointer"
>
                            <Trophy className="text-yellow-400 w-5 h-5" />
                            <div className="text-left">
                                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Points</p>
                                <p className="text-sm font-bold leading-none">{stats?.xp || 0}</p>
                            </div>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Active Program Card */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="backdrop-blur-xl bg-slate-900/60 border border-slate-700/50 rounded-3xl p-6 shadow-xl">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Activity className="text-sky-400 w-5 h-5" />
                                    Your Active Program
                                </h2>
                                {program && (
                                    <button onClick={handleDownloadProgram} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors border border-slate-700">
                                        <Download className="w-3 h-3" /> PDF
                                    </button>
                                )}
                            </div>

                            {program ? (
                                <div className="space-y-4">
                                    <div className="max-h-96 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                                        {Array.isArray(program.days) ? program.days.map((dayObj, index) => (
                                            <div key={index} className="bg-slate-950/50 border border-slate-800 rounded-xl overflow-hidden transition-all duration-300">
                                                <div onClick={() => toggleDay(index)} className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-900/50 transition-colors">
                                                    <div>
                                                        <h3 className="font-semibold text-sky-400">
                                                            Day {index + 1}: {dayObj.dayName || 'Training Session'}
                                                        </h3>
                                                    </div>
                                                    <div>{expandedDay === index ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}</div>
                                                </div>

                                                {expandedDay === index && dayObj.exercises && Array.isArray(dayObj.exercises) && (
                                                    <div className="p-4 pt-0 border-t border-slate-800/50 bg-slate-900/30">
                                                        <ul className="space-y-3 mt-4 mb-4">
                                                            {dayObj.exercises.map((exercise, exIndex) => (
                                                                <li key={exIndex} className="flex flex-col gap-1 border-l-2 border-sky-500/30 pl-3">
                                                                    <span className="text-sm font-medium text-slate-200">
                                                                        {typeof exercise === 'string' ? exercise : exercise.name}
                                                                    </span>
                                                                    {typeof exercise !== 'string' && (exercise.setsReps) && (
                                                                        <span className="text-xs text-slate-400">
                                                                            {exercise.setsReps && ` ${exercise.setsReps} reps`}
                                                                        </span>
                                                                    )}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                        
                                                        {/* Workout Routing Button */}
                                                        <button 
                                                            onClick={() => navigate('/workout', { state: { day: dayObj, dayNumber: index + 1 } })}
                                                            className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-bold py-2.5 rounded-xl hover:shadow-lg hover:shadow-sky-500/30 transition-all active:scale-95"
                                                        >
                                                            Start Day {index + 1} Workout 🚀
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )) : (
                                            <div className="p-4 bg-slate-900 rounded-xl">{JSON.stringify(program.days)}</div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-10 px-4">
                                    <button onClick={() => setShowRequestModal(true)} className="bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-semibold py-2.5 px-6 rounded-xl transition-all">
                                        Request Custom Program
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions Column */}
                    <div className="space-y-6">
                        {/* AI Card */}
                        <div className="backdrop-blur-xl bg-gradient-to-br from-indigo-900/40 to-slate-900/60 border border-indigo-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                            <h2 className="text-lg font-bold flex items-center gap-2 mb-2 text-indigo-300">
                                <Sparkles className="w-5 h-5 text-indigo-400" /> AI Coach
                            </h2>
                            <p className="text-sm text-slate-300 mb-4">Chat with our AI for tips based on your program.</p>
                            <button 
                                onClick={handleGetAITips} 
                                disabled={aiLoading} 
                                className="w-full bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/50 text-indigo-300 font-semibold py-2.5 rounded-xl transition-all flex justify-center gap-2"
                            >
                                {aiLoading ? <><Loader2 className="w-4 h-4 animate-spin"/> Analyzing...</> : 'Ask the AI'}
                            </button>
                        </div>

                        {/* Video Library Card */}
                        <div className="backdrop-blur-xl bg-slate-900/60 border border-slate-700/50 rounded-3xl p-6 shadow-xl">
                            <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                                <PlayCircle className="text-sky-400 w-5 h-5" />
                                Exercise Library
                            </h2>
                            <p className="text-sm text-slate-400 mb-4">
                                Browse our collection of video tutorials to perfect your form.
                            </p>
                            <button 
                                onClick={handleOpenVideos}
                                className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold py-2.5 rounded-xl transition-all"
                            >
                                View Videos
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* AI Modal */}
            {showAIModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white flex gap-2"><Sparkles className="text-indigo-400"/> Coach AI Says...</h3>
                            <button onClick={() => setShowAIModal(false)}><X className="text-slate-400 hover:text-white" /></button>
                        </div>
                        <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-5 text-slate-300 text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
                            {aiTip}
                        </div>
                        <button onClick={() => setShowAIModal(false)} className="w-full mt-6 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 rounded-xl">Got it!</button>
                    </div>
                </div>
            )}

            {/* Request Program Modal */}
            {showRequestModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-6">
                        <div className="flex justify-between mb-6">
                            <h3 className="text-xl font-bold text-white">Request Program</h3>
                            <button onClick={() => setShowRequestModal(false)}><X className="text-slate-400" /></button>
                        </div>
                        <form onSubmit={submitProgramRequest} className="space-y-4">
                            <input type="text" placeholder="Your Goal..." value={requestForm.goal} onChange={e => setRequestForm({...requestForm, goal: e.target.value})} className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white" required />
                            <select value={requestForm.level} onChange={e => setRequestForm({...requestForm, level: e.target.value})} className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white">
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                            <button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-bold py-3 rounded-xl flex justify-center gap-2">
                                {isSubmitting ? <Loader2 className="animate-spin" /> : 'Submit Request'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Video Library Modal */}
            {showVideoModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                        
                        <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-900/50">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <PlayCircle className="text-sky-400 w-6 h-6" />
                                Exercise Video Library
                            </h3>
                            <button onClick={() => setShowVideoModal(false)} className="text-slate-400 hover:text-white transition-colors bg-slate-800 rounded-full p-1.5">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                            {loadingVideos ? (
                                <div className="flex flex-col items-center justify-center py-20 text-sky-500">
                                    <Loader2 className="w-10 h-10 animate-spin mb-4" />
                                    <p className="text-slate-400 text-sm">Loading tutorials...</p>
                                </div>
                            ) : videos.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {videos.map((video) => (
                                        <div key={video.id} className="bg-slate-950/50 border border-slate-800 rounded-2xl overflow-hidden hover:border-sky-500/50 transition-colors group">
                                            <div className="relative w-full pt-[56.25%] bg-black">
                                                <iframe
                                                    src={getYoutubeEmbedUrl(video.url)}
                                                    title={video.name}
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                    className="absolute top-0 left-0 w-full h-full border-0"
                                                ></iframe>
                                            </div>
                                            <div className="p-4">
                                                <h4 className="font-semibold text-slate-200 group-hover:text-sky-400 transition-colors">
                                                    {video.name}
                                                </h4>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20">
                                    <PlayCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                                    <h4 className="text-lg font-medium text-slate-300">No videos available</h4>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default AthleteDashboard;