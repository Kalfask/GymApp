const express = require('express');
const cors = require('cors');
const PDFDocument = require('pdfkit');
const fs = require('fs');

const port = 3000;
const app = express();

app.use(cors());
app.use(express.json());

let members = [];

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

// ============ START SERVER ============
app.listen(port, () => {
    console.log(`🏋️ Gym server running at http://localhost:${port}`);
});
