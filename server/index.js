const express = require('express');
const cors = require('cors');
const PDFDocument = require('pdfkit');
const fs = require('fs');

require('dotenv').config();

const { GoogleGenerativeAI} = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const port = 3000;
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('../frontend'));

let members = [];
let exerciseVideos = [];

// ============ TEST ============
app.get('/test', (req, res) => {
    res.send('Server is running!');
});

// ============ MEMBERS ============

// Add new member
app.post('/members', (req, res) => {
    const { name, email, phone, plan } = req.body;
    const date = new Date();
    let endDate = new Date(date);
    
    if (plan === 'monthly') {
        endDate.setMonth(endDate.getMonth() + 1);
    } else if (plan === '3-month') {
        endDate.setMonth(endDate.getMonth() + 3);
    } else if (plan === 'yearly') {
        endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const member = {
        id: Date.now(),
        name,
        email,
        phone,
        plan,
        status: 'active',
        startDate: date.toISOString(),
        endDate: endDate.toISOString(),
        programRequest: null,
        program: null
    };
    
    members.push(member);
    console.log('New member added:', member);
    res.json({ message: 'Member added', member });
});

// Get all members
app.get('/members', (req, res) => {
    const today = new Date();
    
    members.forEach(member => {
        const endDate = new Date(member.endDate);
        const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
        
        if (daysLeft < 0) {
            member.status = 'expired';
        } else if (daysLeft <= 7) {
            member.status = 'expiring';
        } else {
            member.status = 'active';
        }
        member.daysLeft = daysLeft;
    });
    
    res.json(members);
});

// Search member by email
app.get('/members/search/:email', (req, res) => {
    const search_email = req.params.email.toLowerCase();
    const member = members.find(m => m.email.toLowerCase().includes(search_email));
    
    if (member) {
        const today = new Date();
        const endDate = new Date(member.endDate);
        const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
        
        if (daysLeft < 0) {
            member.status = 'expired';
        } else if (daysLeft <= 7) {
            member.status = 'expiring';
        } else {
            member.status = 'active';
        }
        member.daysLeft = daysLeft;
        
        res.json(member);
    } else {
        res.status(404).json({ message: 'Member not found' });
    }
});

// Delete member
app.delete('/members/:id', (req, res) => {
    const memberId = parseInt(req.params.id);
    const index = members.findIndex(m => m.id === memberId);
    
    if (index !== -1) {
        members.splice(index, 1);
        res.json({ message: 'Member deleted' });
    } else {
        res.status(404).json({ message: 'Member not found' });
    }
});

// Renew membership
app.post('/members/:id/renew', (req, res) => {
    const memberId = parseInt(req.params.id);
    const { newplan } = req.body;
    const member = members.find(m => m.id === memberId);
    
    if (member) {
        const currentEndDate = new Date(member.endDate);
        let newEndDate = new Date(currentEndDate);
        
        if (newplan === 'monthly') {
            newEndDate.setMonth(newEndDate.getMonth() + 1);
        } else if (newplan === '3-month') {
            newEndDate.setMonth(newEndDate.getMonth() + 3);
        } else if (newplan === 'yearly') {
            newEndDate.setFullYear(newEndDate.getFullYear() + 1);
        }
        
        member.endDate = newEndDate.toISOString();
        member.plan = newplan;
        console.log('Membership renewed for member:', member);
        res.json({ message: 'Membership renewed', member });
    } else {
        res.status(404).json({ message: 'Member not found' });
    }
});

// ============ PROGRAM REQUESTS ============

// Member requests a program
app.post('/members/:id/request-program', (req, res) => {
    const member_id = parseInt(req.params.id);
    const { goal, level } = req.body;
    const member = members.find(m => m.id === member_id);
    
    if (member) {
        member.programRequest = {
            goal,
            level,
            status: 'pending',
            requestedAt: new Date()
        };
        res.json({ message: 'Program request received', member });
    } else {
        res.status(404).json({ message: 'Member not found' });
    }
});

// ============ PROGRAMS ============

// Coach creates program for member
app.post('/members/:id/create-program', (req, res) => {
    const member_id = parseInt(req.params.id);
    const { days } = req.body;
    const member = members.find(m => m.id === member_id);
    
    if (member) {
        const doc = new PDFDocument({ margin: 50 });
        const filename = `program_${member.id}_${Date.now()}.pdf`;
        const filepath = `./programs/${filename}`;

        if (!fs.existsSync('./programs')) {
            fs.mkdirSync('./programs');
        }

        doc.pipe(fs.createWriteStream(filepath));

        // === HEADER ===
        doc.rect(0, 0, doc.page.width, 120).fill('#1a1a2e');
        doc.fillColor('#ffffff')
           .fontSize(28)
           .text('WORKOUT PROGRAM', 50, 40, { align: 'center' });
        doc.fontSize(16)
           .text(`Athlete: ${member.name}`, 50, 80, { align: 'center' });

        doc.moveDown(4);

        // === DAYS ===
        let yPosition = 140;

        days.forEach((day, dayIndex) => {
            if (yPosition > 650) {
                doc.addPage();
                yPosition = 50;
            }

            doc.fillColor('#16213e')
               .rect(50, yPosition, doc.page.width - 100, 30)
               .fill();
            
            doc.fillColor('#ffffff')
               .fontSize(14)
               .text(day.dayName.toUpperCase(), 60, yPosition + 8);
            
            yPosition += 40;

            day.exercises.forEach((ex, exIndex) => {
                if (yPosition > 700) {
                    doc.addPage();
                    yPosition = 50;
                }

                doc.fillColor('#f0f0f0')
                   .rect(50, yPosition, doc.page.width - 100, 40)
                   .fill();
                
                doc.fillColor('#1a1a2e').fontSize(12);
                
                const exerciseText = `${exIndex + 1}. ${ex.name}`;
                const detailText = `${ex.setsReps} ${ex.notes ? '| ' + ex.notes : ''}`;
                
                doc.text(exerciseText, 60, yPosition + 8);
                doc.fillColor('#666666')
                   .fontSize(10)
                   .text(detailText, 60, yPosition + 24);
                
                yPosition += 50;
            });

            yPosition += 20;
        });

        // === FOOTER ===
        doc.fillColor('#999999')
           .fontSize(10)
           .text(`Generated on ${new Date().toLocaleDateString()}`, 50, doc.page.height - 50, { align: 'center' });

        doc.end();

        member.program = {
            days,
            filename,
            createdAt: new Date()
        };
        
        if (member.programRequest) {
            member.programRequest.status = 'completed';
        }

        console.log('Program created for member:', member.name);
        res.json({ message: 'Program created!', member });
        
    } else {
        res.status(404).json({ message: 'Member not found' });
    }
});

// Get member's program
app.get('/members/:id/program', (req, res) => {
    const member_id = parseInt(req.params.id);
    const member = members.find(m => m.id === member_id);
    
    if (member) {
        if (member.program != null) {
            res.json({ program: member.program });
        } else {
            res.json({ message: 'Program not found' });
        }
    } else {
        res.status(404).json({ message: 'Member not found' });
    }
});

// Download member's PDF
app.get('/members/:id/download', (req, res) => {
    const member_id = parseInt(req.params.id);
    const member = members.find(m => m.id === member_id);
    
    if (member && member.program && member.program.filename) {
        const filepath = `./programs/${member.program.filename}`;
        res.download(filepath);
    } else {
        res.status(404).json({ message: 'Program not found' });
    }
});


// ============ EXERCISE VIDEOS ============

// Get all exercise videos
app.get('/exercises', (req, res) => {
    res.json(exerciseVideos);
});

// add new exercise video
app.post('/exercises', (req, res) => {
    const { name, url } = req.body;
    const video = {
        id: Date.now(),
        name,
        url,
        createdAt: new Date()
    };
    exerciseVideos.push(video);
    console.log('New exercise video added:', video);
    res.json(video);
});

// delete exercise video
app.delete('/exercises/:id', (req, res) => {
    const videoId = parseInt(req.params.id);
    const index = exerciseVideos.findIndex(v => v.id === videoId);
    if (index !== -1) {
        exerciseVideos.splice(index, 1);
        res.json({ message: 'Video deleted' });
    } else {
        res.status(404).json({ message: 'Video not found' });
    }  
});



// ============ AI TIPS (with fallback models) ============

const AI_MODELS = [
    'gemma-3-4b-it',
    'gemma-3-1b-it',
    'gemini-2.0-flash-lite',
    'gemini-2.0-flash',
    'gemini-2.5-flash'
];

app.post('/ai/tips', async (req, res) => {
    const { memberName, goal, level, exercises } = req.body;
    
    const prompt = `You are a friendly gym coach. Give 3 short, personalized tips for this athlete:
        
Name: ${memberName}
Goal: ${goal}
Level: ${level}
Today's exercises: ${exercises.join(', ')}

Keep each tip to 1-2 sentences. Be motivational and specific to their workout.`;

    // Try each model until one works
    for (let i = 0; i < AI_MODELS.length; i++) {
        const modelName = AI_MODELS[i];
        
        try {
            console.log(`Trying model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const tips = response.text();
            
            console.log(`Success with model: ${modelName}`);
            res.json({ success: true, tips, model: modelName });
            return;  // Exit after success
            
        } catch (error) {
            console.log(`Model ${modelName} failed:`, error.message);
            // Continue to next model
        }
    }
    
    // All models failed - use backup tips
    console.log('All models failed, using backup tips');
    const backupTips = getBackupTips(memberName, goal, level);
    res.json({ success: true, tips: backupTips, model: 'backup' });
});

// Backup tips if all AI models fail
function getBackupTips(memberName, goal, level) {
    const tips = {
        strength: [
            "Focus on progressive overload - add weight or reps each week.",
            "Rest 2-3 minutes between heavy compound sets.",
            "Prioritize sleep for muscle recovery and strength gains."
        ],
        weightloss: [
            "Stay hydrated - drink water before, during, and after workouts.",
            "Combine cardio with strength training for best results.",
            "Focus on consistency over intensity."
        ],
        muscle: [
            "Eat protein within 30 minutes after your workout.",
            "Train each muscle group twice per week for optimal growth.",
            "Focus on the mind-muscle connection during each rep."
        ]
    };
    
    const goalKey = goal?.toLowerCase().includes('weight') ? 'weightloss' 
                  : goal?.toLowerCase().includes('muscle') ? 'muscle' 
                  : 'strength';
    
    const selectedTips = tips[goalKey];
    
    return `Hey ${memberName}! Here are your tips:\n\n` +
           `1. ${selectedTips[0]}\n\n` +
           `2. ${selectedTips[1]}\n\n` +
           `3. ${selectedTips[2]}\n\n` +
           `Keep pushing! 💪`;
}








/*app.post('/ai/tips', async (req, res) => {

    const {memberName, goal, level, exercises} = req.body;

    try
    {

        const model = genAI.getGenerativeModel({model: 'gemma-3-4b-it' });

        const prompt = `You are a friendly gym coach. Give 3 short, personalized tips for this athlete:
        
        Name: ${memberName}
        Goal: ${goal}
        Level: ${level}
        Today's exercises: ${exercises.join(', ')}

        Keep each tip to 1-2 sentences. Be motivational and specific to their workout.`;

        const result = await model.generateContent(prompt);
        const response = result.response;

        const tips = response.text();

        res.json({success: true, tips});

        

    }catch(error){
        console.error('Error generating AI tips:', error);
        res.status(500).json({ success: false, message: 'Failed to generate tips' });
    }





});*/

//test: list available models
app.get('/ai/models', async (req, res) => {

    try
    {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_KEY || API_KEY}`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching AI models:', error);
        res.status(500).json({ message: 'Failed to fetch AI models' });
    }
    


});


// ============ START SERVER ============
app.listen(port, () => {
    console.log(`🏋️ Gym server running at http://localhost:${port}`);
});
