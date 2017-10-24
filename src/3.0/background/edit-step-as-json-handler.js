pygmy3_0.editStepAsJsonHandler = (function() {

	function handleEditStepGetResponse(response, sendResponse, stepId, deploymentProcessId) {
		var step = response.Steps.filter(function(step) { return step.Id == stepId })[0];
		var json = JSON.stringify(step, null, 2);

		var response = { message: 'edit-step-as-json-response', properties: { status: 'success', json: json, deploymentProcessId: deploymentProcessId} };
		console.log('sending edit-step-as-json-response: ' + JSON.stringify(response, null, 2));
		sendResponse(response);
	}

	function handlePutResponse(status, putResponse, sendResponse, stepId, deploymentProcessId) {
		console.debug("Received put reponse");
		console.debug(putResponse);

		var result = JSON.parse(putResponse);
		var response;
		if (status == 200 ) {
			response = { message: 'edited-step-as-json-response', properties: { status: 'success', stepId: stepId, deploymentProcessId: deploymentProcessId }};
		}
		else {
			response = { message: 'edited-step-as-json-response', properties: { status: 'failure', errorMessage: result.ErrorMessage, errors: result.Errors }}
		}
		console.log('sending edited-step-as-json-response: ' + JSON.stringify(response));
		sendResponse(response);
	}

	function handleEditedStepGetResponse(response, sendResponse, stepId, deploymentProcessId, json, url, putJsonRequest, installationId, antiForgeryToken) {
		var step = response.Steps.filter(function(step) { return step.Id == stepId })[0];
		var index = response.Steps.indexOf(step);

		response.Steps[index] = JSON.parse(json);

		putJsonRequest(url, response, installationId, antiForgeryToken, function (status, response) { handlePutResponse(status, response, sendResponse, stepId, deploymentProcessId); })
	}

	function getJsonResponse(url, handler) {
		nanoajax.ajax(url, function(status, response){
			console.debug("Received " + status + " response from " + url);
			console.debug(response);
			var result = JSON.parse(response);
			handler(result);
		});
	}

	function putJsonRequest(url, body, installationId, antiForgeryToken, handlePutResponse) {
		if (installationId && antiForgeryToken) {
			document.cookie = "Octopus-Csrf-Token_" + installationId + "=" + antiForgeryToken;
		}
		nanoajax.ajax({url: url, method: "PUT", body: JSON.stringify(body), headers: {'X-Octopus-Csrf-Token': antiForgeryToken}}, handlePutResponse);
	}

	function handleEditStepAsJsonRequest(request, sendResponse, octopusRoot, getJsonResponse, handleEditStepGetResponse) {
		var stepId = request.properties.stepId;
		var deploymentProcessId = request.properties.deploymentProcessId;
		console.log("Editing step with stepId '" + stepId + "', deploymentProcessId '" + deploymentProcessId + "'");

		var url = octopusRoot + "/api/deploymentprocesses/" + deploymentProcessId;

		var handler = function (response) { handleEditStepGetResponse(response, sendResponse, stepId, deploymentProcessId); };
		getJsonResponse(url, handler);
	}

	function handleEditedStepAsJsonRequest(request, sendResponse, octopusRoot, getJsonResponse, handleEditedStepGetResponse, putJsonRequest) {
		var json = request.properties.json;
		var deploymentProcessId = request.properties.deploymentProcessId;
		var antiForgeryToken = request.properties.antiForgeryToken;
		var installationId = request.properties.installationId;

		try{
			var step = JSON.parse(json);
		}
		catch(err) {
			response = { message: 'edited-step-as-json-response', properties: { status: 'failure', errorMessage: "Failed to parse json", errors: [ String(err) ] }}
			console.log('sending edited-step-as-json-response: ' + JSON.stringify(response));
			sendResponse(response);
			return;
		}
		var stepId = step.Id;

		console.log("Editing step with stepId '" + step.Id + "', deploymentProcessId '" + deploymentProcessId + "'");

		var url = octopusRoot + "/api/deploymentprocesses/" + deploymentProcessId;

		var handler = function (response) { handleEditedStepGetResponse(response, sendResponse, stepId, deploymentProcessId, json, url, putJsonRequest, installationId, antiForgeryToken); };
		getJsonResponse(url, handler);
	}

	function editStepAsJson(request, sender, sendResponse, editStepAsJsonHandler, editedStepAsJsonHandler)	{
		if (request.message == 'edit-step-as-json') {
			var octopusRoot = sender.tab.url.substring(0,sender.tab.url.indexOf('/app'));
			editStepAsJsonHandler = editStepAsJsonHandler || handleEditStepAsJsonRequest; //allow tests to override
			editStepAsJsonHandler(request, sendResponse, octopusRoot, getJsonResponse, handleEditStepGetResponse)

			return true; // see https://developer.chrome.com/extensions/runtime#event-onMessageExternal
		}
		else if (request.message == 'edited-step-as-json') {
			var octopusRoot = sender.tab.url.substring(0,sender.tab.url.indexOf('/app'));
			editedStepAsJsonHandler = editedStepAsJsonHandler || handleEditedStepAsJsonRequest; //allow tests to override
			editedStepAsJsonHandler(request, sendResponse, octopusRoot, getJsonResponse, handleEditedStepGetResponse, putJsonRequest)
			return true;
		}
		return false;
	}

	function setup() {
		chrome.runtime.onMessage.addListener(editStepAsJson);
	}

	return {
		setup: setup,
		handleEditStepAsJsonRequest: handleEditStepAsJsonRequest,
		handleEditedStepAsJsonRequest: handleEditedStepAsJsonRequest,
		editStepAsJson: editStepAsJson,
		handlePutResponse: handlePutResponse,
		handleEditStepGetResponse: handleEditStepGetResponse,
		handleEditedStepGetResponse: handleEditedStepGetResponse
	}
})();
