import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import your pages
import Login from './pages/Login';
import Register from './pages/Register';
// import CoachDashboard from './pages/CoachDashboard';
 import AthleteDashboard from './pages/AthleteDashboard';
 import Home from './pages/Home';
 import WorkoutSession from './pages/WorkoutSession';

function App() {
    return (
        <Router>
            {/* CRITICAL: Notice how this wrapper div has NO padding (like p-4) 
              and NO max-width constraints. It simply provides the base background 
              color and font for the entire app. 
            */}
            <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-sky-500/30">
                
                {/* Global Navbar could go here later if you want it on every page */}

                <Routes>
                    {/* --- Public Auth Routes (Full Screen) --- */}
                    <Route path="/" element={<Home/>}></Route>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* --- Private/Internal App Routes --- */}
                    {/* <Route path="/coach" element={<CoachDashboard />} /> */}
                    { <Route path="/athlete" element={<AthleteDashboard />} /> }
                    <Route path="/workout" element={<WorkoutSession />} />

                    {/* --- Catch-all / Default Route --- */}
                    {/* If someone goes to localhost:5173/, send them to login automatically */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>

            </div>
        </Router>
    );
}

export default App;

