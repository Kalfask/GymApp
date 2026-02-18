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
