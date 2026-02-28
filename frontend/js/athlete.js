
//Athlete dashboard JS

let currentMember = null;


///automatically login from token in local storage (if exists)

async function init() {
    const token = localStorage.getItem('authToken');
    if (token) {
        try {
            const result = getCurrentUser();
            if (result)
            {
                const memberResult = await searchMember(result.email);
                if(memberResult.ok)
            {
                
                    currentMember = memberResult.data;

                    const ProgramRequestResult = await getMemberRequest(currentMember.id);
                    currentMember.programRequest = ProgramRequestResult.request;

                    const programResult = await getProgram(currentMember.id);
                    currentMember.program = programResult.program;


                    //document.getElementById('login-section').classList.add('hidden');
                    document.getElementById('dashboard').classList.remove('hidden');
                    loadDashboard();
            }
            else
            {
                alert('Member not found. Please check your email.');
            }

            }
        }
        catch (error) {
            console.log('login error:', error);
            localStorage.removeItem('authToken');
        }
    }
}
async function handleLogin() 
    {
        const email = document.getElementById('loginEmail').value;
        
        if (!email) {
            alert('Please enter your email');
            return;
        }
        
        try{
            const result = await searchMember(email);
            

            if(result.ok)
            {
                
                    currentMember = result.data;

                    const ProgramRequestResult = await getMemberRequest(currentMember.id);
                    currentMember.programRequest = ProgramRequestResult.request;

                    const programResult = await getProgram(currentMember.id);
                    currentMember.program = programResult.program;


                    document.getElementById('login-section').classList.add('hidden');
                    document.getElementById('dashboard').classList.remove('hidden');
                    loadDashboard();
            }
            else
            {
                alert('Member not found. Please check your email.');
            }
        } 
        catch (error) {
            console.log('Login error:', error);
            alert('Error logging in');
        }
    }

function handleLogout() {
    currentMember = null;
    document.getElementById('login-section').classList.remove('hidden');
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('loginEmail').value = '';
}


function loadDashboard() {
    displayMembershipStatus();
    displayRequestSection();
    displayMyProgram();
    loadExerciseLibrary();
    loadDaySelector();
}

function displayMembershipStatus() 
    {
        let statusIcon;
        if (currentMember.status === 'active') {
            statusIcon = '✅';
        } else if (currentMember.status === 'expiring') {
            statusIcon = '⚠️';
        } else {
            statusIcon = '❌';
        }

        const endDate = new Date(currentMember.endDate).toLocaleDateString();

        document.getElementById('membership-status').innerHTML = `
            <div class="status-card status-${currentMember.status}">
                <h3 style="margin-top: 0;">${statusIcon} ${currentMember.name}</h3>
                <p><strong>Email:</strong> ${currentMember.email}</p>
                <p><strong>Plan:</strong> ${currentMember.plan}</p>
                <p><strong>Expires:</strong> ${endDate}</p>
                <p><strong>Days left:</strong> ${currentMember.daysLeft}</p>
            </div>
        `;
    }

function displayRequestSection() 
{
    const formDiv = document.getElementById('request-form');
    const statusDiv = document.getElementById('request-status');
    if(currentMember.programRequest && currentMember.programRequest.status === 'pending')
    {
         // Has pending request
        formDiv.classList.add('hidden');
        statusDiv.innerHTML = `
            <div class="card" style="border-left-color: var(--accent);">
                <p style="color: var(--accent);">⏳ Your program request is pending.</p>
                <p style="color: var(--text-muted);">
                    Goal: ${currentMember.programRequest.goal}<br>
                    Level: ${currentMember.programRequest.level}<br>
                    Requested: ${new Date(currentMember.programRequest.requestedAt).toLocaleDateString()}
                </p>
            </div>
        `;
    }
    else if (currentMember.program != null) {
        // Already has a program
        formDiv.classList.add('hidden');
        statusDiv.innerHTML = `
            <div class="card" style="border-left-color: var(--success);">
                <p style="color: var(--success);">✅ You already have a workout program!</p>
                <button type="button" onclick="NewRequest()" class="accent" style="margin-top: 10px;">Request a new program</button>
            </div>
        `;
    } else if (currentMember.programRequest && currentMember.programRequest.status === 'pending') {
        // Has pending request
        formDiv.classList.add('hidden');
        statusDiv.innerHTML = `
            <div class="card" style="border-left-color: var(--accent);">
                <p style="color: var(--accent);">⏳ Your program request is pending.</p>
                <p style="color: var(--text-muted);">
                    Goal: ${currentMember.programRequest.goal}<br>
                    Level: ${currentMember.programRequest.level}<br>
                    Requested: ${new Date(currentMember.programRequest.requestedAt).toLocaleDateString()}
                </p>
            </div>
        `;
    } else {
        // Can request a program
        formDiv.classList.remove('hidden');
        statusDiv.innerHTML = '';
    }
}

