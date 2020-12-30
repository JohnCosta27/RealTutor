console.log("JS loaded!");

function onload() {
    loadstudents();
}

function loadstudents() {
    
    document.getElementById('title').innerText = "Student List";
    
    document.getElementById('contentWrapper').innerHTML = `<div id='studentGrid' class='studentsWrapper'></div>`;
    fetch('/students/readall').then(response => response.json()).
    then(students => {

        for (let student of students) {
            
            let studentName = student.firstname + " " + student.surname;
            
            document.getElementById('studentGrid').innerHTML += 
            `<div class='student' onclick='loadStudentOptions(${student.studentID}, "${studentName}")'>
            <div class='nameWrapper'>
            <h1>${studentName}</h1>
            </div>
            </div>
            </div>`;
            
        }
        document.getElementById('studentGrid').innerHTML += `<div class='student' onclick='addStudent()'>
        <div class='nameWrapper'>
        <h1>Add Student</h1>
        </div>
        </div>
        </div>`;
    });
    
}

function loadStudentOptions(primaryKey, studentName) {
    
    document.getElementById('title').innerText = studentName;
    
    document.getElementById('contentWrapper').innerHTML = ``;
    document.getElementById('contentWrapper').innerHTML += 
    `<div id='studentGrid' class='studentsWrapper'>
    <div class='student' onclick='loadLessons(${primaryKey}, "${studentName}")'>
    <div class='nameWrapper'>
    <h2>View lessons</h2>
    </div>
    </div>
    <div class='student' onclick='loadSpecPoints(${primaryKey}, "${studentName}")'>
    <div class='nameWrapper'>
    <h2>View known spec points</h12>
    </div>
    </div>
    <div class='student'>
    <div class='nameWrapper'>
    <h2>View details</h2>
    </div>
    </div>
    <div class='student' onclick='loadAddLesson(${primaryKey}, "${studentName}")'>
    <div class='nameWrapper'>
    <h2>Add lesson</h2>
    </div>
    </div>
    <div class='student' onclick='addKnownSpecPoint(${primaryKey}, "${studentName}")'>
    <div class='nameWrapper'>
    <h2>Add known spec point</h2>
    </div>
    </div>
    <div onclick='loadstudents()' class='student'>
    <div class='nameWrapper'>
    <h2>Go back</h2>
    </div>
    </div>
    </div>
    </div>`;
    
}

function loadAddLesson(primaryKey, studentName) {
    
    document.getElementById('title').innerText += " - Add lesson";
    
    document.getElementById('contentWrapper').innerHTML = ``;
    document.getElementById('contentWrapper').innerHTML += 
    `<div class='flexboxCol'>
    <form id='addLesson'  class='${primaryKey}'>
    <label class='labels'>Title</label>
    <input id='title' type='text' class='textbox' name='title'>
    <label class='labels'>Content</label>
    <textarea rows="15" type='text' class='textarea' name='content'></textarea>
    <div class='flexboxHorizontal'>
    <button type="button" class='buttons' onclick='loadStudentOptions(${primaryKey}, "${studentName}")'>Cancel</button>
    <div>
    <label for="lessonTime">Lesson date and time</label>
    <input type="datetime-local" id="lessonTime">
    </div>
    <button class='buttons' type='submit'>Submit</button>
    </div>
    </form>
    </div>`; 
    
    const form = document.getElementById('addLesson');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        formData.append("studentID", document.getElementById('addLesson').className);
        
        let content = formData.get("content").replace('\n', '<br>');
        formData.delete("content");
        formData.append("content", content);
        formData.append("datetime", new Date(document.getElementById("lessonTime").value).getTime());
        
        if (formData.get("title") == "" ||
        formData.get("content") == "" ||
        formData.get("datetime") == "") {
            alert("Fill in all points");
        } else {
            
            fetch('/lessons/create', {body: formData, method: 'post'}).
            then(response => response.json()).then(reponse => console.log(reponse));
            loadStudentOptions(primaryKey, studentName);
            
        }
        
    });
    
}

function loadLessons(primaryKey, studentName) {
    
    document.getElementById('contentWrapper').innerHTML = ``;
    document.getElementById('contentWrapper').innerHTML = `<div id='lessonContainer' class='lessonContainer'></div>`;
    
    fetch('/lessons/readall/' + primaryKey).then(response => response.json()).
    then(lessons => {
        
        lessons.sort((a,b) => b.datetime - a.datetime);
        
        document.getElementById('title').innerText = studentName + " - Lessons";
        
        for (let lesson of lessons) {
            let date = new Date(lesson.datetime).toJSON().slice(0,10).split('-').reverse().join('/');
            document.getElementById('lessonContainer').innerHTML +=
            `<div id='lesson${lesson.lessonID}' class='lesson' onclick='loadLesson(${primaryKey}, "${studentName}", ${lesson.lessonID})'>
            <p class='lessonTitle'>${lesson.title} - ${date}</p>
            </div>
            </div>`;
        }
        
        if (lessons.length == 0) {
            document.getElementById('lessonContainer').innerHTML += 
            `<div class='lesson'>
            <p class='lessonTitle'>No lessons available</p>
            </div>`;
        }
        
        document.getElementById('contentWrapper').innerHTML += 
        `<button 'type="button" class='backButton' onclick='loadStudentOptions(${primaryKey}, "${studentName}")'>Cancel</button>`;
        
    });
    
}

