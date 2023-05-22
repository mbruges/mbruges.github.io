var inputName = "joe test"
var studentCode = "joe-testY9"
var inputYear = "9"
var inputBfL = "good"
var inputRfL = "poor"
var inputComments = "nice guy"
var inputProgress = "good"
var inputReport = "Joe is working well this year. We wish him Well"
var inputSubject = 'English'

var newStudent1 = {
    name: `${inputName}`,
    code: `${studentCode}`,
    year: `${inputYear}`,
    data: [[inputSubject, inputBfL, inputRfL, inputComments, inputProgress, inputReport],]
}

var newStudent2 = {
    name: `Jack Test`,
    code: `Jack-TestY7`,
    year: `${inputYear}`,
    data: [],
}


/*
[inputBfL, inputRfL,inputComments,inputProgress,inputReport]
*/

var database = []

function addToDB(input1,input2) {
    if (!(database.length > 0)){
        database.push(input1,input2)
        console.log("students added")
    }
    var jackData = [inputSubject,inputBfL, inputRfL, inputComments, inputProgress, inputReport]
    var jackData2 = ['Maths', 'poor', 'poor', 'test', 'test', 'test']
    var jackData3 = ['Maths', 'good', 'good', 'test', 'test', 'test2']
    database[1].data.push(jackData)
    database[1].data.push(jackData2)
    var newSubject = jackData3[0]


    for (let index = 0; index < database[1].data.length; index++) {
        const existingSubject = database[1].data[index][0];
        console.log(existingSubject)
        if (newSubject == existingSubject) {
            database[1].data[index] = jackData3
            console.log('Entry for ' + existingSubject + " has been replaced"); return console.log(database[1]);
        }
    }
}

addToDB(newStudent1,newStudent2)

function replaceExistingReport(studentIndex,subject,newData) {
    for (let index = 0; index < database[studentIndex].data.length; index++) {
        const existingSubject = database[studentIndex].data[index][0];
        console.log(existingSubject)
        if (newSubject == existingSubject) {
            database[studentIndex].data[index] = jackData3
            console.log('Entry for ' + existingSubject + " has been replaced"); return console.log(database[studentIndex]);
        }
    }
}