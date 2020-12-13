javascript:(function () {

	/******** CONSTANTS *********/

	var SHOW_REPLY_TIMEOUT_MILLIS = 400;
	var SHOW_REPLY_LOAD_DELAY_MILLIS = 1000;

	/****** CLASS/ID NAMES ******/

	/* Replies */
	var REPLY_CLASS_NAME = 'div._2b1h, .async_elem';
	var REPLY_ATTRIBUTE = 'data-sigil';
	var REPLY_SEE_MORE_ATTRIBUTE_VALUE = 'replies-see-more';

	/* Header stuff */
	var HEADER_NOTICES = 'header-notices';
	/* search|posts|photos|groups|pages|...*/
	var SEARCH_BAR = 'm:chrome:schedulable-graph-search';
	var CHROME_HEADER = 'MChromeHeader';
	/* like|comment buttons */
	var LIKE_COMMENT_BUTTONS = 'footer';
	/* remove More options (...) */
	var MORE_OPTIONS = 'div._5s61._2pis';

	/* User stuff */
	var WRITE_A_COMMENT = 'div._uwt._45kb._3ioy';
	var I_BET_IT_WAS_SOMETHING_REDUNDANT_AT_SOME_POINT = 'div._uwt._3ioy.async_composer._4m0q';
	var HIDDEN_ELEMENT = 'hidden_elem';

	/* Footer stuff */
	/* mute message | loading messages | reaction comment stuff | ... */
	var LOADING_MESSAGES = 'flyout-nocontext-root';
	var STATIC_TEMPLATES = 'static_templates';
	var VIEWPORT_AREA_NR1 = 'u_0_e';
	var VIEWPORT_AREA_NR2 = 'mErrorView';
	/* View timeline | Add to group | Invite to Event */
	var POPUP_BUTTONS = 'div._5ar5';


	/****** REGEX STATEMENTS *****/
	var LINK_STYLESHEET_REGEX = new RegExp(/<link (type=\"text\/css\"|rel=\"stylesheet\").+?>/, 'g');
	var FACEBOOK_LINK_WRAPPER_REGEX = new RegExp(/<a href=\"https?:\/\/lm\.facebook\.com\/l\.php\?u=(.+?)\%(3F|26)fbclid.+?\"/, 'g');
	var TIME_LIKE_REPLY_MORE_REGEX = new RegExp(/<div class=\"_2b08 _4ghu\".+?>More<\/a><\/div>/, 'g');
	var USER_LINK_URLS_REGEX = new RegExp(/href=\"(\/.+?)(\&amp;.+?\"|\")/, 'g');
	var SCRIPT_REGEX = new RegExp(/<script.+?(<\/script>|\/>)/, 'g');
	var LINK_SCRIPT_REGEX = new RegExp(/<link[^>]+?\"script\".+?>/, 'g');
	var ACTOR_NAME_REPLACE_REGEX = new RegExp(/actor_name\&quot;:\&quot;(.+?)\&quot;/, 'g');

	/* Regex string */
	var ACTOR_ID_REGEX = "actor_id\&quot;:(.+?),";
	var ACTOR_NAME_REGEX = "actor_name\&quot;:\&quot;(.+?)\&quot;";

	/********* FUNCTIONS *********/

	/* Expands hidden replies */
	async function showRepliesAsync() {
		console.log("Showing replies");
		console.time("Replies shown");

		/* Array with only valid reply nodes */
		var replyArray = Array.from(document.querySelectorAll(REPLY_CLASS_NAME)).filter(item => item.getAttribute(REPLY_ATTRIBUTE) == REPLY_SEE_MORE_ATTRIBUTE_VALUE);
		
		var numberOfReplies = replyArray.length;
		var replyIndex = 0;
		
		var lastClick;
		replyArray.forEach(replyNode => { 
			lastClick = clickReplyDelayed(replyIndex++, numberOfReplies, replyNode);
		});

		await lastClick;
		await loadDelay();
		console.timeEnd("Replies shown");
	}

	/* Clicks reply in a delayed manner */
	function clickReplyDelayed(replyIndex, numberOfReplies, replyNode) {
		return new Promise(clickFun => {
				setTimeout(() => {
					replyNode.firstElementChild.click();
					console.log("Reply clicked = " + (replyIndex+1) + "/" + numberOfReplies);
					clickFun();
				}, SHOW_REPLY_TIMEOUT_MILLIS * replyIndex)
			});
	}

	/* Add a delay for the last reply to load fully*/
	function loadDelay() {
		return new Promise(loadDelay => {
			setTimeout(() => {
				console.log("Load delay finished");
				loadDelay();
			}, SHOW_REPLY_LOAD_DELAY_MILLIS);
		});
	}

	/* Remove document stuff from upper part of the body */
	function removeDocumentHeader() {
		replaceOuterHTMLById(HEADER_NOTICES);
		replaceOuterHTMLById(SEARCH_BAR);
		replaceOuterHTMLById(CHROME_HEADER);
		replaceOuterHTMLByClassName(LIKE_COMMENT_BUTTONS);
		replaceOuterHTMLByClassName(MORE_OPTIONS);
	}

	function removeDocumentMiddleStuff() {
		replaceOuterHTMLByClassName(I_BET_IT_WAS_SOMETHING_REDUNDANT_AT_SOME_POINT);
		replaceOuterHTMLByClassName(WRITE_A_COMMENT);
		replaceOuterHTMLByClassName(HIDDEN_ELEMENT);
	}

	function removeDocumentFooterStuff() {
		replaceOuterHTMLById(LOADING_MESSAGES);
		replaceOuterHTMLById(STATIC_TEMPLATES);
		replaceOuterHTMLById(VIEWPORT_AREA_NR1);
		replaceOuterHTMLById(VIEWPORT_AREA_NR2);
		replaceOuterHTMLByClassName(POPUP_BUTTONS);
	}

	/* Removes stuff from the window.document element */
	function removeDocumentStuff() {
		removeDocumentHeader();
		removeDocumentMiddleStuff();
		removeDocumentFooterStuff();
	}

	/* Removes user id (actorId) and user name and surname (actorName) from the whole HTML */
	function replaceCurrentUserDetails(body) {
		var actorId = body.match(ACTOR_ID_REGEX)[1];
		var actorName = body.match(ACTOR_NAME_REGEX)[1];

		console.log("Remove user details = [{actorId=" + actorId + "}, {actorName=" + actorName + "}]");

		var actorIdRegex = new RegExp(actorId, "g");
		var actorNameRegex = new RegExp(actorName, "g");
		/* replace ID through whole file */
		body = body.replace(actorIdRegex, "");
		/* Replace only Name in data (in case of current user actually commenting the post)*/
		body = body.replace(ACTOR_NAME_REPLACE_REGEX, function(fullString, actorName) {
			return fullString.replace(actorName, "");
		});
		return body;
	}

	function replaceLinks(body) {
		/* replace external links with direct external links (without lm.facebook redirect)*/
		body = body.replace(FACEBOOK_LINK_WRAPPER_REGEX, function(fullString, matchedEncodedLink) {
 			return "<a href=\"" + decodeURIComponent(matchedEncodedLink) + "\"";
 		});

		/* remove time|like|reply|more */
		body = body.replace(TIME_LIKE_REPLY_MORE_REGEX, "");

		/* add Facebook host name to user urls */
		body = body.replace(USER_LINK_URLS_REGEX, function(fullString, userLinkUrl, redundantString) {
			return "href=\"https://www.facebook.com" + userLinkUrl + "\"";
		});

		/* replace mobile facebook urls with desktop facebook urls */
		body = body.replace("m.facebook.com", "www.facebook.com");

		return body;
	}

	function replaceScripts(body) {
		/* remove scripts */
		body = body.replace(SCRIPT_REGEX, "");
		
		/* remove script links */
		body = body.replace(LINK_SCRIPT_REGEX, "");
		return body;
	}

	/******* HELPER FUNCTIONS ******/

	function replaceOuterHTMLByClassName(className) {
		Array.from(document.querySelectorAll(className)).forEach(item => {
			item.outerHTML = "";
		});
	}

	function replaceOuterHTMLById(id) {
		var element = document.getElementById(id);
		if (element !== null) {
			element.outerHTML = "";
		}
	}

	/* Retrieves the stylesheet links from the header */
	function getLinkStylesheets() {
		var html = document.documentElement.innerHTML;
		var linkStylesheetList = [];
		Array.from(html.matchAll(LINK_STYLESHEET_REGEX)).forEach(item => {
			linkStylesheetList.push(item[0]);
		});
		return linkStylesheetList;
	}

	function getBody() {
		return document.getElementsByTagName('body')[0].outerHTML;
	}

	function assembleRefactoredHtml(body) {
		var stylesheets = getLinkStylesheets();

		var newHtml = "<html><head>";
		stylesheets.forEach(item => {
			newHtml += item;
		});
		newHtml += "</head>";
		newHtml += body;
		newHtml += "</html>";
		return newHtml;
	}

	/* Download the file and save it locally */
	function download(html) {
		var filename = "post-" + Date.now() + ".html";

		var element = document.createElement('a');
		element.setAttribute('href', 'data:text/plain;charset=utf-8,' + 
		encodeURIComponent(html));
		element.setAttribute('download', filename);

		 element.style.display = 'none';
		 document.body.appendChild(element);

		 element.click();

		 document.body.removeChild(element);
	}


	/********* STARTING POINT *******/

	async function letsGetThisPartyStarted() {
		console.log("Start parsing");
		await showRepliesAsync();

		removeDocumentStuff();
		var body = getBody();
		body = replaceCurrentUserDetails(body);
		body = replaceLinks(body);
		body = replaceScripts(body);

		var refactoredHtml = assembleRefactoredHtml(body);
		document.documentElement.innerHTML = refactoredHtml;
		console.log("End parsing");

		console.log("Download");
		download(refactoredHtml);
	}

	console.log("Script injected");
	if (document.readyState == 'complete') {
		letsGetThisPartyStarted();
	} else {
		/* Start the script once the page is fully loaded (along with its resources)*/
		window.addEventListener('load', () => letsGetThisPartyStarted());
	}
})();