function loadLesson(primaryKey, studentName, lessonID) {
    
    document.getElementById('contentWrapper').innerHTML = ``;
    
    fetch('/lessons/readlesson/' + lessonID).then(response => response.json()).
    then(lesson => {

        document.getElementById('contentWrapper').innerHTML += 
        `<div class='displayLessonContainer'>
        <div class='displayLesson'>
        <p class='lessonContent'>${lesson.title} <br><br> ${lesson.content}</p>
        </div>
        <button type="button" class='backButton' onclick='loadLessons(${primaryKey}, "${studentName}")'>Cancel</button>
        </div>`
        
    });
    
}

function loadSpecPoints(primaryKey, studentName) {
    
    document.getElementById('contentWrapper').innerHTML = `<div id='lessonContainer' class='lessonContainer'></div>`;
    
    fetch('/knownspecpoints/readall/' + primaryKey).then(response => response.json()).
    then(specpoints => {
        
        specpoints.sort((a,b) => b.datetime - a.datetime);
        
        document.getElementById('title').innerText = studentName + " - Known Points";
        
        for (let specpoint of specpoints) {
            document.getElementById('lessonContainer').innerHTML +=
            `<div id='lesson${specpoint.pointID}' class='lesson' onclick='loadSpecPoint(${primaryKey}, "${studentName}", ${specpoint.pointID})'>
            <p class='specPointsText'>${specpoint.section} ${specpoint.title} ${specpoint.content}</p>
            </div>
            </div>`;
        }
        
        if (specpoints.length == 0) {
            document.getElementById('lessonContainer').innerHTML += 
            `<div class='lesson'>
            <p class='lessonTitle'>No known spec points</p>
            </div>`;
        }
        
        document.getElementById('contentWrapper').innerHTML += 
        `<button 'type="button" class='backButton' onclick='loadStudentOptions(${primaryKey}, "${studentName}")'>Cancel</button>`;
        
    });
    
}

function loadSpecPoint(primaryKey, studentName, pointID) {
    
    document.getElementById('contentWrapper').innerHTML = ``;
    
    fetch('/specpoints/getspecpoint/' + pointID).then(response => response.json()).
    then(point => {
        document.getElementById('contentWrapper').innerHTML += 
        `<div class='displayLessonContainer'>
        <div class='displayLesson'>
        <p class='lessonContent'>${point.section}<br><br> ${point.title} <br><br> ${point.content}</p>
        </div>
        <button type="button" class='backButton' onclick='loadSpecPoints(${primaryKey}, "${studentName}")'>Cancel</button>
        </div>`
    });
    
}

function addStudent() {
    document.getElementById('title').innerText = "Add Student";
    
    document.getElementById('contentWrapper').innerHTML = ``;
    document.getElementById('contentWrapper').innerHTML += 
    `<div class='flexboxCol'>
    <form id='addStudent'>
    <label class='labels'>First name</label>
    <input id='firstname' type='text' class='textbox' name='firstname'>
    <label class='labels'>Surname</label>
    <input id='surname' type='text' class='textbox' name='surname'>
    <label class='labels'>Email</label>
    <input id='email' type='text' class='textbox' name='email'>
    <label class='labels'>Course</label>
    <select name="coursename" class='textbox' id='dropdown'>`
    
    fetch('/spec/readall').then(response => response.json()).then(specs => {
        
        for (let spec of specs) {
            document.getElementById('dropdown').innerHTML += 
            `<option value="${spec.specID}">${spec.coursename}</option>`
        }
        
    })
    
    document.getElementById('addStudent').innerHTML += 
    `</select>
    <div class='flexboxHorizontal'>
    <button type="button" class='buttons' onclick='loadstudents()'>Cancel</button>
    <button class='buttons' type='submit'>Submit</button>
    </div>
    </form>
    </div>`; 
    
    const form = document.getElementById('addStudent');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        
        fetch('/students/create', {body: formData, method: 'post'}).
        then(response => response.json()).then(reponse => console.log(reponse));
        
        loadstudents();
        
    });
    
}

function addKnownSpecPoint(primaryKey, studentName) {
    
    document.getElementById('contentWrapper').innerHTML = `<form id='addKnownSpecPoint'><select name="pointID" class='textbox' id='dropdown' multiple></select>`
    let section = "";

        fetch('/specpoints/readfromspec/' + primaryKey).then(response => response.json()).then(points => {

            for (let point of points) {
                
                if (point.section != section) {
                    section = point.section;
                    document.getElementById('dropdown').innerHTML += 
                    `<option value="${point.pointID}" disabled>${section}</option>`
                }
                
                let content = point.title + point.content;
                if (content.length > 120) content = content.substring(0, 120) + "...";
                
                document.getElementById('dropdown').innerHTML += 
                `<option style='font-size: 16px' value="${point.pointID}">${content}</option>`
                
            }

        });
    
    document.getElementById('addKnownSpecPoint').innerHTML += 
    `<div class='flexboxHorizontal'>
    <button type="button" class='buttons' onclick='loadStudentOptions(${primaryKey}, "${studentName}")'>Cancel</button>
    <div>
    <label for="lessonTime">Lesson date and time</label>
    <input type="datetime-local" id="lessonTime">
    </div>
    <button class='buttons' type='submit'>Submit</button>
    </div>
    </form>`;
    
    const form = document.getElementById('addKnownSpecPoint');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        
        for (let value of formData.values()) {
            console.log(value);

            const newFormData = new FormData();
            newFormData.append("pointID", value);
            newFormData.append("datetime", new Date(document.getElementById("lessonTime").value).getTime());
            newFormData.append("studentID", primaryKey);

            fetch('/knownspecpoints/create', {body: newFormData, method: 'post'}).
            then(response => response.json()).then(reponse => console.log(reponse));

        }
        
        loadstudents();
        
    });
    
}