/*
Attempt to get all print preview pages for a given flyertalk print-preview url.  Then run them through Mozilla Readability, and concatenate them into a single page to feed to ChatGPT.

Usage: Go to the beginning of a flyertalk thread.  Choose Thread Tools > Show Printable Version.  The URL to this page is what should go in szUrl1.  Append ?pp=40 so we don't have to make so many requests.

Saving a ChatGPT convo: Use the Share Button.  Open the shared link in a browser.  Select All (ctrl+a), copy and paste it into SeaMonkey Composer. This will save a relatively clean web page.  The page will have a relatively large file size because all styles will be pasted in line.  This makes a more aesthetically pleasing result than pasting into Word, and uses only free software.
*/
import axios from 'axios';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

//You can put a -1- before printerfriendly, but this will result in a redirection to the first page with no parameters, thus there only being 20 posts per page, resulting in an unnecessary amount of requests.
var szUrl1 = 'https://www.flyertalk.com/forum/hyatt-world-hyatt/2036156-rio-hotel-casino-las-vegas-review-master-thread-destination-other-brands-printerfriendly.html?pp=40';

const resp1 = await axios.get(szUrl1);
//console.log( resp1 );
//console.log( resp1.data );

/*
  Given a string containing an HTML page, returns the URL linked to by the first link found where the title property starts with "Last Page -".  If this is not found, it returns an empty string.
*/
function getLastLinkUrl(rawHTML)
{
  const dom = new JSDOM( rawHTML );
  var lastLinkUrl = '';
  try{
    var lastLink = Array.from(dom.window.document.querySelectorAll('a[title^="Last Page -"]'))[0];
    lastLinkUrl = lastLink.href;
    //console.log('Last link URL:', lastLinkUrl);
  }
  catch(e)
  {
    console.log('last link error:' , e );
  }
  return lastLinkUrl;
}

/*
  Runs the rawHTML through Mozilla Readability and gets a string containing innerHTML.
*/
function cleanHTML(rawHTML)
{
  //const dom = new JSDOM(rawHTML, { url: url });
  const dom = new JSDOM(rawHTML);
  var reader = new Readability(dom.window.document);
  var article = reader.parse();
  return article.content;
}
/*
  Given a URL that ends in a '-', a number followed by "-printerfriendly.html", returns the number.
*/
function getLastPageIndexFromUrl(szUrl)
{
   // Define a regular expression to match the number between the second to last '-' and "-printerfriendly.html"
    const regex = /-(\d+)-printerfriendly\.html/;

    // Use match method to find the number in the URL
    const match = szUrl.match(regex);

    // If a match is found, return the matched number as an integer
    if (match && match[1]) {
        return parseInt(match[1], 10);
    } else {
        // Return null if no match is found
        return null;
    }
}
/*
  Split the URL where the number appears.
*/
function splitUrlAtNumber(url) {
    // Define a regular expression to match the number between the second to last '-' and "-printerfriendly.html"
    const regex = /-(\d+)-printerfriendly\.html/;
    // Find the index where the number starts
    const match = url.match(regex);
    if (match && match.index !== undefined) {
        const index = match.index;
        // Split the URL into two strings at the position of the number
        const firstPart = url.substring(0, index+1);
        var secondPart = url.substring(index+1);
        secondPart = secondPart.substring( secondPart.indexOf('-') );
        return [firstPart, secondPart];
    } else {
        // Return null if no match is found
        return [url, ''];
    }
}

var pageList = [];
var szOut = "";
//Get the last link.
var szLastUrl = getLastLinkUrl( resp1.data );
//console.log( szLastUrl );
var iLastPageIndex = getLastPageIndexFromUrl( szLastUrl );
//console.log( iLastPageIndex );

if( iLastPageIndex == null || iLastPageIndex < 2 )
{
  //we don't need to queue any more pages.
}
else
{
  //there are multiple pages.
  const [firstPart, secondPart] = splitUrlAtNumber(szLastUrl);
  //console.log(firstPart, "\n", secondPart);
  for( var i = 2; i < iLastPageIndex; ++i )
  {
    var szNewUrl = firstPart + i + secondPart;
    //console.log(szNewUrl);
    pageList.push( szNewUrl );
  }
}

//do readability on the first page
szOut = cleanHTML( resp1.data );
for( var i = 0; i < pageList.length; )
{
  console.error( "Getting:", pageList[i] );
  var resp2 = await axios.get(pageList[i]);
  szOut += "<!--" + pageList[i] + "-->\n";
  szOut += "<h1>Page " + i + "</h1>";
  szOut += cleanHTML( resp2.data );
  //console.log( "<h1>RAW: ", pageList[i], "</h1>" );
  //console.log( resp2.data );
  //console.log( "<h1>PAGE: ", pageList[i], "</h1>" );
  ///console.log( cleanHTML( resp2.data ) );
  await delay(1200);
  i++;
}
console.log( szOut );