function NewRequest()
{
    let flag = true;
    const formDiv = document.getElementById('request-form');
    const statusDiv = document.getElementById('request-status');
    formDiv.classList.remove('hidden');
    statusDiv.innerHTML = `
        <div class="card" style="border-left-color: var(--accent);">
            <p style="color: var(--accent);">You can request a new workout program.</p>
             <button type="button" onclick="cancelRequest()">Cancel New Request</button>
        </div>
        
    `;
}

function cancelRequest()
{
    displayRequestSection();
}

async function displayMyProgram() 
{
    const container = document.getElementById('my-program');

    if (currentMember.program == null) 
        {
            container.innerHTML = `
                <p style="color: var(--text-muted);">You don't have a workout program yet.</p>
            `;
            return;
        }

    try
    {
        const response = await getProgram(currentMember.id);

        if (!response.program) 
        {
            container.innerHTML = `<p style="color: var(--text-muted);">No program found.</p>`;
            return;
        }
        const program = response.program;
        const videos = await getExerciseVideos();
        const programHtml = program.days.map(day => `
            <div class="workout-day-card">
                <h3 class="workout-day-header">${day.dayName}</h3>
                <div style="padding: 10px;">
                    ${day.exercises.map((ex, i) => {
                        //Find matching exercise video
                        const video = videos.find(v => v.name.toLowerCase() === ex.name.toLowerCase());
                    
                        return `
                        <div class="exercise-item">
                            <strong>${ex.name}</strong> - ${ex.setsReps}
                            <strong style="color: var(--accent);"> ${ex.notes ? '| ' + ex.notes : ''}</strong>
                             ${video ? `<button type="button" onclick="showExerciseVideo('${video.url}', '${ex.name}')" style="margin-top: 5px;">▶️ Watch Video</button>` : ''}
                            <label class="checkbox-container">
                                <input type="checkbox"> Mark as completed
                            </label>
                        </div>
                    `}).join('')}
                </div>
            </div>
        `).join('');

        container.innerHTML = `
        <p style="color: var(--text-muted);">Created: ${new Date(program.createdAt).toLocaleDateString()}</p>
        ${programHtml}
        
        <button type="button" onclick="downloadProgram('${currentMember.id}')"class="success">📥 Download PDF</button>
                   
        `;
    }catch (error) {
        console.log('Error loading program:', error);
        container.innerHTML = `<p style="color: var(--danger);">Error loading program.</p>`;
    }
}

async function handleRequestProgram() 
{
    const goal = document.getElementById('goalInput').value;
    const level = document.getElementById('levelInput').value;

    if (!goal || !level) {
        alert('Please fill in your goal and level');
        return;
    }
    try {
        const result = await requestProgram(currentMember.id, goal, level);
        alert('Program request submitted!');
        // Refresh member data
        const updated = await searchMember(currentMember.email);
        if (updated.ok) {
            currentMember = updated.data;
            const ProgramRequestResult = await getMemberRequest(currentMember.id);
            currentMember.programRequest = ProgramRequestResult.request;

            const programResult = await getProgram(currentMember.id);
            currentMember.program = programResult.program;
            loadDashboard();
        }
        // Clear inputs
        document.getElementById('goalInput').value = '';
        document.getElementById('levelInput').value = '';
    }
    catch (error) {
            console.log('Error requesting program:', error);
            alert('Error submitting request');
        }
    
}

