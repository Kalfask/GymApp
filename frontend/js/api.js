const API = 'http://localhost:3000';

// ============ MEMBERS ============

// Get all members
async function getMembers() {
    const response = await fetch(`${API}/members`);
    return await response.json();
}

// Add new member
async function addMember(name, email, phone, plan) {
    const response = await fetch(`${API}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, plan })
    });
    return await response.json();
}

// Delete member
async function deleteMember(id) {
    const response = await fetch(`${API}/members/${id}`, {
        method: 'DELETE'
    });
    return await response.json();
}

// Renew membership
async function renewMember(id, newplan) {
    const response = await fetch(`${API}/members/${id}/renew`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newplan })
    });
    return await response.json();
}

// Search member by email
async function searchMember(email) {
    const response = await fetch(`${API}/members/search/${email}`);
    return { ok: response.ok, data: await response.json() };
}

// ============ PROGRAMS ============

// Request a program
async function requestProgram(memberId, goal, level) {
    const response = await fetch(`${API}/members/${memberId}/request-program`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, level })
    });
    return await response.json();
}

// Create program for member
async function createProgram(memberId, days) {
    const response = await fetch(`${API}/members/${memberId}/create-program`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days })
    });
    return await response.json();
}

// Get member's program
async function getProgram(memberId) {
    const response = await fetch(`${API}/members/${memberId}/program`);
    return await response.json();
}



// ============ EXERCISE VIDEOS ============
// get all exercise video
async function getExerciseVideos() 
{
    const response = await fetch(`${API}/exercises`);
    return await response.json();
}

// add new exercise video
async function addExerciseVideo(name, url) 
{
        const response = await fetch(`${API}/exercises`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, url })
        });
        return await response.json();
}
   
//delete exercise video
async function deleteExerciseVideo(id) 
{
    const response = await fetch(`${API}/exercises/${id}`, {
        method: 'DELETE'
    });
    return await response.json();
}


//Convert Youtube URL to embeddable format
function getYoutubeEmbedUrl(url) 
    {
        let videoId = '';
        if(url.includes('watch?v=')) {
            videoId = url.split('watch?v=')[1].split('&')[0];
        } else if(url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1].split('?')[0];
        } else if(url.includes('youtube.com/embed/')) {
            videoId = url.split('youtube.com/embed/')[1].split('?')[0];
        }
        return `https://www.youtube.com/embed/${videoId}`;
    }


