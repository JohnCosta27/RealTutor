console.log("JS loaded!");

function onload() {
    loadstudents(); 
}

function loadstudents() {
    
    document.getElementById('title').innerText = "Student List";
    
    document.getElementById('contentWrapper').innerHTML = `<div id='studentGrid' class='studentsWrapper'></div>`;
    fetch('/students/readall').then(response => response.json()).then(
        students => {
            
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
            
        });
        
    }
    
    function loadStudentOptions(primaryKey, studentName) {
        
        document.getElementById('title').innerText = studentName;
        
        document.getElementById('contentWrapper').innerHTML = ``;
        document.getElementById('contentWrapper').innerHTML += 
        `<div id='studentGrid' class='studentsWrapper'>
        <div class='student'>
        <div class='nameWrapper'>
        <h2>View lessons</h2>
        </div>
        </div>
        <div class='student'>
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
        <button class='buttons' type='submit'>Submit</button>
        </div>
        </form>
        </div>`; 
        
        const form = document.getElementById('addLesson');
        
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            //if (document.getElementById("title").value.length)

            const formData = new FormData(this);
            formData.append("studentID", document.getElementById('addLesson').className);
            
            fetch('/lessons/create', {body: formData, method: 'post'}).
            then(response => response.json()).then(reponse => console.log(reponse));
            
        });
        
    }