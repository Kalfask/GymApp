import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, LogOut, PlusCircle, Video, Search, ClipboardList,
    Loader2, ShieldCheck, X, Library, Trash2, Target,
    Dumbbell, ChevronDown, ChevronUp, Plus, AlertCircle, CheckCircle2
} from 'lucide-react';
import {
    getCurrentUser, logout, getMembers, assignPlan,
    addExerciseVideo, getExerciseVideos, deleteExerciseVideo,
    getMemberRequest, createProgram, getYoutubeEmbedUrl
} from '../api';

function CoachDashboard() {
    const [user, setUser] = useState(null);
    const [members, setMembers] = useState([]);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('roster');
    const [searchQuery, setSearchQuery] = useState('');

    // Assign Plan Modal
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedAthlete, setSelectedAthlete] = useState(null);
    const [planInput, setPlanInput] = useState('');
    const [isAssigning, setIsAssigning] = useState(false);

    // Video States
    const [videoName, setVideoName] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [isAddingVideo, setIsAddingVideo] = useState(false);

    // Request Manager States
    const [requests, setRequests] = useState([]);
    const [requestsLoading, setRequestsLoading] = useState(false);
    const [showProgramModal, setShowProgramModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [programDays, setProgramDays] = useState([
        { day: 'Day 1', exercises: [{ name: '', sets: '', reps: '', notes: '' }] }
    ]);
    const [isCreatingProgram, setIsCreatingProgram] = useState(false);
    const [expandedRequest, setExpandedRequest] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const currentUser = getCurrentUser();
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

    const fetchVideos = async () => {
        try {
            const data = await getExerciseVideos();
            setVideos(Array.isArray(data) ? data : data.videos || []);
        } catch (error) {
            console.error("Failed to fetch videos:", error);
        }
    };

    const fetchRequests = async () => {
        setRequestsLoading(true);
        try {
            console.log(members.length);
            const allMembers = members.length > 0 ? members : await getMembers().then(d => Array.isArray(d) ? d : d.members || []);
            console.log(allMembers);
            const results = await Promise.all(
                allMembers.map(async (member) => {
                    try {
                        const req = await getMemberRequest(member.id);
                        
                        if (req && (req.request.status =="pending")) {
                            console.log("req",req);
                            return { ...req, member };
                        }
                        return null;
                    } catch {
                        return null;
                    }
                })
            );
            setRequests(results.filter(Boolean));
            console.log("results",results);
        } catch (error) {
            console.error("Failed to fetch requests:", error);
        }
        setRequestsLoading(false);
    };

    useEffect(() => {
        if (activeTab === 'videos') fetchVideos();
        if (activeTab === 'RequestManager') fetchRequests();
    }, [activeTab]);

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
            fetchData();
        } catch {
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
            fetchVideos();
        } catch {
            alert("Failed to add video.");
        }
        setIsAddingVideo(false);
    };

    const handleDeleteVideo = async (videoId) => {
        if (!window.confirm("Are you sure you want to delete this video?")) return;
        try {
            await deleteExerciseVideo(videoId);
            setVideos((prev) => prev.filter((v) => v.id !== videoId));
        } catch {
            alert("Failed to delete video.");
        }
    };

    const addDay = () => {
        setProgramDays(prev => [
            ...prev,
            { day: `Day ${prev.length + 1}`, exercises: [{ name: '', sets: '', reps: '', notes: '' }] }
        ]);
    };

    const removeDay = (dayIndex) => {
        setProgramDays(prev => prev.filter((_, i) => i !== dayIndex));
    };

    const updateDayName = (dayIndex, value) => {
        setProgramDays(prev => prev.map((d, i) => i === dayIndex ? { ...d, day: value } : d));
    };

    const addExercise = (dayIndex) => {
        setProgramDays(prev => prev.map((d, i) =>
            i === dayIndex
                ? { ...d, exercises: [...d.exercises, { name: '', sets: '', reps: '', notes: '' }] }
                : d
        ));
    };

    const removeExercise = (dayIndex, exIndex) => {
        setProgramDays(prev => prev.map((d, i) =>
            i === dayIndex
                ? { ...d, exercises: d.exercises.filter((_, j) => j !== exIndex) }
                : d
        ));
    };

    const updateExercise = (dayIndex, exIndex, field, value) => {
        setProgramDays(prev => prev.map((d, i) =>
            i === dayIndex
                ? { ...d, exercises: d.exercises.map((ex, j) => j === exIndex ? { ...ex, [field]: value } : ex) }
                : d
        ));
    };

 const handleCreateProgram = async (e) => {
    e.preventDefault();
    setIsCreatingProgram(true);
    try {
        const formattedDays = programDays.map(d => ({
            dayName: d.day,
            exercises: d.exercises.map(ex => ({
                name: ex.name,
                setsReps: `${ex.sets} x ${ex.reps}`,
                notes: ex.notes
            }))
        }));
        await createProgram(selectedRequest.member.id, formattedDays);
        alert(`Program created for ${selectedRequest.member.name}!`);
        setShowProgramModal(false);
        setSelectedRequest(null);
        setProgramDays([{ day: 'Day 1', exercises: [{ name: '', sets: '', reps: '', notes: '' }] }]);
        fetchRequests();
    } catch {
        alert("Failed to create program.");
    }
    setIsCreatingProgram(false);
};
    const openProgramModal = (request) => {
        setSelectedRequest(request);
        setProgramDays([{ day: 'Day 1', exercises: [{ name: '', sets: '', reps: '', notes: '' }] }]);
        setShowProgramModal(true);
    };

    const filteredMembers = members.filter((m) =>
        m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const levelColor = (level) => {
        if (!level) return 'text-slate-400 bg-slate-800';
        const l = level.toLowerCase();
        if (l.includes('begin')) return 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20';
        if (l.includes('inter')) return 'text-amber-400 bg-amber-500/10 border border-amber-500/20';
        if (l.includes('adv')) return 'text-red-400 bg-red-500/10 border border-red-500/20';
        return 'text-slate-400 bg-slate-800';
    };

    if (loading && members.length === 0) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="text-purple-500 w-10 h-10 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans relative overflow-x-hidden">

            <div className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none z-0"></div>
            <div className="fixed bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-sky-600/10 rounded-full blur-[150px] pointer-events-none z-0"></div>

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

            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-white mb-2">
                        Welcome, Coach {user?.name?.split(' ')[0]}
                    </h1>
                    <p className="text-slate-400">Manage your athletes and training content from one place.</p>
                </div>

                <div className="flex gap-4 border-b border-slate-800 mb-8">
                    <button
                        onClick={() => setActiveTab('roster')}
                        className={`pb-4 px-2 text-sm font-semibold transition-colors relative ${activeTab === 'roster' ? 'text-purple-400' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Athlete Roster
                        </div>
                        {activeTab === 'roster' && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-500 rounded-t-full"></div>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('videos')}
                        className={`pb-4 px-2 text-sm font-semibold transition-colors relative ${activeTab === 'videos' ? 'text-purple-400' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        <div className="flex items-center gap-2">
                            <Video className="w-4 h-4" />
                            Video Library Manager
                        </div>
                        {activeTab === 'videos' && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-500 rounded-t-full"></div>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('RequestManager')}
                        className={`pb-4 px-2 text-sm font-semibold transition-colors relative ${activeTab === 'RequestManager' ? 'text-purple-400' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        <div className="flex items-center gap-2">
                            <ClipboardList className="w-4 h-4" />
                            Request Manager
                            {requests.length > 0 && (
                                <span className="bg-purple-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                    {requests.length}
                                </span>
                            )}
                        </div>
                        {activeTab === 'RequestManager' && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-500 rounded-t-full"></div>
                        )}
                    </button>
                </div>

                {/* TAB: ROSTER */}
                {activeTab === 'roster' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredMembers.map((athlete) => (
                                <div key={athlete.id} className="backdrop-blur-xl bg-slate-900/60 border border-slate-700/50 rounded-3xl p-6 shadow-xl flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg text-white">{athlete.name}</h3>
                                            <p className="text-xs text-slate-400">{athlete.email}</p>
                                        </div>
                                        {athlete.plan ? (
                                            <div className="flex flex-col gap-1 items-end">
                                                <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg">
                                                    Active
                                                </span>
                                                <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg">
                                                    until {new Date(athlete.end_date).toLocaleDateString()}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="bg-orange-500/10 text-orange-400 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border border-orange-500/20">
                                                Needs Plan
                                            </span>
                                        )}
                                    </div>
                                    <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 flex-1 mb-4 flex flex-col justify-center">
                                        <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Current Plan</p>
                                        <p className="text-sm font-medium text-slate-300">
                                            {athlete.plan || "No Plan assigned yet."}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setSelectedAthlete(athlete);
                                            setShowAssignModal(true);
                                        }}
                                        className="w-full bg-slate-800 hover:bg-purple-600/20 hover:text-purple-400 border border-slate-700 hover:border-purple-500/50 text-white font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
                                    >
                                        <ClipboardList className="w-4 h-4" />
                                        Manage Program
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* TAB: VIDEOS */}
                {activeTab === 'videos' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex gap-8 items-start">
                            <div className="w-80 flex-shrink-0">
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
                                            className="w-full mt-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                                        >
                                            {isAddingVideo ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    <PlusCircle className="w-5 h-5" />
                                                    Add to Library
                                                </span>
                                            )}
                                        </button>
                                    </form>
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                {videos.length > 0 ? (
                                    <div>
                                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                            <Library className="w-5 h-5 text-purple-400" />
                                            Video Library
                                            <span className="text-xs font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                                                {videos.length}
                                            </span>
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                            {videos.map((video) => {
                                                const embedUrl = getYoutubeEmbedUrl(video.url);
                                                return (
                                                    <div
                                                        key={video.id}
                                                        className="group backdrop-blur-xl bg-slate-900/60 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-purple-500/40 transition-all duration-200 shadow-lg"
                                                    >
                                                        <div className="relative aspect-video bg-slate-950">
                                                            <iframe
                                                                src={embedUrl}
                                                                title={video.name}
                                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                allowFullScreen
                                                                className="w-full h-full"
                                                            />
                                                        </div>
                                                        <div className="p-4 flex items-start justify-between gap-2">
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-semibold text-white truncate">{video.name}</p>
                                                                <p className="text-xs text-slate-500 truncate mt-0.5">{video.url}</p>
                                                            </div>
                                                            <button
                                                                onClick={() => handleDeleteVideo(video.id)}
                                                                className="flex-shrink-0 p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                                        <div className="w-16 h-16 bg-slate-800/80 rounded-2xl flex items-center justify-center mb-4 border border-slate-700/50">
                                            <Video className="w-7 h-7 text-slate-600" />
                                        </div>
                                        <p className="text-slate-400 font-medium">No videos yet</p>
                                        <p className="text-slate-600 text-sm mt-1">Add your first video using the form on the left.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB: REQUEST MANAGER */}
                {activeTab === 'RequestManager' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">

                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-white">Program Requests</h2>
                                <p className="text-slate-400 text-sm mt-1">Athletes who have submitted a program request.</p>
                            </div>
                            <button
                                onClick={fetchRequests}
                                disabled={requestsLoading}
                                className="flex items-center gap-2 text-sm text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl transition-colors"
                            >
                                <Loader2 className={`w-4 h-4 ${requestsLoading ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                        </div>

                        {requestsLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                            </div>
                        ) : requests.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-16 h-16 bg-slate-800/80 rounded-2xl flex items-center justify-center mb-4 border border-slate-700/50">
                                    <CheckCircle2 className="w-7 h-7 text-slate-600" />
                                </div>
                                <p className="text-slate-400 font-medium">No pending requests</p>
                                <p className="text-slate-600 text-sm mt-1">All caught up! No athletes are waiting for a program.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {requests.map((req, index) => (
                                    <div
                                        key={req.member.id}
                                        className="backdrop-blur-xl bg-slate-900/60 border border-slate-700/50 rounded-2xl shadow-lg overflow-hidden"
                                    >
                                        <div className="p-5 flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-purple-400 font-bold text-sm">
                                                        {req.member.name?.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-white">{req.member.name}</p>
                                                    <p className="text-xs text-slate-400">{req.member.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {req.level && (
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${levelColor(req.level)}`}>
                                                        {req.level}
                                                    </span>
                                                )}
                                                <button
                                                    onClick={() => setExpandedRequest(expandedRequest === index ? null : index)}
                                                    className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                                                >
                                                    {expandedRequest === index ? (
                                                        <ChevronUp className="w-4 h-4" />
                                                    ) : (
                                                        <ChevronDown className="w-4 h-4" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => openProgramModal(req)}
                                                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
                                                >
                                                    <Dumbbell className="w-4 h-4" />
                                                    Create Program
                                                </button>
                                            </div>
                                        </div>

                                        {expandedRequest === index && (
                                            <div className="border-t border-slate-800 px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Target className="w-4 h-4 text-purple-400" />
                                                        <p className="text-xs text-slate-500 uppercase font-semibold">Goal</p>
                                                    </div>
                                                    <p className="text-sm text-slate-200">{req.request.goal || 'Not specified'}</p>
                                                </div>
                                                <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <AlertCircle className="w-4 h-4 text-amber-400" />
                                                        <p className="text-xs text-slate-500 uppercase font-semibold">Level</p>
                                                    </div>
                                                    <p className="text-sm text-slate-200">{req.request.level || 'Not specified'}</p>
                                                </div>
                                                {req.request.notes && (
                                                    <div className="sm:col-span-2 bg-slate-950/50 rounded-xl p-4 border border-slate-800">
                                                        <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Additional Notes</p>
                                                        <p className="text-sm text-slate-200">{req.request.notes}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
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
                                    rows={4}
                                    placeholder="e.g., 4-Week Hypertrophy Block..."
                                    value={planInput}
                                    onChange={(e) => setPlanInput(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
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

            {/* Create Program Modal */}
            {showProgramModal && selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-purple-500/30 rounded-3xl w-full max-w-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-purple-500/10 rounded-full blur-[50px] pointer-events-none"></div>

                        <div className="flex justify-between items-start p-6 border-b border-slate-800 relative z-10 flex-shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Dumbbell className="w-5 h-5 text-purple-400" />
                                    Create Program
                                </h3>
                                <p className="text-sm text-slate-400 mt-1">
                                    For <span className="text-white font-semibold">{selectedRequest.member.name}</span>
                                    {selectedRequest.goal && (
                                        <span> · Goal: <span className="text-purple-300">{selectedRequest.goal}</span></span>
                                    )}
                                    {selectedRequest.level && (
                                        <span> · Level: <span className="text-purple-300">{selectedRequest.level}</span></span>
                                    )}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowProgramModal(false)}
                                className="text-slate-400 hover:text-white transition-colors mt-1"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateProgram} className="flex flex-col flex-1 overflow-hidden">
                            <div className="overflow-y-auto flex-1 p-6 space-y-4 relative z-10">
                                {programDays.map((day, dayIndex) => (
                                    <div key={dayIndex} className="bg-slate-950/60 border border-slate-800 rounded-2xl overflow-hidden">
                                        <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 border-b border-slate-800">
                                            <input
                                                type="text"
                                                value={day.day}
                                                onChange={(e) => updateDayName(dayIndex, e.target.value)}
                                                className="bg-transparent text-sm font-bold text-white focus:outline-none w-40"
                                                placeholder="Day name..."
                                            />
                                            {programDays.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeDay(dayIndex)}
                                                    className="text-slate-500 hover:text-red-400 transition-colors p-1"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                        <div className="p-4 space-y-3">
                                            {day.exercises.map((ex, exIndex) => (
                                                <div key={exIndex} className="grid grid-cols-12 gap-2 items-center">
                                                    <input
                                                        type="text"
                                                        placeholder="Exercise name"
                                                        value={ex.name}
                                                        onChange={(e) => updateExercise(dayIndex, exIndex, 'name', e.target.value)}
                                                        className="col-span-4 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Sets"
                                                        value={ex.sets}
                                                        onChange={(e) => updateExercise(dayIndex, exIndex, 'sets', e.target.value)}
                                                        className="col-span-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Reps"
                                                        value={ex.reps}
                                                        onChange={(e) => updateExercise(dayIndex, exIndex, 'reps', e.target.value)}
                                                        className="col-span-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Notes"
                                                        value={ex.notes}
                                                        onChange={(e) => updateExercise(dayIndex, exIndex, 'notes', e.target.value)}
                                                        className="col-span-3 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                                                    />
                                                    <div className="col-span-1 flex justify-center">
                                                        {day.exercises.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeExercise(dayIndex, exIndex)}
                                                                className="text-slate-600 hover:text-red-400 transition-colors"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => addExercise(dayIndex)}
                                                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-purple-400 transition-colors mt-1"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                                Add Exercise
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={addDay}
                                    className="w-full border border-dashed border-slate-700 hover:border-purple-500/50 text-slate-500 hover:text-purple-400 rounded-2xl py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Day
                                </button>
                            </div>

                            <div className="p-6 border-t border-slate-800 relative z-10 flex-shrink-0">
                                <button
                                    type="submit"
                                    disabled={isCreatingProgram}
                                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                                >
                                    {isCreatingProgram ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Dumbbell className="w-5 h-5" />
                                            Save Program
                                        </span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}

export default CoachDashboard;