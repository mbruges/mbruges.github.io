# Setting up a summarisation bot

## OFSTED Background
A couple of weeks ago, two things happened. 

First: the national conversation turned - briefly and superficially - to *the OFSTED Question*. 

As is often the case, it was precipitated not by careful consideration of data or qualitative feedback, but by a tragedy. I cannot begin to imagine the wrench felt by the family, the school and the community in the wake of it, and seeing a deeply personal incident picked up to illustrate talking points. OFSTED certainly needs to be talked about, urgently, but a conversation started this way was always bound to be counter-productive, eliciting

Responses and takes were quick to chide and slow to bless, the barrier to entry for commentary on the complex topic managing schools having been temporarily lowered by the immediacy of the news cycle. 

Amongst the many, *many* takes, one thing became pretty clear: hardly anyone outside the education system knows what OFSTED really does, and even fewer had bothered to read the report that sparked the conversation.

The second thing that happened, in a wholly disconnected sphere, was an iterative update to 'Claude', one of the many 'chatbots' that have been released over the past six months.

'Claude' is a product of Anthropic, an AI-focussed start-up invested in by Google (among others). The update released in early May allowed for a massive increase in the 'context' to queries made to 'Claude' by users, raising the bar from a paltry thousand-odd characters to 100,000. Simply put, this meant that 'Claude' could now digest entire novels, plays and articles in seconds, responding quickly and accurately to questions about them.

Anyone who's spent time with other chatbots knows that the longer the query, the greater the chance of hallucination: strange responses made as the bot attempts to juggle complex strands of information in its limited working memory.

## *Step 1* - Pick your poison
I've been tinkering with OpenAI Large Language Models for some time, with *GPT3.5-turbo* being my go-to LLM for most applications (at least, until they deign to let me into the *GPT4* beta). The API is pretty simple to use, even for a complete novice who can barely tell his ` await` from his `async`. 

I've built a few silly little programmes around it, and embedded it nicely into my workflow too.

Generally, OpenAI's LLMs are some of the best (call it first-mover advantage). But the models still struggle a little with longer queries. And if my idea of feeding an entire report into one of these models is to succeed, a bot with a longer attention span would be needed.

Enter: **Claude**. 

On the surface, there's little to distinguish it from OpenAI, Bard or even Bing. In fact, Claude is perhaps a little less capable than its cousins, despite the Google investment: it struggles with producing meaningful code, and unlike Bard or Bing it *doesn't* have access to the Internet, leaving it pretty oblivious to the world around it. This is, notionally, by design: Anthropic is very proud of their [more stringent approach](https://www.anthropic.com/product#:~:text=Helpful%20and%20trustworthy,partners%20with%20grace.) to ethics and prompt-injections, which may be [no bad thing](https://fortune.com/2023/05/03/openai-ex-safety-researcher-warns-ai-destroy-humanity/) in the long run, but leaves Claude a little more restricted than its easily-hypnotised relatives.

All that aside, Claude also now has a USP, perfect for our needs: a massively increased context threshold. Simply put: whereas other chatbots tend to [lose the plot](https://spectrum.ieee.org/ai-hallucination) around the 1,500 word mark, Claude can now comfortably handle 50 times that, enough to digest [over-rated American fiction](https://twitter.com/AnthropicAI/status/1656700156518060033) with ease. And more than enough to read the average Ofsted report.

*"But hang on, Max! Surely if Bing and Bard have access to the web, we can just bung them a link to the PDF and ask them to do our bidding?" *

That is true, though with two caveats:
* **A) APIs** - Neither Google nor Microsoft have opened up the APIs for their chatbots yet, and given their commitment to their ecosystems such access will be likely limited when it does come. If our programme is going to have any flexibility, we want to be able to plug the bot directly into the code. 
* **B) Bonkers** - Having played around with both, Bing and Bard have a tendency to make things up. Even the new and improved Bard will play fast and loose when presented with a page containing lots of text, like a hungover undergrad in a Lit seminar (more than once I've had it swear blind that 'Macbeth' is actually 'Tom Sawyer', only to change its mind to say ah, yes, it was wrong: that text was actually 'Huckleberry Finn').

So Monsieur Claude remains our best bet.

## *Step 2* Bonjour, Claude
So, we've settled on our preferred AI candidate. Now - how do we get it working?

Whilst I'm pretty *aufait* with the OpenAI way of doing things, the Claude set-up is a bit trickier. For starters: most of documentation nudges you towards Python or dependency-heavy TypeScript, which is anathema to my vanilla Javascript tendencies. No matter: we can mostly tweak our existing OpenAI code to accommodate the Claude API end points. 

The main difference to bear in mind is that Claude is wholly completion-focussed. It functions much more like predictive text. Unlike ChatGPT, we have to be very explicit in telling it when we've stopped 'speaking', and when it needs to start. If we fail to do that, it'll just talk to itself until the cows come home, or it runs out of tokens.

To start: we'll set up a new folder - `ClaudeProject` - for our workspace, and save a new file for our script called `claude.js`. 

Then, let's begin our script by declaring the function `askClaude()` with the query as a parameter for our function. This won't be passed directly to the API endpoint: as we'll see in a second, we need to phrase our actual prompt quite carefully, unlike when using the OpenAI model.
```javascript
function askClaude(userQuestion) {
    let apiKey = 'key-goes-here'
    let url = 'https://api.anthropic.com/v1/complete/';
```
Helpfully, all the Claude models use the same endpoint URL, so we can just declare that up at the top of the function and decide on the model we want later on. For simplicity's sake, the API key can get declared as a variable here too, though obviously if you're sticking this in a public repo you'll want to change that (one day, I'll learn how to use .env, I promise).

