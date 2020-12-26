let primarykey = 3;

let fs = require('fs');
let request = require('request');

fs.readFile('alevelmaths.txt', 'utf-8', (err, data) => {

    if (err) return console.log(err);
    
    let lines = data.split('\n');

    let section = "";
    let title = "";
    let body = "";

    for (let line of lines) {

        if (isCharNumber(line.charAt(0))) {

            if (title != "") request.post('http://localhost:8000/specpoints/create', {form: {specID: primarykey, section: section, title: title, content: body}}, (err,httpResponse,body) => {console.log(body)});

            section = line;
            title = "";
            body = "";

        }

        if (line.charAt(0) == "-") {
            if (title != "") request.post('http://localhost:8000/specpoints/create', {form: {specID: primarykey, section: section, title: title, content: body}}, (err,httpResponse,body) => {console.log(body)});
            body = "";
            title = line;
        }

        if (line.charAt(0) == "$") {
            body = body + line;
        }

    }

    request.post('http://localhost:8000/specpoints/create', {form: {specID: primarykey, section: section, title: title, content: body}}, (err,httpResponse,body) => {console.log(body)});

});

function isCharNumber(c){
    return c >= '0' && c <= '9';
}