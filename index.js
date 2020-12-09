const Database = require('better-sqlite3');
const db = new Database('resources/database.db');

const express = require('express');
const app = express();

const formProcessor = require('express-formidable');
app.use(formProcessor());

app.use('/', (req, res, next) => {
    console.log("Serving static content: " + req.path);
    next();
}, express.static('resources/client'));

const port = 8000;
app.listen(port, () => console.log("Listening on port: " + port));

const students = express.Router();
app.use('/students', (req, res, next) => {
    console.log("Student API: /students" + req.path);
    next();
}, students);

students.post('/create', (req, res) => {
    try {
        
        let ps = db.prepare("INSERT INTO Students (firstname, surname, email, specID) VALUES (?, ?, ?, ?)");
        let results = ps.run(req.fields['firstname'], req.fields['surname'], req.fields['email'], req.fields['specID']);
        
        if (results.changes === 1) res.json({status: "OK"});
        else throw "Unable to create new student";
        
    } catch (error) {
        console.log("An error occured: " + error);
        res.json("An error occured: " + error);
    }
});

students.get('/readall', (req, res) => {
    try {
        
        let ps = db.prepare("SELECT * FROM students");
        let results = ps.all();
        
        res.json(results);
        
    } catch (error) {
        console.log("An error occured: " + error);
        res.json({error: "An error occured"});   
    }
});

const spec = express.Router();
app.use('/spec', (req, res, next) => {
    console.log("Specification API: /spec" + req.path);
    next();
}, spec);

spec.post('/create', (req, res) => {
    try {
        
        let ps = db.prepare("INSERT INTO specification (coursename, examboard) VALUES (?, ?)");
        let results = ps.run(req.fields['coursename'], req.fields['examboard']);
        
        if (results.changes === 1) res.json({status: "OK"});
        else throw "Unable to create new specification";
        
    } catch (error) {
        console.log("An error occured: " + error);
        res.json({error: "An error occured"});   
    }
});

spec.get('/readall', (req, res) => {
    try {
        
        let ps = db.prepare("SELECT * FROM specification");
        let results = ps.all();
        
        res.json(results);
        
    } catch (error) {
        console.log("An error occured: " + error);
        res.json({error: "An error occured"});   
    }
});

spec.get('/getname/:id', (req, res) => {
    try {
        
        let ps = db.prepare("SELECT coursename FROM specification WHERE specID = ?");
        let results = ps.get(req.params.id);
        
        res.json(results);
        
    } catch (error) {
        console.log("An error occured: " + error);
        res.json({error: "An error occured"});   
    }
});

const specpoints = express.Router();
app.use('/specpoints', (req, res, next) => {
    console.log("Spec Points API: /specpoints" + req.path);
    next();
}, specpoints);

specpoints.post('/create', (req, res) => {
    try {
        let ps = db.prepare("INSERT INTO specpoints (specID, section, title, content) VALUES (?, ?, ?, ?)");
        let results = ps.run(req.fields['specID'], req.fields['section'], req.fields['title'], req.fields['content']);
        
        if (results.changes === 1) res.json({status: "OK"});
        else throw "Unable to create new specification point";
        
    } catch (error) {
        console.log("An error occured: " + error);
        res.json({error: "An error occured"});   
    }
});

specpoints.get('/readall', (req, res) => {
    try {
        
        let ps = db.prepare("SELECT * FROM specpoints");
        let results = ps.all();
        
        res.json(results);
        
    } catch (error) {
        console.log("An error occured: " + error);
        res.json({error: "An error occured"});   
    }
});

specpoints.post('/search', (req, res) => {
    try {
        
        let ps = db.prepare("SELECT * FROM specpoints WHERE specID = (SELECT specID FROM specification WHERE coursename LIKE ?) AND (section LIKE ? OR title LIKE ? OR content LIKE ?)");
        let results = ps.all("%" + req.fields['specname'] + "%", "%" + req.fields['search'] + "%", "%" + req.fields['search'] + "%", "%" + req.fields['search'] + "%");
        
        res.json(results);
        
    } catch (error) {
        console.log("An error occured: " + error);
        res.json({error: "An error occured"});   
    }
});

specpoints.get('/getspec/:name', (req, res) => {
    try {
        
        let ps = db.prepare("SELECT * FROM specpoints WHERE specID = (SELECT specID FROM specification WHERE coursename LIKE ?)");
        let results = ps.all("%" + req.params.name + "%");
        
        res.json(results);
        
    } catch (error) {
        console.log("An error occured: " + error);
        res.json({error: "An error occured"});   
    }
});

const knownspecpoints = express.Router();
app.use('/knownspecpoints', (req, res, next) => {
    console.log("Known Spec Points API: /knownspecpoints" + req.path);
    next();
}, knownspecpoints);

knownspecpoints.post('/create', (req, res) => {
    try {
        
        let ps = db.prepare("INSERT INTO knownspecpoints (studentID, pointID, datetime) VALUES (?, ?, ?)");
        let results = ps.run(req.fields['specID'], req.fields['title'], new Date().getTime());
        
        if (results.changes === 1) res.json({status: "OK"});
        else throw "Unable to create new known specification point";
        
    } catch (error) {
        console.log("An error occured: " + error);
        res.json({error: "An error occured"});   
    }
});

const lessons = express.Router();
app.use('/lessons', (req, res, next) => {
    console.log("Lessons Spec Points API: /lessons" + req.path);
    next();
}, lessons);

lessons.post('/create', (req, res) => {
    try {
        
        let ps = db.prepare("INSERT INTO lessons (studentID, title, content, datetime) VALUES (?, ?, ?, ?)");
        let results = ps.run(req.fields['studentID'], req.fields['title'], req.fields['content'], new Date().getTime());
        
        if (results.changes === 1) res.json({status: "OK"});
        else throw "Unable to create new lesson";
        
    } catch (error) {
        console.log("An error occured: " + error);
        res.json({error: "An error occured"});   
    }
});