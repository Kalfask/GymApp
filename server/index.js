const express = require('express');
const cors = require('cors');
const PDFDocument = require('pdfkit');
const fs = require('fs');

require('dotenv').config();

const { GoogleGenerativeAI} = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const { createClient } = require('@supabase/supabase-js');
const { request } = require('http');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

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


// add new member with Supabase
app.post('/members', async (req, res) => 
{
    const { name, email, phone, plan } = req.body;
    const start_date = new Date();
    let end_date = new Date();
    if (plan === 'monthly') {
        end_date.setMonth(end_date.getMonth() + 1);
    } else if (plan === '3-month') {
        end_date.setMonth(end_date.getMonth() + 3);
    } else if (plan === 'yearly') {
        end_date.setFullYear(end_date.getFullYear() + 1);
    }

    try
    {
        const { data, error } = await supabase
            .from('members')
            .insert(
                { name, email, phone, plan, start_date: start_date.toISOString(), end_date: end_date.toISOString() })
            .select()
            .single();

        if (error) {
            throw error;
        }
        console.log('New member added to Supabase:', data);
        res.json({ message: 'Member added', member: data });
                
    }
    catch(error)    {
        console.error('Error adding member to Supabase:', error);
        res.status(500).json({ message: 'Failed to add member' });
    }

});



// Add new member with arrays

/*app.post('/members', (req, res) => {
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
*/


//Get all members from Supabase
app.get('/members', async (req, res) => {
    try
    {
        const { data, error } = await supabase
            .from('members')
            .select(`
                *,programs(*),
                program_requests(*)`
            );
        if (error) {
            throw error;
        }
        console.log('Raw data from Supabase:', JSON.stringify(data, null, 2));

        const today = new Date();
        data.forEach(member => {
            const endDate = new Date(member.end_date);
            const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

        if (daysLeft < 0) {
            member.status = 'expired';
        } else if (daysLeft <= 7) {
            member.status = 'expiring';
        } else {
            member.status = 'active';
        }
        member.daysLeft = daysLeft;
        member.startDate = new Date(member.start_date);
        member.endDate = endDate;
        
        if(member.programs && member.programs.length > 0)
        {
            member.program ={
                days: member.programs[0].days,
                fileUrl: member.programs[0].file_url,
                createdAt: member.programs[0].created_at
            }
        }
        else
        {
            member.program = null;
        }
        delete member.programs; // Remove the original programs field to avoid confusion

            if(member.program_requests && member.program_requests.length > 0)
            {
                member.programRequest = {
                    goal: member.program_requests[0].goal,
                    level: member.program_requests[0].level,
                    status: member.program_requests[0].status,
                    requestedAt: member.program_requests[0].created_at
                }
            }
            else{
                member.programRequest = null;
            }
            delete member.program_requests; // Remove original program_requests field
        });

        res.json(data);
    }
    catch(error) {
        console.error('Error fetching members from Supabase:', error);
        res.status(500).json({ message: 'Failed to fetch members' });
    }
});


// Get all members with arrays (without Supabase)
/*app.get('/members', (req, res) => {
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
*/

//Search member by email with Supabase
app.get('/members/search/:email', async (req, res) => {
    const search_email = req.params.email.toLowerCase();
    
    try {
        const { data, error } = await supabase
            .from('members')
            .select('*')
            .eq('email', search_email)
            .single();
        
        if (error) {
            throw error;
        }

        // data IS the member (not data.member)
        const today = new Date();
        const endDate = new Date(data.end_date);
        const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
    
        if (daysLeft < 0) {
            data.status = 'expired';
        } else if (daysLeft <= 7) {
            data.status = 'expiring';
        } else {
            data.status = 'active';
        }
        data.daysLeft = daysLeft;
        
        // Add camelCase for frontend
        data.endDate = data.end_date;
        data.startDate = data.start_date;

        res.json(data);
    }
    catch(error) {
        console.error('Error searching member by email:', error);
        // Could be not found OR other error
        res.status(404).json({ message: 'Member not found' });
    }
});


// Search member by email (without Supabase, using arrays)
/*app.get('/members/search/:email', (req, res) => {
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
});*/


//Delete member from Supabase
app.delete('/members/:id', async (req, res) => {
    const memberId = req.params.id; // No need to parseInt since Supabase IDs are strings
    try {
        const { data, error } = await supabase
            .from('members')
            .delete()
            .eq('id', memberId);
        if (error) {
            throw error;
        }
        res.json({ message: 'Member deleted' });
    } catch (error) {
        console.error('Error deleting member from Supabase:', error);
        res.status(500).json({ message: 'Failed to delete member' });
    }
});



// Delete member (without Supabase, using arrays)
/*app.delete('/members/:id', (req, res) => {
    const memberId = parseInt(req.params.id);
    const index = members.findIndex(m => m.id === memberId);
    
    if (index !== -1) {
        members.splice(index, 1);
        res.json({ message: 'Member deleted' });
    } else {
        res.status(404).json({ message: 'Member not found' });
    }
});*/

