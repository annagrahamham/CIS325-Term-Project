import express from 'express';
import cors from 'cors';
import { db } from './server.js';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get('/api/health', (req, res) => {
    res.json({ ok: true, message: 'API is running' })
})


//EVENTS CRUD
    //CREATE
    app.post('/api/events', (req, res) => {
        const {OrganizationID_FK, EventName, EventType, Description, Location, StartTime, EndTime } = req.body;
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
                return res.status(201).json({ message: 'Event created', EventID_PK: this.lastID });
            })});

    //READ ALL
    app.get('/api/events', (req, res) => {
        db.all(
            `SELECT Events.*, Organizations.OrganizationName
            FROM Events LEFT JOIN Organizations  
            ON Organizations.OrganizationID_PK = Events.OrganizationID_FK
            ORDER BY datetime(Events.StartTime) ASC`,
            [],
            (err, rows) => {
                if (err) return res.status(500).json({ error: err.message });
                return res.json(rows);
            })});

    //READ ONE
    app.get('/api/events/:id', (req, res) => {
        db.get(
            `SELECT Events.*, Organizations.OrganizationName
            FROM Events LEFT JOIN Organizations 
            ON Organizations.OrganizationID_PK = Events.OrganizationID_FK
            WHERE Events.EventID_PK = ?`,
            [req.params.id],
            (err, row) => {
                if (err) return res.status(500).json({ error: err.message });
                if (!row) return res.status(404).json({ error: 'Event not found' });
                return res.json(row);
            })});

    //UPDATE
    app.put('/api/events/:id', (req, res) => {
        const {OrganizationID_FK, EventName, EventType, Description, Location, StartTime, EndTime } = req.body;
        if (!EventName || !Location || !StartTime || !EndTime) {
            return res.status(400).json({ error: 'Event Name, Location, Start Time, and End Time are required.' });
        }
        db.run(
            `UPDATE Events
            SET OrganizationID_FK = ?, EventName = ?, EventType = ?, Description = ?, Location = ?, StartTime = ?, EndTime = ?
            WHERE EventID_PK = ?`,
            [OrganizationID_FK || null, EventName, EventType || null, Description || null, Location, StartTime, EndTime, req.params.id],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                if (this.changes === 0) return res.status(404).json({ error: 'Event not found' });
                return res.json({ message: 'Event updated' });
            })});

    //DELETE
    app.delete('/api/events/:id', (req, res) => {
        db.run('DELETE FROM Events WHERE EventID_PK = ?', [req.params.id], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'Event not found' });
            return res.json({ message: 'Event deleted' });
        })});


//EVENT CHECKINS/FAVORITES
    //CREATE
    app.post('/api/events/:id/favorite', (req, res) => {
    const {userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required.' });
    db.run(
        'INSERT OR IGNORE INTO CheckIns (UserID_FK, EventID_FK) VALUES (?, ?)',
        [userId, req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            return res.json({ message: 'Event favorited' });
        })});

    //READ ALL CHECKINS
    app.get('/api/users/:userId/favorites', (req, res) => {
    db.all(
        `SELECT Events.*
        FROM CheckIns JOIN Events 
        ON Events.EventID_PK = Checkins.EventID_FK
        WHERE Checkins.UserID_FK = ?
        ORDER BY datetime(Events.StartTime) ASC`,
        [req.params.userId],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            return res.json(rows);
        })});

    //DELETE
    app.delete('/api/events/:id/favorite/:userId', (req, res) => {
    db.run(
        'DELETE FROM CheckIns WHERE EventID_FK = ? AND UserID_FK = ?',
        [req.params.id, req.params.userId],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            return res.json({ message: 'Event unfavorited' });
        })});