async function loadExerciseLibrary()
{
    document.getElementById('exercise-library-header').innerText = '🎬 Exercise Video Library';
    const container = document.getElementById('exercise-library');

    try
    {
        const videos = await getExerciseVideos();
        if (videos.length === 0) {
            container.innerHTML = `<p style="color: var(--text-muted);">No exercise videos available.</p>`;
            return;
        }
        container.innerHTML = videos.map(v => {
        const embedUrl = getYoutubeEmbedUrl(v.url);
        console.log('Video URL:', v.url);
        console.log('Embed URL:', embedUrl);
        
        return `
            <div class="card">
                <strong>${v.name}</strong>
                <iframe 
                    width="100%" 
                    height="200" 
                    src="${embedUrl}" 
                    frameborder="0" 
                    allowfullscreen 
                    style="margin: 10px 0; border-radius: 8px;">
                </iframe>
            </div>
        `;
         }).join('');
    }
    catch (error) {
        console.log('Error loading exercise videos:', error);
        container.innerHTML = `<p style="color: var(--danger);">Error loading exercise videos.</p>`;
    }
}

function showExerciseVideo(url, name) {
    const embedUrl = getYoutubeEmbedUrl(url);
    document.getElementById('exercise-library-header').innerText = `🎬 Tutorial Video: ${name}`;
    document.getElementById('exercise-library').innerHTML = `
        <div class="card">
            <h3 style="color: var(--primary);">${name}</h3>
            <iframe 
                width="100%" 
                height="315" 
                src="${embedUrl}" 
                frameborder="0" 
                allowfullscreen 
                style="border-radius: 8px;">
            </iframe>
            <button type="button" onclick="loadExerciseLibrary()" style="margin-top: 10px;">← Back to Library</button>
        </div>
    `;
    
    // Scroll to video
    document.getElementById('exercise-library').scrollIntoView({ behavior: 'smooth' });
}


async function loadAITips() {
    const container = document.getElementById('ai-tips');
    container.innerHTML = '<p style="color: var(--accent);">🤔 Thinking...</p>';

    const goal = currentMember.programRequest ? currentMember.programRequest.goal : 'general fitness';
    const level = currentMember.programRequest ? currentMember.programRequest.level : 'beginner';

    let exercises = [];
    let dayName = 'General Workout';

    const daySelect = document.getElementById('selectDay');

    if(daySelect && currentMember.program) 
    {
        const selectedValue = daySelect.value;
        if (selectedValue === 'all') 
        {
            currentMember.program.days.forEach((day, index) => 
            {
                day.exercises.forEach(ex => {
                    exercises.push(ex.name);
                });
            });
            dayName = "All Days";
        }
        else
        {
            const dayIndex = parseInt(selectedValue);
            const selectedDay = currentMember.program.days[dayIndex];
            dayName = selectedDay.dayName;
            exercises = selectedDay.exercises.map(ex => ex.name);
        }
    }
            
        

    /*if (currentMember.program) {
        currentMember.program.days.forEach(day => {
            day.exercises.forEach(ex => {
                exercises.push(ex.name);
            });
        });
    } */

    try {
        const result = await getAITips(currentMember.name, goal, level, exercises);
        
        if (result.success) {
            container.innerHTML = `
                <div class="card" style="border-left-color: var(--primary);">
                    <h3 style="color: var(--primary); margin-top: 0;">💡 Tips for ${dayName}</h3>
                    <p style="color: var(--text-muted); margin-bottom: 10px;">
                        Exercises: ${exercises.length > 0 ? exercises.join(', ') : 'General fitness'}
                    </p>
                    <p style="white-space: pre-line;">${result.tips}</p>
                </div>
            `;
        }
    } catch (error) {
        console.log('Error getting AI tips:', error);
        container.innerHTML = '<p style="color: var(--danger);">Error getting AI tips.</p>';
    }
}




function loadDaySelector() 
{
    const container = document.getElementById('day-selector');

    if (!currentMember.program) {
        container.innerHTML = '<p style="color: var(--text-muted);">No program yet - tips will be general.</p>';
        return;
    }

    container.innerHTML = `
        <label for="selectDay" style="color: var(--text-muted);">Select workout day:</label>
        <select id="selectDay" style="margin-left: 10px;">
            <option value="all">All Days (General Tips)</option>
            ${currentMember.program.days.map((day, index) => `
                <option value="${index}">${day.dayName}</option>
            `).join('')}
        </select>
    `;
}

window.onload = init;































































