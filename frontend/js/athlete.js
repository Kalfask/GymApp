// ============ ATHLETE.JS ============

let currentMember = null;

// ============ LOGIN ============

async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    
    if (!email) {
        alert('Please enter your email');
        return;
    }
    
    try {
        const result = await searchMember(email);
        
        if (result.ok) {
            currentMember = result.data;
            document.getElementById('login-section').classList.add('hidden');
            document.getElementById('dashboard').classList.remove('hidden');
            loadDashboard();
        } else {
            alert('Member not found. Please check your email.');
        }
    } catch (error) {
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

// ============ DASHBOARD ============

function loadDashboard() {
    displayMembershipStatus();
    displayRequestSection();
    displayMyProgram();
}

function displayMembershipStatus() {
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

function displayRequestSection() {
    const formDiv = document.getElementById('request-form');
    const statusDiv = document.getElementById('request-status');
    
    if (currentMember.program != null) {
        // Already has a program
        formDiv.classList.add('hidden');
        statusDiv.innerHTML = `
            <div class="card" style="border-left-color: var(--success);">
                <p style="color: var(--success);">✅ You already have a workout program!</p>
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

async function displayMyProgram() {
    const container = document.getElementById('my-program');
    
    if (currentMember.program == null) {
        container.innerHTML = `
            <p style="color: var(--text-muted);">You don't have a workout program yet.</p>
        `;
        return;
    }
    
    try {
        const response = await getProgram(currentMember.id);
        
        if (!response.program) {
            container.innerHTML = `<p style="color: var(--text-muted);">No program found.</p>`;
            return;
        }
        
        const program = response.program;
        
        const programHtml = program.days.map(day => `
            <div class="workout-day-card">
                <h3 class="workout-day-header">${day.dayName}</h3>
                <div style="padding: 10px;">
                    ${day.exercises.map((ex, i) => `
                        <div class="exercise-item">
                            <strong>${i + 1}. ${ex.name}</strong>
                            <p style="margin: 5px 0; color: var(--text-muted);">
                                ${ex.setsReps} ${ex.notes ? '| ' + ex.notes : ''}
                            </p>
                            <label class="checkbox-container">
                                <input type="checkbox"> Mark as completed
                            </label>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
        
        container.innerHTML = `
            <p style="color: var(--text-muted);">Created: ${new Date(program.createdAt).toLocaleDateString()}</p>
            ${programHtml}
            <a href="${API}/members/${currentMember.id}/download" target="_blank">
                <button type="button" class="success">📥 Download PDF</button>
            </a>
        `;
        
    } catch (error) {
        console.log('Error loading program:', error);
        container.innerHTML = `<p style="color: var(--danger);">Error loading program.</p>`;
    }
}

// ============ REQUEST PROGRAM ============

async function handleRequestProgram() {
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
            loadDashboard();
        }
        
        // Clear inputs
        document.getElementById('goalInput').value = '';
        document.getElementById('levelInput').value = '';
        
    } catch (error) {
        console.log('Error requesting program:', error);
        alert('Error submitting request');
    }
}
