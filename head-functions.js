//This whole file should be copied into the head of each new page. The functions listed here are used for the various applications on the site, such as AskGPT, notification popups, copying, downloading etc...

function askGPT(openAiToken, prompt, role, maxTokens,outputElement) {
    //IF statements to catch missing parameters

    if (openAiToken.length < 32) {
        console.log("API key required")
        return `Please enter your <a href="https://platform.openai.com/account/api-keys" target="_blank">OpenAI API key</a> above, then try again.`;
    }


    if (prompt.length < 3 || prompt == undefined) {
        console.log("Please enter a prompt");
        return "Please enter a prompt"; 
    }

    maxTokens = parseInt(maxTokens)
    if (maxTokens == undefined || maxTokens == NaN) {
        maxTokens = 100
    }

    var url = "https://api.openai.com/v1/chat/completions";
    var bearer = 'Bearer ' + openAiToken;
    /*var loadingMessage = `Thinking as ${role}...`*/

    console.log("thinking...")

    showLoader();
    hideResponseContainer(outputElement);
    fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': bearer,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "model": "gpt-3.5-turbo",
            "messages": [
                { "role": "system", "content": `Respond to every query as ${role}` },
                /* These can be filled with convo history
                { "role": "user", "content": "" },
                { "role": "assistant", "content": "" },*/
                { "role": "user", "content": prompt }
            ],
            "max_tokens": maxTokens,
            "temperature": 1,
            "top_p": 1,
            "n": 1,
        })


}).then(response => {

    return response.json()

}).then(data => {
    var newresponse = data['choices'][0].message.content;
    console.log(newresponse)
    console.log(data.usage.total_tokens)
    document.getElementById(`${outputElement}`).innerHTML = newresponse
    //Token tracking
    let totaltokensused = parseInt(data.usage.total_tokens);
    if ((localStorage.getItem("TokensToDate")) == null) {
        localStorage.setItem("TokensToDate", 0)
    };
    var lifetimetokensused = parseInt(totaltokensused) + parseInt(localStorage.getItem("TokensToDate"));
    console.log(`Used ${totaltokensused} in that query. Cache says you've used ${lifetimetokensused} tokens so far`)
    localStorage.setItem("TokensToDate", lifetimetokensused);
    showResponseContainer(outputElement);
    hideLoader()
    return newresponse;
    
})
    .catch(error => {
        console.log('Something went wrong. This is the error -->  ' + error)
        showResponseContainer(outputElement);
        hideLoader()
        return `Something went wrong. This is the error: ${error}`;
        
    });
//END OF ASKGPT SCRIPT
};


//These are the functions to toggle the loading animation and to hide the request button.
function hideLoader() {
    let loader = document.getElementById('thinking-loader');
    loader.className = "loader.hidden";
    let button = document.getElementById('AskGPTbutton');
    button.className = "";
}
function showLoader() {
    let loader = document.getElementById('thinking-loader');
    loader.className = "loader";
    let button = document.getElementById('AskGPTbutton');
    button.className = "hidden";
}
function showResponseContainer(outputElement) {
    let container = document.getElementById(outputElement);
    container.className = "";
    container.scrollIntoView();
}
function hideResponseContainer(outputElement) {
    let container = document.getElementById(outputElement);
    container.className = "hidden"
    let button = document.getElementById('AskGPTbutton');
    button.className = "hidden";
}
//This script saves the string entered into "APItokenInput" to local storage
function saveThing(elementIdToSave, thingToSave) {
    let storedItem = "" + document.getElementById(elementIdToSave).value
    if (storedItem.length < 1){
        notificationAlert("Nothing to save!");
        console.log("Nothing to save!")
        return;
    }
    localStorage.setItem(thingToSave, storedItem)
    console.log(`${thingToSave} has saved successfully`);
}

//...and this script returns that token on page load.
function loadThing(elementIdToDisplay, thingToSave) {
    let savedThing = localStorage.getItem(thingToSave)
    console.log(`Your ${thingToSave} has loaded successfully: ${savedThing}`)
    document.getElementById(elementIdToDisplay).value = savedThing;
}

//This gives a notification to the 'toastAlert' element. Param defines the message.
function notificationAlert(notificationText) {
    var alertelement = document.getElementById("toastAlert");
    alertelement.innerHTML = notificationText
    alertelement.className = "show";
    setTimeout(function () { alertelement.className = alertelement.className.replace("show", ""); }, 3000);
}

//Checks used OpenAI tokens and converts into dollars for a rough spending guide at GPT3.5-turbo rates.
function tokenToDollar(outputElement) {
    if ((localStorage.getItem("TokensToDate")) == null) {
        localStorage.setItem("TokensToDate", 0)
    };
    let dollarSpend = 0;
    let totaltokensused = localStorage.getItem("TokensToDate")
    dollarSpend = totaltokensused * 0.000002;
    //Here we round the dollarSpend to four decimal places.
    dollarSpend = (Math.floor(dollarSpend * 100)) / 100;
    console.log(`${totaltokensused} = $${dollarSpend}`)
    document.getElementById(outputElement).innerHTML = `$${dollarSpend}`
}

//This function will copy the contents of the defined param to the clipboard
function copy(thingToCopy) {
    navigator.clipboard.writeText(thingToCopy);
    notificationAlert('Copied to clipboard 📋');
};

//This function will place the contents of the parameter-specified div in an HTML file, and download it.
function downloadHTML(elementIDtoDownload) {
    const link = document.createElement("a");
    const content = "" + document.getElementById(elementIDtoDownload).innerHTML + `<br> <br> <footer style="font-size:6px; color:grey; text-align:center">
                <small><i>2023 -  Generated by <a href="https://mbruges.com/index.html" target="_blank">Max Bruges</a> </i> 🐈‍⬛ </small></footer>`;
    const file = new Blob([content], { type: 'text/plain' });
    link.href = URL.createObjectURL(file);
    let fileName = "newfile.html"
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
};

//Convert MD to HTML:
function convertMD(elementIDtoConvert) {
    var md = document.getElementById(elementIDtoConvert).innerHTML
    const mdRenderer = window.markdownit();
    const html = mdRenderer.render(md);
    document.getElementById('report').innerHTML = html;
    console.log("Converted to Markdown")
}

//A script for prettifying code when in a zero-md container

    function prettifyCode(code,outputcontainer) {
        code = "```Javascript \n" + code
        document.getElementById(outputcontainer).innerHTML = code
            }

export  { prettifyCode, askGPT, hideLoader, showLoader, showResponseContainer, hideResponseContainer, saveThing,loadThing,downloadHTML,copy,notificationAlert,tokenToDollar }