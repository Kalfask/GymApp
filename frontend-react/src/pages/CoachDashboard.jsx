import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Users, LogOut, Activity, PlusCircle, 
    Video, Search, ClipboardList, Loader2, Dumbbell, ShieldCheck, X
} from 'lucide-react';
import { 
    getCurrentUser, logout, getMembers, 
    assignPlan, addExerciseVideo
} from '../api';

function CoachDashboard() {
    const [user, setUser] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('roster'); // 'roster' or 'videos'
    const [searchQuery, setSearchQuery] = useState('');

    // Modal States
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedAthlete, setSelectedAthlete] = useState(null);
    const [planInput, setPlanInput] = useState('');
    const [isAssigning, setIsAssigning] = useState(false);

    // Video Form States
    const [videoName, setVideoName] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [isAddingVideo, setIsAddingVideo] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const currentUser = getCurrentUser();
        // Protect route: Kick out athletes or non-logged-in users
        if (!currentUser || currentUser.role !== 'coach') {
            navigate('/login');
            return;
        }
        setUser(currentUser);
        fetchData();
    }, [navigate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await getMembers();
            setMembers(Array.isArray(data) ? data : data.members || []);
        } catch (error) {
            console.error("Failed to fetch members:", error);
        }
        setLoading(false);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleAssignPlan = async (e) => {
        e.preventDefault();
        setIsAssigning(true);
        try {
            await assignPlan(selectedAthlete.id, planInput);
            alert(`Plan assigned to ${selectedAthlete.name} successfully!`);
            setShowAssignModal(false);
            setPlanInput('');
            fetchData(); // Refresh roster to show new plan
        } catch (error) {
            alert("Failed to assign plan.");
        }
        setIsAssigning(false);
    };

    const handleAddVideo = async (e) => {
        e.preventDefault();
        setIsAddingVideo(true);
        try {
            await addExerciseVideo(videoName, videoUrl);
            alert("Video added to the library!");
            setVideoName('');
            setVideoUrl('');
        } catch (error) {
            alert("Failed to add video.");
        }
        setIsAddingVideo(false);
    };

    // Filter members based on search
    const filteredMembers = members.filter(m => 
        m.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        m.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading && members.length === 0) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="text-purple-500 w-10 h-10 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans relative overflow-x-hidden">
            
            {/* Background Glows (Purple/Blue for Coach side) */}
            <div className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none z-0"></div>
            <div className="fixed bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-sky-600/10 rounded-full blur-[150px] pointer-events-none z-0"></div>

            {/* Coach Navbar */}
            <nav className="relative z-10 backdrop-blur-md bg-slate-900/50 border-b border-slate-800 sticky top-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-tr from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
                                <ShieldCheck className="text-white w-5 h-5" />
                            </div>
                            <span className="font-bold text-lg tracking-wide text-white">Coach Portal</span>
                        </div>
                        <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-white mb-2">
                        Welcome, Coach {user?.name?.split(' ')[0]}
                    </h1>
                    <p className="text-slate-400">Manage your athletes and training content from one place.</p>
                </div>

                {/* Navigation Tabs */}
                <div className="flex gap-4 border-b border-slate-800 mb-8">
                    <button 
                        onClick={() => setActiveTab('roster')}
                        className={`pb-4 px-2 text-sm font-semibold transition-colors relative ${activeTab === 'roster' ? 'text-purple-400' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        <div className="flex items-center gap-2"><Users className="w-4 h-4" /> Athlete Roster</div>
                        {activeTab === 'roster' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-500 rounded-t-full"></div>}
                    </button>
                    <button 
                        onClick={() => setActiveTab('videos')}
                        className={`pb-4 px-2 text-sm font-semibold transition-colors relative ${activeTab === 'videos' ? 'text-purple-400' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        <div className="flex items-center gap-2"><Video className="w-4 h-4" /> Video Library Manager</div>
                        {activeTab === 'videos' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-500 rounded-t-full"></div>}
                    </button>
                </div>

                {/* TAB CONTENT: ROSTER */}
                {activeTab === 'roster' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Search Bar */}
                        <div className="relative max-w-md">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="w-5 h-5 text-slate-500" />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Search athletes by name or email..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors backdrop-blur-md"
                            />
                        </div>

                        {/* Roster Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredMembers.map((athlete) => (
                                <div key={athlete.id} className="backdrop-blur-xl bg-slate-900/60 border border-slate-700/50 rounded-3xl p-6 shadow-xl flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg text-white">{athlete.name}</h3>
                                            <p className="text-xs text-slate-400">{athlete.email}</p>
                                        </div>
                                        {athlete.plan ? (
                                            <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg">
                                                Active
                                            </span>
                                        ) : (
                                            <span className="bg-orange-500/10 text-orange-400 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border border-orange-500/20">
                                                Needs Plan
                                            </span>
                                        )}
                                    </div>
                                    
                                    <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 flex-1 mb-4 flex flex-col justify-center">
                                        <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Current Plan</p>
                                        <p className="text-sm font-medium text-slate-300">
                                            {athlete.plan || "No program assigned yet."}
                                        </p>
                                    </div>

                                    <button 
                                        onClick={() => {
                                            setSelectedAthlete(athlete);
                                            setShowAssignModal(true);
                                        }}
                                        className="w-full bg-slate-800 hover:bg-purple-600/20 hover:text-purple-400 border border-slate-700 hover:border-purple-500/50 text-white font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
                                    >
                                        <ClipboardList className="w-4 h-4" /> Manage Program
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* TAB CONTENT: VIDEOS */}
                {activeTab === 'videos' && (
                    <div className="max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="backdrop-blur-xl bg-slate-900/60 border border-slate-700/50 rounded-3xl p-8 shadow-xl">
                            <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/20">
                                <Video className="text-purple-400 w-7 h-7" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Add New Video</h2>
                            <p className="text-slate-400 text-sm mb-6">Upload form tutorials for your athletes to access during their workouts.</p>
                            
                            <form onSubmit={handleAddVideo} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Exercise Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g., Barbell Back Squat"
                                        value={videoName}
                                        onChange={(e) => setVideoName(e.target.value)}
                                        className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">YouTube URL</label>
                                    <input
                                        type="url"
                                        required
                                        placeholder="https://youtube.com/watch?v=..."
                                        value={videoUrl}
                                        onChange={(e) => setVideoUrl(e.target.value)}
                                        className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isAddingVideo}
                                    className="w-full mt-6 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                                >
                                    {isAddingVideo ? <Loader2 className="w-5 h-5 animate-spin" /> : <><PlusCircle className="w-5 h-5" /> Add to Library</>}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </main>

            {/* Assign Plan Modal */}
            {showAssignModal && selectedAthlete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-purple-500/30 rounded-3xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-purple-500/10 rounded-full blur-[50px]"></div>
                        
                        <div className="flex justify-between items-center mb-6 relative z-10">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <ClipboardList className="w-5 h-5 text-purple-400" />
                                Assign Plan
                            </h3>
                            <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <p className="text-sm text-slate-300 mb-4 relative z-10">
                            Assigning a new workout plan for <span className="font-bold text-white">{selectedAthlete.name}</span>.
                        </p>

                        <form onSubmit={handleAssignPlan} className="relative z-10 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1.5">Plan Name / Description</label>
                                <textarea
                                    required
                                    rows="4"
                                    placeholder="e.g., 4-Week Hypertrophy Block..."
                                    value={planInput}
                                    onChange={(e) => setPlanInput(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors custom-scrollbar"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isAssigning}
                                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                                {isAssigning ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Assignment'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CoachDashboard;