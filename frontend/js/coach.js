// ============ COACH.JS ============

let dayCount = 1;

// ============ MEMBER MANAGEMENT ============

async function handleAddMember() {
    const name = document.getElementById("memberName").value;
    const email = document.getElementById("memberEmail").value;
    const phone = document.getElementById("memberPhone").value;
    const plan = document.getElementById("memberPlan").value;

    if (name && email) {
        try {
            const result = await addMember(name, email, phone, plan);
            console.log("Success adding member");
            alert('Member added');
            document.getElementById("memberName").value = "";
            document.getElementById("memberEmail").value = "";
            document.getElementById("memberPhone").value = "";
        } catch (error) {
            console.log("Error adding member:", error);
        }
    } else {
        alert('Please fill name and email');
        return;
    }
    loadMembers();
}

async function loadMembers() {
    const members = await getMembers();
    
    document.getElementById('members-list').innerHTML = members.map(m => {
        // Status icon and class
        let statusIcon, statusClass;
        if (m.status === 'active') {
            statusIcon = '✅';
            statusClass = 'status-active';
        } else if (m.status === 'expiring') {
            statusIcon = '⚠️';
            statusClass = 'status-expiring';
        } else {
            statusIcon = '❌';
            statusClass = 'status-expired';
        }

        const endDate = new Date(m.endDate).toLocaleDateString();

        // Program section with buttons
        let programSection = '';
        if (m.program != null) {
            programSection = `
                <span style="color: var(--success);">✅ Has Program</span>
                <button type="button" onclick="viewMemberProgram(${m.id})" style="margin-left: 10px;">👁️ View</button>
                <a href="${API}/members/${m.id}/download" target="_blank">
                    <button type="button">📥 Download</button>
                </a>
            `;
        } else if (m.programRequest && m.programRequest.status === 'pending') {
            programSection = `<span style="color: var(--accent);">📋 Program Requested</span>`;
        } else {
            programSection = `<span style="color: var(--text-muted);">No program yet</span>`;
        }

        return `
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong>👤 ${m.name}</strong>
                    <span class="${statusClass}">${statusIcon} ${m.status.toUpperCase()}</span>
                </div>
                <p style="margin: 5px 0; color: var(--text-muted);">
                    Email: ${m.email} ${m.phone ? '| Phone: ' + m.phone : ''}
                </p>
                <p style="margin: 5px 0;">
                    Plan: ${m.plan} | Expires: ${endDate} | Days left: ${m.daysLeft}
                </p>
                <p style="margin: 5px 0;">${programSection}</p>
                <div style="margin-top: 10px;">
                    <button type="button" onclick="showRenewPopup(${m.id})">🔄 Renew</button>
                    <button type="button" class="danger" onclick="handleDeleteMember(${m.id})">🗑️ Delete</button>
                </div>
            </div>
        `;
    }).join('');
    
    loadPendingRequests();
    loadMemberSelect();
}

async function handleDeleteMember(id) {
    const confirmed = confirm("Are you sure you want to delete this member?");
    if (confirmed) {
        try {
            const response = await deleteMember(id);
            loadMembers();
        } catch (error) {
            alert("Error deleting member");
            console.log("Error deleting member:", error);
        }
    }
}

function showRenewPopup(id) {
    const section = document.getElementById('renew-section');
    section.innerHTML = `
        <div class="renew-popup">
            <h4>Renew Membership</h4>
            <select id="renewPlan">
                <option value="monthly">Monthly</option>
                <option value="3-month">3 Months</option>
                <option value="yearly">Yearly</option>
            </select>
            <br><br>
            <button onclick="handleRenew(${id})">Confirm</button>
            <button class="secondary" onclick="closeRenewPopup()">Cancel</button>
        </div>
    `;
}

function closeRenewPopup() {
    document.getElementById('renew-section').innerHTML = '';
}

async function handleRenew(id) {
    const newPlan = document.getElementById('renewPlan').value;
    try {
        const response = await renewMember(id, newPlan);
        alert('Membership renewed');
        loadMembers();
        closeRenewPopup();
    } catch (error) {
        alert('Error renewing membership');
        console.log('Error renewing membership:', error);
    }
}

