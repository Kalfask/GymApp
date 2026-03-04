import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Dumbbell, Flame, Trophy } from 'lucide-react';
import { completeWorkout, getStats, getCurrentUser } from '../api';

function WorkoutSession() {
    const location = useLocation();
    const navigate = useNavigate();
    const user = getCurrentUser();
    
    // We grab the specific day data passed from the dashboard
    const { day, dayNumber } = location.state || {};
    
    // Create a state array to track which exercises are completed
    const [completedExercises, setCompletedExercises] = useState([]);
    const [isFinishing, setIsFinishing] = useState(false);

    // If they refreshed the page directly on this route, kick them back
    if (!day) {
        navigate('/athlete');
        return null;
    }

    const toggleExercise = (index) => {
        if (completedExercises.includes(index)) {
            setCompletedExercises(completedExercises.filter(i => i !== index));
        } else {
            setCompletedExercises([...completedExercises, index]);
        }
    };

    const handleFinishWorkout = async () => {
        setIsFinishing(true);
        try {
            await completeWorkout(user.id);
            alert("Workout Crushed! +50 Points added to your profile! 🎉");
            navigate('/athlete'); // Send them back to the dashboard
        } catch (error) {
            alert("Oops! Couldn't save your workout. Are you connected to the internet?");
            setIsFinishing(false);
        }
    };

    const progressPercentage = (completedExercises.length / day.exercises.length) * 100;
    const isWorkoutComplete = completedExercises.length === day.exercises.length;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-4 sm:p-8">
            <div className="max-w-3xl mx-auto">
                
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button onClick={() => navigate('/athlete')} className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
                        <ArrowLeft className="w-5 h-5" /> Back
                    </button>
                    <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-full border border-slate-800">
                        <Flame className="text-orange-500 w-4 h-4" />
                        <span className="text-sm font-bold text-slate-300">Day {dayNumber} Session</span>
                    </div>
                </div>

                <div className="mb-8">
                    <h1 className="text-4xl font-extrabold text-white mb-2">{day.dayName || 'Training Session'}</h1>
                    <p className="text-slate-400">Check off your exercises as you complete them.</p>
                </div>

                {/* Progress Bar */}
                <div className="bg-slate-900 rounded-full h-3 mb-8 border border-slate-800 overflow-hidden relative">
                    <div 
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-500 ease-out"
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>

                {/* Exercise List */}
                <div className="space-y-4 mb-10">
                    {day.exercises.map((exercise, index) => {
                        const isDone = completedExercises.includes(index);
                        const exName = typeof exercise === 'string' ? exercise : exercise.name;
                        
                        return (
                            <div 
                                key={index} 
                                onClick={() => toggleExercise(index)}
                                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${
                                    isDone 
                                        ? 'bg-sky-500/10 border-sky-500/50' 
                                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                                }`}
                            >
                                {/* Custom Checkbox */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                                    isDone ? 'bg-sky-500 border-sky-500' : 'border-slate-600'
                                }`}>
                                    {isDone && <CheckCircle2 className="w-5 h-5 text-slate-950" />}
                                </div>
                                
                                <div className="flex-1">
                                    <h3 className={`font-bold text-lg transition-colors ${isDone ? 'text-sky-400' : 'text-slate-200'}`}>
                                        {exName}
                                    </h3>
                                    {typeof exercise !== 'string' && (exercise.sets || exercise.reps) && (
                                        <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                                            <Dumbbell className="w-3.5 h-3.5" />
                                            {exercise.sets && `${exercise.sets} sets`}
                                            {exercise.sets && exercise.reps && ' • '}
                                            {exercise.reps && `${exercise.reps} reps`}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Finish Button */}
                <button
                    onClick={handleFinishWorkout}
                    disabled={isFinishing || !isWorkoutComplete}
                    className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 ${
                        isWorkoutComplete 
                            ? 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white hover:shadow-lg hover:shadow-sky-500/30' 
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                >
                    {isFinishing ? 'Saving...' : (
                        <>
                            <Trophy className="w-6 h-6" /> Finish & Claim XP
                        </>
                    )}
                </button>

            </div>
        </div>
    );
}

export default WorkoutSession;