Moving on to making our API request, things look pretty similar to the OpenAI API: sent via JSON, with `method`, `headers` and `body` declared, the latter stringified. There are a few little twists, however:
1. We authenticate the API key using 'X-API-Key' rather than 'Authorisation: Bearer'.
2. We must include the specified roles, complete with linebreaks, **in the prompt itself**.
3. We must include a stop sequence, otherwise it'll witter on to itself forever.
```javascript
fetch(url, {
    method: 'POST',
    headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        //Note the roles being declared IN the prompt!
        prompt: `\n\nHuman: ${userQuestion}.\n\nAssistant:`,
        //We'll change this model, but keep it for now
        model: `claude-instant-v1`,
        max_tokens_to_sample: 200,
        //Don't forget this, otherwise it won't know when to stop
        stop_sequences: ["\n\nHuman:"],
        //This can stay as the default '1' for the time being
        temperature: 1
    })
```
Finally, we want to get our response, and parse it into something readable. Like with OpenAI, the response is returned in JSON format, but with slightly less extraneous information. Our code here can look a little cleaner as a result, all we need to ask for to get the text response to our prompt is `data.completion`.
```javascript
}).then(response => {
    return response.json()
}).then(data => {
    var newReply = data.completion
    console.log(newReply)
})
    .catch(error => {
        console.log(error);
    });
}
```
And voila! When calling our function with `console.log(askClaude("Bonjour Claude, how are you today?"))` , we get a lovely little reply along the lines of…
```
Bonjour! Je m'appelle Claude, l'assistant virtuel d'Anthropic.
```
How polite, if a bit keen to show off its *Française*. It's also reasonably quick - about 400ms from receiving the prompt to returning a reply, if the data in `console.log(response)` is to be believed (add that to the first `.then` stage, if you're keen to see other info like tokens used).

We've now got Claude at our beck and (API) call. The `newReply` variable can be our starting point for any of the clever business we want to carry out later on. But next: let's put it through its paces.

## Step 3 - Reading, 'Riting, and *readFileSync* 

We've chosen Claude for its ability to read reams of context. So how do we actually get the context into its maw?

Fortunately, Javascript has a straightforward module to allow programmes to read other files, be they TXT, HTML or CSV. We don't know what our contextual corpus is going to look like yet, but let's at least plug in this functionality to our script to see if it works in principle.

We can add this through the`readFileSync` function of the `fs` module, which we integrate like so, adding it at the top of our `askClaude()` function:
```javascript
const fs = require('fs');
const fileContext = fs.readFileSync(`${filePath}`).toString()
```
Our function is now ready to start reading a file: whatever we specify in the `filePath` variable (declared as a parameter when calling the function) will be fed through to the first second line of code. `readFileSync` will do its job, and the `.toString()` operator will take that file and squish it down into an easily operable string for us, which we've designated as the variable `fileContext`.

For example: say we have our favourite Shakespearean tragedy saved as a text file. We simply copy the path to the file and plonk it into  `readFileSync`…
```javascript
const fs = require('fs');
const fileContext = fs.readFileSync(`/ClaudeProject/Macbeth.txt`).toString()
```
…and it's now stored in the variable `fileContext`. 

Let's call it with `console.log(fileContext)`and see what happens:
```
ACT I
SCENE I. An open Place.
Thunder and Lightning. Enter three Witches.

FIRST WITCH: When shall we three meet again?
```
…and so on. 

Brilliant: the context is ready; let's plug it into Claude and see what it can do. The simplest way to do this is to tack it onto the prompt itself, with a bit of preamble to make clear that the string is contextual and not part of the request; we'll tweak the `prompt` line of the JSON request accordingly.
```javascript
prompt: `\n\nHuman: ${userQuestion} \n START OF CONTEXT: ${fileContext} END OF CONTEXT.\n\nAssistant:`,
```
( YMV, as always with these capricious machines, but I've found this sort of thing tends to work.) In principle then, Claude ought to be able to take our question and apply it to the context we've provided. Shall we see how it does?

*In no way inspired by any of my students, past or present*, this seems likes a suitable request: 
```javascript
askClaude("Can you summarise the following text? Use language suitable for a six-year-old. Restict your reply to 40 words.")
```
Claude's own documentation encourages the restriction of requests to simple, short phrases, using linebreaks if possible. I've certainly found that it responds better to these blunt bulletpoints than multi-clausal strings. After a couple of seconds, we have our response:
```
CLAUDE RESPONSE
```
Eureka! It can read! Now, we mustn't get too excited: any bot worth its tokens can answer questions about Macbeth, given the sheer quantity of content in the training data that refers to the Bard (not that one). For comparison, here's what we get when we ask Bard (yes that one) to `Summarise Macbeth. Use language suitable for a six-year-old. Restrict your reply to 40 words`:

Both pretty good. But the crucial difference here is that Claude is looking *directly* at the text itself: not some compressed, lossy version of the text that it *thinks* it remembers from its training. In taking command over what it reads, we can exercise far more control over what it outputs. Claude can begin to function much more like a tool for textual *analysis*, rather than autocorrect.

## Step 4 - Collecting context
As the name suggests, Large Language Models like Claude work from a *large* body of *language*: a corpus of material that they've had fed into them, with occasional nudges and rewards from their programmers, til eventually they've taken in so much material that they can start reproducing the patterns found in the corpus. Much like an undergraduate. 

Were I a more capable programmer (with a budget of more than zero pounds), I'd know how to create my own Large Language database to train my own personal LLM on. But I'm not, so I don't, thus we won't. As it stands, Claude's hefty context window should more than suffice for our needs: reading reports and passing feedback. The corpus our 'model' will be trained will be in the scale of tens of thousands - rather than trillions - of words.

To build this, we 



## Step 5 - Running reports