// ============ VIEW PROGRAM ============

async function viewMemberProgram(memberId) {
    const response = await getProgram(memberId);
    
    if (!response.program) {
        alert('No program found');
        return;
    }
    
    const program = response.program;
    
    const programHtml = program.days.map(day => `
        <div style="margin-bottom: 15px;">
            <h4 style="color: var(--primary); margin: 0;">${day.dayName}</h4>
            ${day.exercises.map((ex, i) => `
                <p style="margin: 5px 0 5px 15px;">
                    ${i + 1}. <strong>${ex.name}</strong> - ${ex.setsReps} ${ex.notes ? '| ' + ex.notes : ''}
                </p>
            `).join('')}
        </div>
    `).join('');
    
    document.getElementById('renew-section').innerHTML = `
        <div class="renew-popup" style="max-height: 80vh; overflow-y: auto; width: 400px;">
            <h3 style="margin-top: 0; color: var(--primary);">📋 Workout Program</h3>
            <p style="color: var(--text-muted);">Created: ${new Date(program.createdAt).toLocaleDateString()}</p>
            <hr style="border-color: var(--text-muted);">
            ${programHtml}
            <hr style="border-color: var(--text-muted);">
            <button type="button" onclick="closeRenewPopup()">Close</button>
            <a href="${API}/members/${memberId}/download" target="_blank">
                <button type="button" class="success">📥 Download PDF</button>
            </a>
        </div>
    `;
}

// ============ PENDING REQUESTS ============

async function loadPendingRequests() {
    const members = await getMembers();
    const pendingRequests = members.filter(m => m.programRequest && m.programRequest.status === 'pending');

    if (pendingRequests.length === 0) {
        document.getElementById('pending-requests').innerHTML = '<p style="color: var(--text-muted);">No pending requests</p>';
        return;
    }

    document.getElementById('pending-requests').innerHTML = pendingRequests.map(m => `
        <div class="card pending">
            <strong>👤 ${m.name}</strong>
            <p style="margin: 5px 0; color: var(--text-muted);">
                Email: ${m.email} ${m.phone ? '| Phone: ' + m.phone : ''}
            </p>
            <p style="margin: 5px 0;">
                Goal: ${m.programRequest.goal} | Level: ${m.programRequest.level}
            </p>
            <p style="margin: 5px 0; color: var(--text-muted);">
                Requested: ${new Date(m.programRequest.requestedAt).toLocaleDateString()}
            </p>
            <button type="button" class="success" onclick="selectMemberForProgram(${m.id})">
                ✍️ Create Program
            </button>
        </div>
    `).join('');
}

function selectMemberForProgram(id) {
    document.getElementById('selectMember').value = id;
    document.getElementById('selectMember').scrollIntoView({ behavior: 'smooth' });
}

async function loadMemberSelect() {
    const members = await getMembers();
    const select = document.getElementById('selectMember');
    select.innerHTML = '<option value="">-- Select Member --</option>' +
        members.map(m => `
            <option value="${m.id}">${m.name} (${m.email})</option>
        `).join('');
}

// ============ CREATE PROGRAM ============

function addDay() {
    dayCount++;
    const div = document.createElement('div');
    div.className = 'day';
    div.setAttribute('data-day', dayCount);
    div.innerHTML = `
        <h4>Day ${dayCount}</h4>
        <input type="text" class="day-name" placeholder="Day name (e.g., Push Day)">
        <div class="day-exercises">
            <div class="exercise">
                <select class="ex-type">
                    <option value="strength">Strength</option>
                    <option value="cardio">Cardio</option>
                </select>
                <input type="text" placeholder="Exercise name" class="ex-name">
                <input type="text" placeholder="Sets x Reps (e.g., 4x8)" class="ex-sets-reps">
                <input type="text" placeholder="Notes" class="ex-notes">
            </div>
        </div>
        <button type="button" onclick="addExerciseToDay(${dayCount})">+ Add Exercise</button>
    `;
    document.getElementById('days').appendChild(div);
}

