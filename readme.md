# Flyertalk Print Preview - All page generator
Tool to generate a single, large HTML file containing an entire thread from FlyerTalk, to allow for analysis (e.g. through ChatGPT).

## Usage
* Go to the beginning of a flyertalk thread.
* Choose Thread Tools > Show Printable Version. 
* The URL to this page is what should go in szUrl1. 
* Append ?pp=40 so we don't have to make so many requests.  (This can be done with the link to show 40 posts.
* Edit parse_flyertalk.mjs, update szUrl1 to the first page url you want.
* Run `node parse_flyertalk.mjs > out.html`.  Progress/pages will be printed to stderr.

## Requirements
* node
```
npm create -y
npm install @mozilla/readability jsdom axios
node parse_flyertalk.mjs > out.html
```