//ORGANIZATIONS CRUD
    //CREATE
    app.post('/api/organizations', (req, res) => {
        const {OrganizationID_PK, OrganizationName, Description, PrimaryOrganizerID_FK, ContactEmail, ContactPhone } = req.body;
        if (!OrganizationName) {
            return res.status(400).json({ error: 'Name is required.' });
        }
        db.run(
            `INSERT INTO Organizations
            (OrganizationID_PK, OrganizationName, Description, PrimaryOrganizerID_FK, ContactEmail, ContactPhone)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [OrganizationID_PK || null, OrganizationName, Description || null, PrimaryOrganizerID_FK || null, ContactEmail || null, ContactPhone || null],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                return res.status(201).json({ message: 'Organization created', OrganizationID_PK: this.lastID });
            })});

    //READ ALL
    app.get('/api/organizations', (req, res) => {
        db.all('SELECT * FROM Organizations', [], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            return res.json(rows);
        })});

    //READ ONE
    app.get('/api/organizations/:id', (req, res) => {
        db.get('SELECT * FROM Organizations WHERE OrganizationID_PK = ?', [req.params.id], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!row) return res.status(404).json({ error: 'Organization not found' });
            return res.json(row);
        })});

    //UPDATE
    app.put('/api/organizations/:id', (req, res) => {
        const {OrganizationID_PK, OrganizationName, Description, PrimaryOrganizerID_FK, ContactEmail, ContactPhone } = req.body;
        if (!OrganizationName) {
            return res.status(400).json({ error: 'Name is required.' });
        }
        db.run(
            `UPDATE Organizations
            SET OrganizationID_PK = ?, OrganizationName = ?, Description = ?, PrimaryOrganizerID_FK = ?, ContactEmail = ?, ContactPhone = ?
            WHERE OrganizationID_PK = ?`,
            [OrganizationID_PK || null, OrganizationName, Description || null, PrimaryOrganizerID_FK || null, ContactEmail || null, ContactPhone || null, req.params.id],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                if (this.changes === 0) return res.status(404).json({ error: 'Organization not found' });
                return res.json({ message: 'Organization updated' });
            })});

    //DELETE
    app.delete('/api/organizations/:id', (req, res) => {
        db.run('DELETE FROM Organizations WHERE OrganizationID_PK = ?', [req.params.id], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'Organization not found' });
            return res.json({ message: 'Organization deleted' });
        })});


//ORGANIZATION FOLLOWERS
    //CREATE
    app.post('/api/organizations/:id/follow', (req, res) => {
    const {userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required.' });

    db.run(
        'INSERT OR IGNORE INTO Followers (UserID_FK, OrganizationID_FK) VALUES (?, ?)',
        [userId, req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            return res.json({ message: 'Organization followed' });
        })});
    //READ ALL FOLLOWERS
    app.get('/api/users/:userId/follows', (req, res) => {
    db.all(
        `SELECT Organizations.*
        FROM Followers JOIN Organizations
        ON Organizations.OrganizationID_PK = Followers.OrganizationID_FK
        WHERE Followers.UserID_FK = ?`,
        [req.params.userId],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            return res.json(rows);
        })});
    //READ ALL EVENTS 
    app.get('/api/organizations/:id/events', (req, res) => {
    db.all(
        `SELECT * FROM Events WHERE OrganizationID_FK = ?
        ORDER BY datetime(StartTime) ASC`,
        [req.params.id],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            return res.json(rows);
        })});

    //DELETE
    app.delete('/api/organizations/:id/follow/:userId', (req, res) => {
    db.run(
        'DELETE FROM Followers WHERE OrganizationID_FK = ? AND UserID_FK = ?',
        [req.params.id, req.params.userId],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            return res.json({ message: 'Organization unfollowed' });
        })});


//USERS CRUD
    //CREATE - REGISTRATION
    app.post('/api/auth/register', (req, res) => {
    const {firstName, lastName, MNumberID, email, password, phone, role, major} = req.body;
    if (!firstName || !lastName || !email || !password || !MNumberID) {
        return res.status(400).json({ error: 'First name, last name, email, MNumberID, role, and password are required.' });
    }
    db.get('SELECT UserID_PK FROM Users WHERE Email = ?', [email], (checkErr, existing) => {
        if (checkErr) return res.status(500).json({ error: checkErr.message });
        if (existing) return res.status(409).json({ error: 'Email already in use.' });

        db.run(
            `INSERT INTO Users (UserID_PK, FirstName, LastName, Email, PhoneNumber, Password, Role, Major)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [MNumberID, firstName, lastName, email, phone || null, password, role || 'Student', major || null],
            function (insertErr) {
                if (insertErr) return res.status(500).json({ error: insertErr.message });
                return res.status(201).json({ message: 'User created successfully.' });
            }
        )})}); 

    //READ ALL
    app.get('/api/users', (req, res) => {
        db.all('SELECT * FROM Users', [], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            return res.json(rows);
        })});

    //READ ONE
    app.get('/api/users/:id', (req, res) => {
        db.get('SELECT * FROM Users WHERE UserID_PK = ?', [req.params.id], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!row) return res.status(404).json({ error: 'User not found' });
            return res.json(row);
        })});

    //UPDATE
    app.put('/api/users/:id', (req, res) => {
        const {UserID_PK, FirstName, LastName, Email, PhoneNumber, Password, Role, Major} = req.body;
        if (!FirstName || !LastName || !Email || !Password) {
            return res.status(400).json({ error: 'First name, Last name, Email, and Password are required.' });
        }
        db.run(
            `UPDATE Users
            SET UserID_PK = ?, FirstName = ?, LastName = ?, Email = ?, PhoneNumber = ?, Password = ?, Role = ?, Major = ?
            WHERE UserID_PK = ?`,
            [UserID_PK || null, FirstName, LastName, Email, PhoneNumber || null, Password, Role || null, Major || null, req.params.id],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                if (this.changes === 0) return res.status(404).json({ error: 'User not found' });
                return res.json({ message: 'User updated' });
        })});

    //FORGOT PASSWORD RESET
    //UPDATE
    app.post('/api/auth/forgot-password', (req, res) => {
    const {email, oldPassword, newPassword } = req.body;
    if (!email || !oldPassword || !newPassword) {
        return res.status(400).json({ error: 'Email, old password, and new password are required.' });
    }
    db.run(
        'UPDATE Users SET Password = ? WHERE Email = ? AND Password = ?',
        [newPassword, email, oldPassword],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(401).json({ error: 'Email or old password is incorrect.' });
            return res.json({ message: 'Password reset successful.' });
        })})
    //DELETE
    app.delete('/api/users/:id', (req, res) => {
        db.run('DELETE FROM Users WHERE UserID_PK = ?', [req.params.id], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'User not found' });
            return res.json({ message: 'User deleted' });
        })});


    //READ ALL EVENT NOTIFICATIONS
    app.get('/api/users/:userId/notifications', (req, res) => {
    db.all(
        `SELECT DISTINCT Events.EventID_PK, Events.EventName,Events.StartTime,Events.EndTime,Events.Location,Organizations.OrganizationName
        FROM Events LEFT JOIN Organizations  
        ON Organizations.OrganizationID_PK = Events.OrganizationID_FK
        LEFT JOIN CheckIns
        ON Checkins.EventID_FK = Events.EventID_PK AND Checkins.UserID_FK = ?
        WHERE datetime(Events.StartTime) >= datetime('now')
          AND (datetime(Events.StartTime) <= datetime('now', '+28 days'))
          AND (Checkins.CheckID_PK IS NOT NULL)
        ORDER BY datetime(Events.StartTime) ASC`,
        [ req.params.userId],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            return res.json(rows);
        })});

//LOGIN AUTHENTICATION
    //READ ONE
    app.post('/api/auth/login', (req, res) => {
    const {email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and Password required.' });
    }
    db.get(
        `SELECT UserID_PK, FirstName, LastName, Email, Password, Role
        FROM Users
        WHERE Email = ?`,
        [email],
        (err, user) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!user || user.Password !== password) {
                return res.status(401).json({ error: 'Invalid' });
            }

            return res.json({
                message: 'Successful Login',
                user: {id: user.UserID_PK,firstName: user.FirstName,lastName: user.LastName,email: user.Email,role: user.Role || 'student'}
        })})});



app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
})