function addExerciseToDay(dayNumber) {
    const dayDiv = document.querySelector(`.day[data-day="${dayNumber}"]`);
    const exercisesDiv = dayDiv.querySelector('.day-exercises');

    const div = document.createElement('div');
    div.className = 'exercise';
    div.innerHTML = `
        <select class="ex-type">
            <option value="strength">Strength</option>
            <option value="cardio">Cardio</option>
        </select>
        <input type="text" placeholder="Exercise name" class="ex-name">
        <input type="text" placeholder="Sets x Reps (e.g., 4x8)" class="ex-sets-reps">
        <input type="text" placeholder="Notes" class="ex-notes">
    `;
    exercisesDiv.appendChild(div);
}

async function handleCreateProgram() {
    const memberId = document.getElementById('selectMember').value;

    if (!memberId) {
        alert('Please select a member');
        return;
    }

    const dayDivs = document.querySelectorAll('.day');
    const days = [];

    dayDivs.forEach((dayDiv, index) => {
        const dayName = dayDiv.querySelector('.day-name').value || `Day ${index + 1}`;
        const exerciseDivs = dayDiv.querySelectorAll('.exercise');
        const exercises = [];

        exerciseDivs.forEach(exDiv => {
            const type = exDiv.querySelector('.ex-type').value;
            const name = exDiv.querySelector('.ex-name').value;
            const setsReps = exDiv.querySelector('.ex-sets-reps').value;
            const notes = exDiv.querySelector('.ex-notes').value;

            if (name) {
                exercises.push({ type, name, setsReps, notes });
            }
        });

        if (exercises.length > 0) {
            days.push({ dayName, exercises });
        }
    });

    if (days.length === 0) {
        alert('Please add at least one exercise');
        return;
    }

    try {
        const result = await createProgram(memberId, days);
        alert('Program created successfully!');
        loadMembers();
        document.getElementById('selectMember').value = '';
        clearProgramForm();
    } catch (error) {
        alert('Error creating program');
        console.log('Error creating program:', error);
    }
}

function clearProgramForm() {
    document.getElementById('days').innerHTML = `
        <div class="day" data-day="1">
            <h4>Day 1</h4>
            <input type="text" class="day-name" placeholder="Day name (e.g., Push Day)">
            <div class="day-exercises">
                <div class="exercise">
                    <select class="ex-type">
                        <option value="strength">Strength</option>
                        <option value="cardio">Cardio</option>
                    </select>
                    <input type="text" placeholder="Exercise name" class="ex-name">
                    <input type="text" placeholder="Sets x Reps (e.g., 4x8)" class="ex-sets-reps">
                    <input type="text" placeholder="Notes" class="ex-notes">
                </div>
            </div>
            <button type="button" onclick="addExerciseToDay(1)">+ Add Exercise</button>
        </div>
    `;
    dayCount = 1;
}

// ============ EXERCISE VIDEOS ============

async function loadExerciseVideos() 
{
    const videos = await getExerciseVideos();
    const container = document.getElementById('video-list');
    
    if (videos.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted);">No exercise videos added yet.</p>';
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
                <button type="button" class="danger" onclick="handleDeleteExerciseVideo(${v.id})">🗑️ Delete</button>
            </div>
        `;
    }).join('');
}

async function handleAddVideo()
{
    const name = document.getElementById('exerciseName').value;
    const url = document.getElementById('youtubeUrl').value;
    if (!name || !url) {
        alert('Please fill in both name and URL');
        return;
    }
    try{
        const response = await addExerciseVideo(name, url);
        alert('Exercise video added');
        document.getElementById('exerciseName').value = '';
        document.getElementById('youtubeUrl').value = '';
        loadExerciseVideos();
    }
    catch(error)
    {
        alert('Error adding exercise video');
        console.log('Error adding exercise video:', error);
    }
}

async function handleDeleteExerciseVideo(id)
{
    const confirmed = confirm('Are you sure you want to delete this exercise video?');
    if (confirmed) {
        try {
            const response = await deleteExerciseVideo(id);
            alert('Exercise video deleted');
            loadExerciseVideos();
        } catch (error) {
            alert('Error deleting exercise video');
            console.log('Error deleting exercise video:', error);
        }
    }
}


// ============ LOAD ON START ============
loadMembers();
loadExerciseVideos();