// Renew membership with Supabase
app.post('/members/:id/renew', async (req, res) => {
    const memberId = req.params.id; // No need to parseInt since Supabase IDs are strings
    const { newplan } = req.body;
    

    try
    {
        // Get the member first
        const { data, error } = await supabase
            .from('members')
            .select('*')
            .eq('id', memberId)
            .single();
        if (error) {
            throw error;
        }
        const member = data;

        const currentEndDate = new Date(member.end_date);
        let newEndDate = new Date(currentEndDate);
        if (newplan === 'monthly') {
            newEndDate.setMonth(newEndDate.getMonth() + 1);
        } else if (newplan === '3-month') {
            newEndDate.setMonth(newEndDate.getMonth() + 3);
        } else if (newplan === 'yearly') {
            newEndDate.setFullYear(newEndDate.getFullYear() + 1);
        }
        await supabase
            .from('members')
            .update({ plan: newplan, end_date: newEndDate.toISOString() })
            .eq('id', memberId);
        console.log('Membership renewed for member:', member.name);
        res.json({ message: 'Membership renewed' });
        
    } catch (error) {
        console.error('Error renewing membership:', error);
        res.status(500).json({ message: 'Failed to renew membership' });
    }

});

// Renew membership with arrays (without Supabase)
/*app.post('/members/:id/renew', (req, res) => {
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
});*/

// ============ PROGRAM REQUESTS ============

// Coach requests a program for member with Supabase
app.post('/members/:id/request-program', async (req, res) => {
    const memberId = req.params.id; // No need to parseInt since Supabase IDs are strings
    const { goal, level } = req.body;
    
    try{
        const {data: existing} = await supabase            
            .from('program_requests')
            .select('*')
            .eq('member_id', memberId)
            .maybeSingle();

        if (!existing) {
             const { data, error } = await supabase
            .from('program_requests')
            .insert({
            member_id: memberId,
            goal,
            level,
            status: 'pending'
        });
            if (error) {
            throw error;
            }
            console.log('Program request created for member ID:', memberId);
            res.json({ message: 'Program request received' });
        }
        else
        {
            console.log('Overriding pending program request for member ID:', memberId);
            const { data, error } = await supabase
            .from('program_requests')
            .update({ goal, level, status: 'pending' })
            .eq('id', existing.id);
            if (error) {
                throw error;
            }
            res.json({ message: 'Existing program request updated' });
    }

       
    }
    catch(error) {
        console.error('Error creating program request:', error);
        res.status(500).json({ message: 'Failed to create program request' });
    }

});





// Member requests a program with arrays (without Supabase)
/*app.post('/members/:id/request-program', (req, res) => {
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
});*/

// ============ PROGRAMS ============

// Coach creates program for member with Supabase
app.post('/members/:id/create-program', async (req, res) => {
    const memberId = req.params.id; // No need to parseInt since Supabase IDs are strings
    const { days } = req.body;
    

    try
    {
        const { data: memberData, error: memberError } = await supabase
            .from('members')
            .select('*')
            .eq('id', memberId)
            .single();
        
        if (memberError) {
            throw memberError;
        }
   

        const member = memberData;

        const pdfBuffer = await new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            const chunks = [];
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
       


        /*const doc = new PDFDocument({ margin: 50 });
        const filename = `program_${member.id}_${Date.now()}.pdf`;
        const filepath = `./programs/${filename}`;

        if (!fs.existsSync('./programs')) {
            fs.mkdirSync('./programs');
        }

        doc.pipe(fs.createWriteStream(filepath));*/

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

        }); // End of PDF generation and get buffer

        /*member.program = {
            days,
            filename,
            createdAt: new Date()
        };*/

        const filename = `program_${member.id}.pdf`;
        const { data, error } = await supabase
            .storage
            .from('programs')
            .upload(filename, pdfBuffer, {
                contentType: 'application/pdf',
                upsert: true
            });
        if (error) {
            throw error;
        }
        const { data: urlData } = await supabase
        .storage.from('programs')
        .getPublicUrl(filename);

        const fileUrl = urlData.publicUrl;

        //If there was a pending program request, mark it as completed
        await supabase
            .from('program_requests')
            .update({ status: 'completed' })
            .eq('member_id', memberId)
            .eq('status', 'pending');

        //If a program already exists for this member, update it. Otherwise, insert new
        const { data: existingProgram } = await supabase
            .from('programs')
            .select('*')
            .eq('member_id', memberId)
            .maybeSingle();
        if (existingProgram) {
            {
                const { data, error } = await supabase
                .from('programs')
                .update({ days, file_url: fileUrl, created_at: new Date().toISOString() })
                .eq('member_id', memberId);
            }
        } else {
            const { data, error } = await supabase
            .from('programs')
            .insert({ member_id: memberId, days, file_url: fileUrl, created_at: new Date().toISOString() });
        }
        res.json({ message: 'Program created!', member: { ...member, program: { days, fileUrl } } });
    
     }
    catch(error) {
        console.error('Error finding member for program creation:', error);
        res.status(404).json({ message: 'Member not found' });
        return;
    }

});


// Coach creates program for member with arrays (without Supabase)
/*app.post('/members/:id/create-program', (req, res) => {
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
});*/

