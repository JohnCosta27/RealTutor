const Database = require('better-sqlite3');
const db = new Database('resources/database.db');

const express = require('express');
const app = express();

const formProcessor = require('express-formidable');
app.use(formProcessor());

const sha256 = require('js-sha256');

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

        let ps = db.prepare("INSERT INTO Students (firstname, surname, email, password, password_salt) VALUES (?, ?, ?, ?, ?)");

        if (safePassword(req.fields['password'])) {

            let password_salt = generateSalt();
            let hashedPassword = sha256(req.fields['password'] + password_salt);
            let results = ps.run(req.fields['firstname'], req.fields['surname'], req.fields['email'], hashedPassword, password_salt);

            if (results.changes === 1) res.json({status: "OK"});
            else throw "Unable to create new student";

        }
        
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

students.get('/specid/:studentID', (req, res) => {
    try {
        let ps = db.prepare("SELECT specID FROM studentsSpecification WHERE studentID = ?");
        let results = ps.all(req.params.studentID);
        res.json(results);
    } catch (error) {
        console.log("An error occured: " + error);
        res.json({error: "An error occured"});   
    }
});

function getID(email) { return db.prepare("SELECT studentID FROM students WHERE email = ?").get(email); }

const studentsSpecification = express.Router();
app.use('/studentspecification', (req, res, next) => {
    console.log("Student Specification API: /spec" + req.path);
    next();
}, studentsSpecification);

studentsSpecification.post('/create', (req, res) => {
    try {

        let studentID = getID(req.fields['email']);
        let ps = db.prepare(`INSERT INTO studentsSpecification (studentID, specID) VALUES (?, ?)`);
        let results = ps.run(studentID.studentID, req.fields['specID']);

        if (results.changes === 1) res.json({status: "OK"});
        else throw "Unable to create new student specification";

    } catch (error) {
        console.log("An error occured: " + error);
        res.json("An error occured: " + error);
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

specpoints.get('/readfromspec/:studentID', (req, res) => {
    try {
        let ps = db.prepare("SELECT * FROM specpoints INNER JOIN studentsSpecification ON specpoints.specID = studentsSpecification.specID INNER JOIN students ON students.studentID = studentsSpecification.studentID WHERE students.studentID = ? AND specpoints.pointID NOT IN (SELECT pointID FROM knownspecpoints WHERE studentID = ?)");
        let results = ps.all(req.params.studentID, req.params.studentID);
        res.json(results);
    } catch (error) {
        console.log("An error occured: " + error);
        res.json({error: "An error occured"});   
    }
});

specpoints.get('/getspecfromname/:name', (req, res) => {
    try {
        
        let ps = db.prepare("SELECT * FROM specpoints WHERE specID = (SELECT specID FROM specification WHERE coursename LIKE ?)");
        let results = ps.all("%" + req.params.name + "%");
        
        res.json(results);
        
    } catch (error) {
        console.log("An error occured: " + error);
        res.json({error: "An error occured"});   
    }
});

specpoints.get('/getspecpoint/:pointID', (req, res) => {
    try {
        
        let ps = db.prepare("SELECT * FROM specpoints WHERE pointID = ?");
        let results = ps.get(req.params.pointID);
        
        res.json(results);
        
    } catch (error) {
        console.log("An error occured: " + error);
        res.json({error: "An error occured"});   
    } 
})

const knownspecpoints = express.Router();
app.use('/knownspecpoints', (req, res, next) => {
    console.log("Known Spec Points API: /knownspecpoints" + req.path);
    next();
}, knownspecpoints);

knownspecpoints.post('/create', (req, res) => {
    try {
        
        let ps = db.prepare("INSERT INTO knownspecpoints (studentID, pointID, datetime) VALUES (?, ?, ?)");
        let results = ps.run(req.fields['studentID'], req.fields['pointID'], req.fields['datetime']);
        
        if (results.changes === 1) res.json({status: "OK"});
        else throw "Unable to create new known specification point";
        
    } catch (error) {
        console.log("An error occured: " + error);
        res.json({error: "An error occured"});   
    }
});

knownspecpoints.get('/readall/:studentID', (req, res) => {
    try {
        let ps = db.prepare("SELECT knownspecpoints.studentID, knownspecpoints.pointID, knownspecpoints.datetime, specpoints.specID, specpoints.pointID, specpoints.section, specpoints.title, specpoints.content, specification.coursename FROM knownspecpoints  INNER JOIN specpoints on knownspecpoints.pointID = specpoints.pointID INNER JOIN specification on specpoints.specID = specification.specID WHERE studentID = ?");
        let results = ps.all(req.params.studentID);
        res.json(results);
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
        let results = ps.run(req.fields['studentID'], req.fields['title'], req.fields['content'], req.fields['datetime']);
        
        if (results.changes === 1) res.json({status: "OK"});
        else throw "Unable to create new lesson";
        
    } catch (error) {
        console.log("An error occured: " + error);
        res.json({error: "An error occured"});   
    }
});

lessons.get('/readall/:studentID', (req, res) => {
    try {
        let ps = db.prepare("SELECT * FROM lessons WHERE studentID = ?");
        let results = ps.all(req.params.studentID);
        res.json(results);
    } catch (error) {
        console.log("An error occured: " + error);
        res.json({error: "An error occured"});   
    }
})

lessons.get('/readlesson/:lessonID', (req, res) => {
    try {
        let ps = db.prepare("SELECT * FROM lessons WHERE lessonID = ?");
        let results = ps.get(req.params.lessonID);
        res.json(results);
    } catch (error) {
        console.log("An error occured: " + error);
        res.json({error: "An error occured"});   
    }
});

function safePassword(password) {
    if (password.toLowerCase() == password || password.toUpperCase() == password || /\d/.test(password) == false) return false;
    else return true;
}
function generateSalt() {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < 16; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}