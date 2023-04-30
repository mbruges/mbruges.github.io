/*A script to generate new words of the day (rather than relying on MacOS shortcuts)

Script should:
1) Submit request for word via API call and check against previous words
2) Submit request for worksheet via API call
    These should be relatively straightforward. For list of previous words, can probably set this up as an array?
3) Save material (and surrounding code) as an HTML document in the WOTD archive
    Again, have script for this already.
4) Update the 'wotd' page to reflect this new document
    This will require the creation of an iframe, and perhaps a on-load script on the wotd page to always load the day's page (based on six digit date code?)
5) Add it as link on the archive page?
    Not sure about this yet. Need to find an automated Index table...
*/


