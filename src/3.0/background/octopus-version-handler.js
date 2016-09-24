pygmy3_0.octopusVersionHandler = (function() {

	function receiveMessage(request, sender, sendResponse)	{
		if (request.message == 'get-octopus-version')
		{
			var octopusRoot = sender.tab.url.substring(0,sender.tab.url.indexOf('/app'));

			getJsonResponse(octopusRoot + "/api", function(response) {
				var message = { message: 'get-octopus-version-response', version: response.Version };
				sendResponse(message);
			});

			return true; // see https://developer.chrome.com/extensions/runtime#event-onMessageExternal
		}
	}

	function getJsonResponse(url, handler) {
		nanoajax.ajax(url, function(status, response){
			console.debug("Received " + status + " response from " + url);
			console.debug(response);
			var result = JSON.parse(response);
			handler(result);
		});
	}

	function setup()
	{
		chrome.runtime.onMessage.addListener(receiveMessage);
	}

	return {
		setup: setup,
		receiveMessage: receiveMessage
	}
})();
