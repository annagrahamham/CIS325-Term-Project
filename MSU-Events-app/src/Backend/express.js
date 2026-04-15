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

    db.all('SELECT * FROM Events', [], (err, rows) => {
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


//Organizations CRUD
    //CREATE
    app.post('/api/organizations', (req, res) => {
        const {OrganizationID_PK, OrganizationName, Description, PrimaryOrganizerID_FK, ContactEmail, ContactPhone} = req.body;
        if (!OrganizationName) {
            return res.status(400).json({ error: 'Name is required.' });
        }
        db.run(
            `INSERT INTO Organizations
            (OrganizationID_PK, OrganizationName, Description, PrimaryOrganizerID_FK, ContactEmail, ContactPhone)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [OrganizationID_PK || null, OrganizationName,Description || null, PrimaryOrganizerID_FK || null, ContactEmail || null, ContactPhone || null],
            function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Organization created', OrganizationID_PK: this.lastID });
            })})

    //READ ALL
    app.get('/api/organizations', (req, res) => {

        db.all('SELECT * FROM Organizations', [], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
        });

    //READ ONE
    app.get('/api/organizations/:id', (req, res) => {

        db.get('SELECT * FROM Organizations WHERE OrganizationID_PK = ?'
            , [req.params.id], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!row) return res.status(404).json({ error: 'Organization not found' });
            res.json(row);
        });
        });

    //UPDATE
    app.put('/api/organizations/:id', (req, res) => {
        const {OrganizationID_PK, OrganizationName, Description, PrimaryOrganizerID_FK, ContactEmail, ContactPhone} = req.body;
        if (!OrganizationName) {
            return res.status(400).json({ error: 'Name is required.' });
        }
        db.run(
            `UPDATE Organizations
            SET OrganizationID_PK = ?, OrganizationName = ?, Description = ?,PrimaryOrganizerID_FK= ?, ContactEmail = ?, ContactPhone = ?
            WHERE OrganizationID_PK = ? `,
            [OrganizationID_PK || null, OrganizationName,Description || null, PrimaryOrganizerID_FK || null, ContactEmail || null, ContactPhone || null, req.params.id],
            function (err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'Organization not found' });
            res.json({ message: 'Organization updated' });
            
            })})
    //DELETE
    app.delete('/api/organizations/:id', (req, res) => {
        const sql = 'DELETE FROM Organizations WHERE OrganizationID_PK = ?';

        db.run(sql, [req.params.id], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'Organization not found' });
            res.json({ message: 'Organization deleted' });
        });
        });



//Users CRUD
    //CREATE
    app.post('/api/users', (req, res) => {
        const {UserID_PK,FirstName,LastName,Email,PhoneNumber,Password,Role,Major} = req.body;
        if (!FirstName || !LastName || !Email || !Password) {
            return res.status(400).json({ error: 'First name, Last name, Email, and Password are required.' });
        }
        db.run(
            `INSERT INTO Users
            (UserID_PK,FirstName,LastName,Email,PhoneNumber,Password,Role,Major)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [UserID_PK || null,FirstName,LastName,Email,PhoneNumber || null ,Password,Role || null,Major || null],
            function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'User created', UserID_PK: this.lastID });
            })})

    //READ ALL
    app.get('/api/users', (req, res) => {

        db.all('SELECT * FROM Users', [], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
        });

    //READ ONE
    app.get('/api/users/:id', (req, res) => {

        db.get('SELECT * FROM Users WHERE UserID_PK = ?'
            , [req.params.id], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!row) return res.status(404).json({ error: 'User not found' });
            res.json(row);
        });
        });

    //UPDATE
    app.put('/api/users/:id', (req, res) => {
        const {UserID_PK,FirstName,LastName,Email,PhoneNumber,Password,Role,Major} = req.body;
    if (!FirstName || !LastName || !Email || !Password) {
            return res.status(400).json({ error: 'First name, Last name, Email, and Password are required.' });
        }
        db.run(
            `UPDATE Users
            SET UserID_PK = ?, FirstName = ?, LastName = ?, Email = ?, PhoneNumber = ?, Password = ?, Role = ?, Major = ?
            WHERE UserID_PK = ? `,
            [UserID_PK || null, FirstName, LastName, Email, PhoneNumber || null, Password, Role || null, Major || null, req.params.id],
            function (err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'User not found' });
            res.json({ message: 'User updated' });
            
            })})
    //DELETE
    app.delete('/api/users/:id', (req, res) => {
        const sql = 'DELETE FROM Users WHERE UserID_PK = ?';

        db.run(sql, [req.params.id], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'User not found' });
            res.json({ message: 'User deleted' });
        });
        });


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});