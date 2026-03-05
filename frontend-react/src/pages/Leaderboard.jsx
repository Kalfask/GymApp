import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, ArrowLeft, Flame, Medal, Loader2, User ,Star} from 'lucide-react';
import { getLeaderboard, getCurrentUser } from '../api';

function Leaderboard() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const user = getCurrentUser();
        if (!user) {
            navigate('/login');
            return;
        }
        setCurrentUser(user);

        const fetchLeaderboard = async () => {
            try {
                const data = await getLeaderboard();
                // Ensure we have an array and sort it by XP/Points highest to lowest just in case the backend didn't
                const sortedData = Array.isArray(data) 
                    ? data.sort((a, b) => (b.xp || b.points || 0) - (a.xp || a.points || 0))
                    : [];
                setLeaderboard(sortedData);
            } catch (error) {
                console.error("Failed to fetch leaderboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="text-yellow-500 w-10 h-10 animate-spin" />
            </div>
        );
    }

    // Split the top 3 from the rest of the players
    const topThree = leaderboard.slice(0, 3);
    const theRest = leaderboard.slice(3);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans relative overflow-x-hidden p-4 sm:p-8">
            
            {/* Background Ambient Glows */}
            <div className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] bg-yellow-600/10 rounded-full blur-[150px] pointer-events-none z-0"></div>
            <div className="fixed bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[150px] pointer-events-none z-0"></div>

            <div className="relative z-10 max-w-4xl mx-auto">
                
                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <button 
                        onClick={() => navigate(-1)} // Goes back to the previous page (Athlete or Coach Dashboard)
                        className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-800"
                    >
                        <ArrowLeft className="w-5 h-5" /> Back
                    </button>
                    <div className="flex items-center gap-3">
                        <Trophy className="text-yellow-400 w-6 h-6" />
                        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                            Global Leaderboard
                        </h1>
                    </div>
                </div>

                {/* Top 3 Podium (Only renders if there are enough players) */}
                {topThree.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 items-end">
                        
                        {/* 2nd Place (Silver) */}
                        {topThree[1] && (
                            <div className="order-2 md:order-1 backdrop-blur-xl bg-slate-900/60 border border-slate-400/30 rounded-3xl p-6 flex flex-col items-center text-center transform md:-translate-y-4">
                                <div className="w-16 h-16 bg-slate-400/20 rounded-full flex items-center justify-center mb-3 border-2 border-slate-400">
                                    <Medal className="text-slate-300 w-8 h-8" />
                                </div>
                                <h3 className="font-bold text-lg text-white mb-1">{topThree[1].name || 'Athlete'}</h3>
                                <p className="text-slate-400 text-sm font-semibold mb-3">{topThree[1].xp || topThree[1].points || 0} XP</p>
                                <div className="flex items-center gap-1 text-xs text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-lg">
                                    <Star className="w-3 h-3" /> {topThree[1].level || 0} Level
                                </div>
                            </div>
                        )}

                        {/* 1st Place (Gold) */}
                        {topThree[0] && (
                            <div className="order-1 md:order-2 backdrop-blur-xl bg-gradient-to-b from-yellow-500/20 to-slate-900/80 border border-yellow-500/50 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl shadow-yellow-500/10 relative z-10">
                                <div className="absolute -top-4 bg-yellow-500 text-slate-950 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full">
                                    1st Place
                                </div>
                                <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mb-4 border-2 border-yellow-400 shadow-lg shadow-yellow-500/20">
                                    <Trophy className="text-yellow-400 w-10 h-10" />
                                </div>
                                <h3 className="font-extrabold text-xl text-white mb-1">{topThree[0].name || 'Athlete'}</h3>
                                <p className="text-yellow-400 font-bold text-lg mb-4">{topThree[0].xp || topThree[0].points || 0} XP</p>
                                <div className="flex items-center gap-1 text-sm text-orange-400 bg-orange-500/10 px-3 py-1.5 rounded-xl font-medium">
                                    <Star className="w-4 h-4" /> {topThree[0].level|| 0} Level
                                </div>
                            </div>
                        )}

                        {/* 3rd Place (Bronze) */}
                        {topThree[2] && (
                            <div className="order-3 md:order-3 backdrop-blur-xl bg-slate-900/60 border border-orange-800/50 rounded-3xl p-6 flex flex-col items-center text-center transform md:-translate-y-8">
                                <div className="w-16 h-16 bg-orange-800/20 rounded-full flex items-center justify-center mb-3 border-2 border-orange-700">
                                    <Medal className="text-orange-500 w-8 h-8" />
                                </div>
                                <h3 className="font-bold text-lg text-white mb-1">{topThree[2].name || 'Athlete'}</h3>
                                <p className="text-slate-400 text-sm font-semibold mb-3">{topThree[2].xp || topThree[2].points || 0} XP</p>
                                <div className="flex items-center gap-1 text-xs text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-lg">
                                    <Star className="w-3 h-3" /> {topThree[2].level || 0} Level
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* The Rest of the Leaderboard */}
                {theRest.length > 0 && (
                    <div className="backdrop-blur-xl bg-slate-900/60 border border-slate-700/50 rounded-3xl overflow-hidden shadow-xl">
                        <div className="divide-y divide-slate-800/50">
                            {theRest.map((player, index) => {
                                // Add 4 because index is 0, but they start at 4th place
                                const rank = index + 4; 
                                const isMe = player.id === currentUser?.id;

                                return (
                                    <div 
                                        key={player.id || index} 
                                        className={`p-4 sm:p-5 flex items-center justify-between transition-colors hover:bg-slate-800/30 ${
                                            isMe ? 'bg-sky-500/5 border-l-4 border-l-sky-500' : ''
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 text-center text-slate-500 font-bold text-lg">
                                                #{rank}
                                            </div>
                                            <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
                                                <User className="w-5 h-5 text-slate-400" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-slate-200">
                                                    {player.name || 'Athlete'} {isMe && <span className="ml-2 text-xs bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded-full">You</span>}
                                                </h4>
                                                <div className="flex items-center gap-3 text-xs mt-1">
                                                    <span className="text-slate-400">{player.xp || player.points || 0} XP</span>
                                                    <span className="text-orange-400 flex items-center gap-1">
                                                        <Star className="w-3 h-3" /> {player.level || 0}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {leaderboard.length === 0 && !loading && (
                    <div className="text-center py-20 bg-slate-900/60 border border-slate-700/50 rounded-3xl backdrop-blur-xl">
                        <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-slate-300">No athletes ranked yet!</h2>
                        <p className="text-slate-500 mt-2">Complete a workout to be the first on the board.</p>
                    </div>
                )}

            </div>
        </div>
    );
}

export default Leaderboard;