javascript:(function () {
	var i = 1;

	/* Expand hidden replies */
	function showReplies() {
		Array.from(document.querySelectorAll('div._2b1h, .async_elem')).filter(item => item.getAttribute('data-sigil') == 'replies-see-more').forEach(item => { 
			window.setTimeout(function() {
				item.firstElementChild.click();
				console.log("reply clicked");
			}, 400 * i++);
			console.log("reply shown");
		});
		console.log("continued");
	}

	function getStylesheets() {
		var html = document.documentElement.innerHTML;
		var stylesheet = [];
		Array.from(html.matchAll(/<link (type=\"text\/css\"|rel=\"stylesheet\").+?>/g)).forEach(item => {
			stylesheet.push(item[0]);
		});
		return stylesheet;
	}

	function getBody() {
		return document.getElementsByTagName('body')[0].outerHTML;
	}

	function removeDocumentHeader() {
		replaceOuterHTMLById("header-notices");
		replaceOuterHTMLById("m:chrome:schedulable-graph-search");
		replaceOuterHTMLById("MChromeHeader");
		/* remove like|comment buttons */
		replaceOuterHTMLByClassName("footer");
		/* remove More options (...) */
		replaceOuterHTMLByClassName("div._5s61._2pis");
	}

	function removeDocumentCurrentUserStuff() {
		replaceOuterHTMLByClassName("div._uwt._3ioy.async_composer._4m0q");
		replaceOuterHTMLByClassName("div._uwt._45kb._3ioy");
		replaceOuterHTMLByClassName("hidden_elem");
	}

	function removeDocumentBottomStuff() {
		replaceOuterHTMLById("flyout-nocontext-root");
		replaceOuterHTMLById("static_templates");
		replaceOuterHTMLById("u_0_e");
		replaceOuterHTMLById("mErrorView");
		replaceOuterHTMLByClassName("div._5ar5");
	}

	function removeDocumentStuff() {
		removeDocumentHeader();
		removeDocumentCurrentUserStuff();
		removeDocumentBottomStuff();
	}

	function removeCurrentUserStuff(body) {
		var actorId = Array.from(body.matchAll("actor_id\&quot;:(.+?),"))[0][1];
		var actorName = Array.from(body.matchAll("actor_name\&quot;:\&quot;(.+?)\&quot;"))[0][1];

		console.log("actorId = " + actorId);
		console.log("actorName = " + actorName);

		var actorIdRegex = new RegExp(actorId, "g");
		var actorNameRegex = new RegExp(actorName, "g");
		body = body.replace(actorIdRegex, "").replace(actorNameRegex, "");
		return body;
	}

	function replaceLinks(body) {
		/* replace external links with direct external links (without lm.facebook redirect)*/
		body = body.replace(/<a href=\"https?:\/\/lm\.facebook\.com\/l\.php\?u=(.+?)\%(3F|26)fbclid.+?\"/g, function(a, b) {
    		console.log("a = " + a);
			console.log("b = " + b);
 			return "<a href=\"" + decodeURIComponent(b) + "\"";
 		});

		console.log("replaced external links");

		/* remove time|like|reply|more */
		body = body.replace(/<div class=\"_2b08 _4ghu\".+?>More<\/a><\/div>/g, "");

		/* replace user urls with full path (ads facebook host name) */
		body = body.replace(/href=\"(\/.+?)(\&amp;.+?\"|\")/g, function(a, b, c) {
			return "href=\"https://www.facebook.com" + b + "\"";
		});

		body = body.replace("m.facebook.com", "www.facebook.com");

		return body;
	}

	function replaceScriptStuff(body) {
		/* remove scripts */
		body = body.replace(/<script.+?(<\/script>|\/>)/g, "");
		
		/* remove script links */
		body = body.replace(/<link[^>]+?\"script\".+?>/g, "");
		return body;
	}

	/* HELPER FUNCTIONS */

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

	function assembleNewHtml(body) {
		var stylesheets = getStylesheets();

		var newHtml = "<html><head>";
		stylesheets.forEach(item => {
			newHtml += item;
		});
		newHtml += "</head>";
		newHtml += body;
		newHtml += "</html>";
		return newHtml;
	}

	function init() {
		showReplies();
		console.log("showed replies");

		/* Wait for replies */
		window.setTimeout(function() {
			removeDocumentStuff();

			var body = getBody();
			body = removeCurrentUserStuff(body);
			body = replaceLinks(body);
			body = replaceScriptStuff(body);

			var newHtml = assembleNewHtml(body);
			document.documentElement.innerHTML = newHtml;
		}, i * 400);

	}

	init();
})();
