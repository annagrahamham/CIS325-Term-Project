import express from 'express';
import { db } from './server.js';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.get('/api/health', (req,res) => {
    res.json({ok:true, message:'API is running'})
})


//EVENTS CRUD
    //CREATE
    app.post('/api/events', (req, res) => {
    const { OrganizationID_FK, EventName, EventType, Description, Location, StartTime, EndTime } = req.body;
    if (!EventName || !Location || !StartTime || !EndTime) {
        return res.status(400).json({ error: 'Event Name, Location, Start Time, and End Time are required.' });
    }
    db.run(
        `INSERT INTO Events
        (OrganizationID_FK, EventName, EventType, Description, Location, StartTime, EndTime)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [OrganizationID_FK || null, EventName, EventType || null, Description || null, Location, StartTime, EndTime],
        function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Event created', EventID_PK: this.lastID });
        })})


    //READ ALL
    app.get('/api/events', (req, res) => {
    const sql = 'SELECT * FROM Events ORDER BY EventID_PK DESC';

    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
    });

    //READ ONE
    app.get('/api/events/:id', (req, res) => {
    

    db.get('SELECT * FROM Events WHERE EventID_PK = ?'
        , [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Event not found' });
        res.json(row);
    });
    });

    //UPDATE
    app.put('/api/events/:id', (req, res) => {
    const { OrganizationID_FK, EventName, EventType, Description, Location, StartTime, EndTime } = req.body;
    if (!EventName || !Location || !StartTime || !EndTime) {
        return res.status(400).json({ error: 'Event Name, Location, Start Time, and End Time are required.' });
    }
    db.run(
        `UPDATE Events
        SET OrganizationID_FK = ?, EventName = ?, EventType = ?, Description = ?, Location = ?, StartTime = ?, EndTime = ?
        WHERE EventID_PK = ? `,
        [OrganizationID_FK || null, EventName, EventType || null, Description || null, Location, StartTime, EndTime, req.params.id],
        function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Event not found' });
        res.json({ message: 'Event updated' });
        
        db.get('SELECT * FROM Events WHERE EventID_PK = ?'
        , [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Event not found' });
        res.json(row);
    });
        })})


    //DELETE
    app.delete('/api/events/:id', (req, res) => {
    const sql = 'DELETE FROM Events WHERE EventID_PK = ?';

    db.run(sql, [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Event not found' });
        res.json({ message: 'Event deleted' });
    });
    });

//not sure what tables also need CRUD operations, can be added later when they are needed


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});