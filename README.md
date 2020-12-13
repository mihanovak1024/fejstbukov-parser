# fejstbukov-parser
## Introduction
Bookmarklet for Fejstbuk post parsing into a format non-registered users can read,
but retains the functionality of accesing specific user accounts only by being logged in. 

## Functionality
Mobile version of a single Fejstbuk post:
- is openned fully (replies/comments are expanded)
- all external urls are unwrapped (no Fejstbuk redirections) and can be accessed directly
- current user (actor) id is removed through the whole document
- all Fejstbuk scripts are removed
- the CSS style of the document is retained
- user accounts in the post can be accessed only through user login
- all redundant elements are removed (reply/comment edit texts, like/comment buttons, time divs,...)
- the parsed HTML document is downloaded into a local file named "post-[timestampOfParsing].html"

## Use
1. Copy the contents of the [fejstbukovParserBookmarklet.js](../blob/main/fejstbukovParserBookmarklet.js) and save it into a Bookmark.
2. Go to desired Fejstbuk post
3. Click the created Bookmark
4. Find the HTML document in the default browser's download folder

## Caveats
- Only mobile version of the post is working
- User needs to manually change the desktop url to mobile url of the post
