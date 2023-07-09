
async function wiki(page) {
    
const url = "https://en.wikipedia.org/w/api.php?" +
    new URLSearchParams({
        origin: "*",
        action: "parse",
        page: page,
        format: "json",
        mobileformat: "true",
    });

try {
    const req = await fetch(url);
    const json = await req.json();
    console.log(json.parse.text["*"]);
} catch (e) {
    console.error(e);
    }
}

function pepys() {
    fetch('https://www.pepysdiary.com/diary/1660/06/30/#content')
    .then((response) => response.text())
    .then((text) => { 
    console.log(text)})
}

pepys()