// Get member's program with Supabase
app.get('/members/:id/program', async (req, res) => {
    const memberId = req.params.id; // No need to parseInt since Supabase IDs are strings

    try{
        const { data: programData, error: programError } = await supabase
        .from('programs')
        .select('*')
        .eq('member_id', memberId)
        .maybeSingle();
        if (programError) {
            throw programError;
        }
        if (!programData) {
            res.json({ program: null });
            return;
        }
        res.json({ program: { days: programData.days, fileUrl: programData.file_url, createdAt: programData.created_at }});
    }
    catch(error) {
        console.error('Error fetching program for member:', error);
        res.status(404).json({ message: 'Program not found' });
    }
});

// Get member's program without Supabase
/*app.get('/members/:id/program', (req, res) => {
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
});*/


//GET member's requested program with Supabase
app.get('/members/:id/request', async (req, res) => {
    const memberId = req.params.id; // No need to parseInt since Supabase IDs are strings

    try{
        const { data: requestData, error: requestError } = await supabase
        .from('program_requests')
        .select('*')
        .eq('member_id', memberId)
        .maybeSingle();

        if (requestError) {
            throw requestError;
        }
        if (!requestData) {
            res.status(200).json({ request: null });
            return;
        }
        res.json({ request: {
            goal: requestData.goal,
            level: requestData.level,
            status: requestData.status,
            requestedAt: requestData.created_at
        } });
    }
    catch(error) {
        console.error('Error fetching program request for member:', error);
        res.status(500).json({ message: 'Program request not found' });
    }
});

// Download member's PDF with Supabase
app.get('/members/:id/download', async (req, res) => {
    const memberId = req.params.id; // No need to parseInt since Supabase IDs are strings

    try{
        const { data: programData, error: programError } = await supabase
        .from('programs')
        .select('*')
        .eq('member_id', memberId)
        .maybeSingle();

        if (programError) {
            throw programError;
        }
        if (!programData || !programData.file_url) {
            res.status(404).json({ message: 'Program not found or file URL missing' });
            return;
        }

        const fileUrl = programData.file_url;
        res.redirect(fileUrl);

    }catch(error) {
        console.error('Error fetching program for download:', error);
        res.status(404).json({ message: 'Program not found' });
        return;
    }
});

// Download member's PDF with arrays (without Supabase)
/*app.get('/members/:id/download', (req, res) => {
    const member_id = parseInt(req.params.id);
    const member = members.find(m => m.id === member_id);
    
    if (member && member.program && member.program.filename) {
        const filepath = `./programs/${member.program.filename}`;
        res.download(filepath);
    } else {
        res.status(404).json({ message: 'Program not found' });
    }
});*/


// ============ EXERCISE VIDEOS ============


// Get all exercise videos with Supabase
app.get('/exercises', async (req, res) => {

    try{
        const { data, error } = await supabase
        .from('exercise_videos')
        .select('*')

        if (error) {
            throw error;
        }
        res.json(data);
    }
    catch(error) {
        console.error('Error fetching exercise videos:', error);
        res.status(500).json({ message: 'Error fetching exercise videos' });
    }
});

// Get all exercise videos without Supabase
/*app.get('/exercises', (req, res) => {
    res.json(exerciseVideos);
});*/


// Add new exercise video with Supabase
app.post('/exercises', async (req, res) => {
    const { name, url } = req.body;

    try
    {
        const { data, error } = await supabase
        .from('exercise_videos')
        .insert({ name, url, created_at: new Date().toISOString() })
        .select()
        .single();
        if (error) {
            throw error;
        }
        console.log('New exercise video added to Supabase:', data);
        res.json(data);
    }
    catch(error) 
    {
        console.error('Error adding exercise video:', error);
        res.status(500).json({ message: 'Failed to add exercise video' });
    }
});

// add new exercise video without Supabase
/*app.post('/exercises', (req, res) => {
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
});*/

// Delete exercise video with Supabase
app.delete('/exercises/:id', async (req, res) => {
    const videoId = req.params.id; // No need to parseInt since Supabase IDs are strings
    try
    {
        const { data, error } = await supabase
        .from('exercise_videos')
        .delete()
        .eq('id', videoId);
        if (error) {
            throw error;
        }
        res.json({ message: 'Video deleted successfully' });
    }
    catch(error) {
        console.error('Error deleting exercise video:', error);
        res.status(500).json({ message: 'Failed to delete exercise video' });
    }
});


// delete exercise video without Supabase
/*app.delete('/exercises/:id', (req, res) => {
    const videoId = parseInt(req.params.id);
    const index = exerciseVideos.findIndex(v => v.id === videoId);
    if (index !== -1) {
        exerciseVideos.splice(index, 1);
        res.json({ message: 'Video deleted' });
    } else {
        res.status(404).json({ message: 'Video not found' });
    }  
});*/



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

Rules:
-Greet the athlete by name and encourage them
- Keep each tip to 1-2 sentences
- Be motivational and specific to their exercises
- DO NOT ask any questions
- DO NOT request more information
- Just give the 3 tips and end with encouragement`;

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
