fetch('https://maxbruges.com/shakespeare.json')
.then((response) => response.json())
.then((json) => { 

for (let index = 0; index < json.length; index++) {
    const element = json[index];
    if (element.line_no == "" && element.type == "line"){
        element.type = "direction"
    } else {continue}
}
console.log(json)

})
