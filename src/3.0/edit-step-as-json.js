pygmy3_0.editStepAsJson = (function() {
    function receiveMessage(response) {
        if (response.message == 'edit-step-as-json-response') {
            console.log('got a edit-step-as-json-response message');

            console.log('json = ' + response.properties.json);

            var showEditorHandler = document.getElementById("bluefin-editstepasjson-showeditorhandler");
            showEditorHandler.attributes['data-json'].value = response.properties.json;
            showEditorHandler.attributes['data-deployment-process-id'].value = response.properties.deploymentProcessId;

            if (showEditorHandler.onClick)
                showEditorHandler.onClick();
            else
                showEditorHandler.click();
        }
    }

    function receiveEditedMessage(response) {
        if (response.message == 'edited-step-as-json-response') {
            console.log('got a edited-step-as-json-response message' + JSON.stringify(response));

            var refreshHandler = document.getElementById("bluefin-editstepasjson-refreshbutton");
            refreshHandler.attributes['status'].value = response.properties.status;

            if (response.properties.status == 'success') {
                message = '';
            }
            else {
                message = 'Failed to save the step. ' + response.properties.errorMessage;
                for(var i = 0; i < response.properties.errors.length; i++) {
                    message += ' ' + response.properties.errors[i];
                }
            }
            refreshHandler.attributes['message'].value = message;
            if (refreshHandler.onClick)
                refreshHandler.onClick();
            else
                refreshHandler.click();
        }
    }

    function angularShowModalDialog(sendMessageHandler) {
    	var showEditorHandler = document.getElementById('bluefin-editstepasjson-showeditorhandler'); 

    	showEditorHandler.onClick = showEditorHandler.onclick = function() { 
            var json = showEditorHandler.attributes['data-json'].value;
            var deploymentProcessId = showEditorHandler.attributes['data-deployment-process-id'].value;
            var element = angular.element("#processEditDropdown");
            var modal = element.injector().get('$modal');
			var modalInstance = modal.open({
                backdrop: "static",
                keyboard: !0,
                size: 'lg',
                template: '<div class="modal-header">\n<button class="close" type="button" data-dismiss="modal" aria-hidden="true" ng-hide="isWorking.busy" ng-click="close()">x</button>\n<h3>Edit Step as JSON</h3>\n</div>\n<div class="modal-body">\n<div id="editStepAsJsonContainer" >\n<div id="editStepAsJson" style="height:600px" class="big-on-full" ui-ace="{ mode: aceMode, onLoad: editorLoaded }" ng-model="view.scriptBody"></div>\n</div>\n</div>\n<div class="modal-footer">\n<spin active="isWorking.busy"></spin>\n<div>\n<button class="btn btn-success" ng-disabled="isWorking.busy" ng-click="execute()">Save</button>\n<button class="btn btn-default" ng-disabled="isWorking.busy" ng-click="cancel()">Cancel</button>\n</div>\n</div>\n',
                controller: function ($scope, $modalInstance) {
                  $scope.view = {
                     scriptBody: json 
                  },
                  $scope.close = function () { $modalInstance.close(); };
                  $scope.cancel = function() { $modalInstance.close(); };
                  $scope.execute = function() {
                    var updatedJson = $scope.view.scriptBody;
                    var submitHandler = document.getElementById('bluefin-editstepasjson-submitbutton');
                    submitHandler.attributes['data-json'].value = updatedJson;
                    submitHandler.attributes['data-deployment-process-id'].value = deploymentProcessId;
                    if (submitHandler.onClick)
                        submitHandler.onClick();
                    else
                        submitHandler.click();

                    $modalInstance.close(); //todo: make the dialog stay if there is an error
                  };
                },
                dialogClass: "modal"
            });
		}
    }

    function isProcessEditDropdown(node) {
        return (node.tagName == 'SCRIPT' && node.id == 'processEditDropdown');
    }

    function editStepAsJson(sender, sendMessageHandler, receiveMessageHandler) {
        var menuItem = this;
        var stepId = this.parentElement.attributes["data-step-id"].value;

        var isAction = this.parentElement.attributes["data-is-child"].value == 'true';
        var deploymentProcessId = this.parentElement.attributes["data-deployment-process-id"].value;
        console.debug("sending edit-step-as-json message for stepId '" + stepId + "'");

        sendMessageHandler = sendMessageHandler || chrome.runtime.sendMessage;
        receiveMessageHandler = receiveMessageHandler || receiveMessage;

        sendMessageHandler({ name: 'edit-step-as-json', properties: {} }); // Analytics
        sendMessageHandler({ message: 'edit-step-as-json', properties: { stepId: stepId, deploymentProcessId: deploymentProcessId }}, receiveMessageHandler);
        return false;
    }

    function addEditStepAsJsonMenuItem() {
        console.debug("Adding 'edit step as json' menu item to dropdown menu")
        var menu = document.querySelector("ul.dropdown-menu[role='menu']");

        var newMenuItem = document.createElement('li')
        newMenuItem.className = 'divider';
        menu.appendChild(newMenuItem);

        newMenuItem = document.createElement('li')
        newMenuItem.innerHTML = '<a tabindex="-1" href="">Edit step as JSON</a>'
        newMenuItem.onClick = newMenuItem.onclick = editStepAsJson;
        menu.appendChild(newMenuItem);
    }

    function addEditStepAsJsonMetaData() {
        console.debug(" - adding step id and deploymentprocess id to dropdown template")
        var template = document.getElementById('processEditDropdown');
        template.text = template.text.replace(
          '<ul class="dropdown-menu" role="menu">',
          '<ul class="dropdown-menu" role="menu" data-step-id="{{step.Id}}" data-deployment-process-id="{{project.DeploymentProcessId}}" data-action-id="{{action.Id}}" data-is-child="{{isChild}}">');
    }

    function addEditStepAsJsonRefreshHandler(octopusVersion) {
        if (!document.getElementById('bluefin-editstepasjson-refreshbutton')) {
            //handles response from background page for 'get json' request, showing editor 
            console.debug(" - creating edit handler element")
            var showEditorHandler = document.createElement('span');
            showEditorHandler.id = 'bluefin-editstepasjson-showeditorhandler';
            var attribute = document.createAttribute("data-json");
            attribute.value = "";
            showEditorHandler.setAttributeNode(attribute);
            attribute = document.createAttribute("data-deployment-process-id");
            attribute.value = "";
            showEditorHandler.setAttributeNode(attribute);
            document.body.appendChild(showEditorHandler);

            console.debug(" - creating edit handler script")
            var showEditorHandlerScript = document.createElement("script");
            showEditorHandlerScript.id = 'bluefin-editstepasjson-edithandler';
            showEditorHandlerScript.type = 'text/javascript';
            var functionAsText = angularShowModalDialog.toString()
            if (commonpygmy.isNewerVersionThan(octopusVersion, "3.4.0")) {
                functionAsText = functionAsText.replace(/\$modal/g, "$uibModal");
            }
            showEditorHandlerScript.text = functionAsText.slice(functionAsText.indexOf("{") + 1, functionAsText.lastIndexOf("}"));
            document.body.appendChild(showEditorHandlerScript);

            //handles response from background page for 'put json' request, showing editor 
            console.debug(" - creating refresh handler element")
            var rerfeshHandler = document.createElement('span');
            rerfeshHandler.id = 'bluefin-editstepasjson-refreshbutton';
            var attribute = document.createAttribute("status");
            attribute.value = "";
            rerfeshHandler.setAttributeNode(attribute);
            attribute = document.createAttribute("message");
            attribute.value = "";
            rerfeshHandler.setAttributeNode(attribute);
            document.body.appendChild(rerfeshHandler);

            console.debug(" - creating refresh handler script")
            var refreshHandlerScript = document.createElement("script");
            refreshHandlerScript.id = 'bluefin-editstepasjson-refreshhandler';
            refreshHandlerScript.type = 'text/javascript';
            refreshHandlerScript.text = "var rerfeshHandler = document.getElementById('bluefin-editstepasjson-refreshbutton'); rerfeshHandler.onClick = rerfeshHandler.onclick = function() { if (this.attributes['status'].value == 'success') { angular.element(\"#processEditDropdown\").injector().get(\"$route\").reload();} else { angular.element(\"#processEditDropdown\").injector().get(\"octoDialog\").messageBox('Edit Step as JSON Failed', this.attributes['message'].value, [{label: 'ok'}]);} }";
            document.body.appendChild(refreshHandlerScript);

            //handles submit json request to push to background page
            console.debug(" - creating submit handler element")
            var submitHandler = document.createElement('span');
            submitHandler.id = 'bluefin-editstepasjson-submitbutton';
            var attribute = document.createAttribute("data-deployment-process-id");
            attribute.value = "";
            submitHandler.setAttributeNode(attribute);
            attribute = document.createAttribute("data-json");
            attribute.value = "";
            submitHandler.setAttributeNode(attribute);
            submitHandler.onClick = submitHandler.onclick = function() { 
                        chrome.runtime.sendMessage({ 
                            message: 'edited-step-as-json', 
                            properties: {
                                json: submitHandler.attributes['data-json'].value, 
                                deploymentProcessId: submitHandler.attributes['data-deployment-process-id'].value 
                            }
                    }, receiveEditedMessage)}
            document.body.appendChild(submitHandler);
        }
    }

    function addEditStepAsJsonMenuItems(node) {
        var normalStep = "{id: 'processEditDropdown', scope: { step: step, action: step.Actions[0] } }";
        var parentStep = "{id: 'processEditDropdown', scope: { step: step } }";
        var childStep = "{id: 'processEditDropdown', scope: { step: step, action: action, isChild: true } }";

        var nodes = node.querySelectorAll("DIV.menu-button A[external-dropdown]");
        for(i = 0; i < nodes.length; i++ ) {
            var dropdownType = nodes[i].attributes['external-dropdown'].value
            if ((dropdownType == normalStep) || (dropdownType == parentStep) || (dropdownType == childStep)) {
            	var oldClickHandler = nodes[i].onclick;
                nodes[i].onClick = nodes[i].onclick = function() { if (oldClickHandler) oldClickHandler(); addEditStepAsJsonMenuItem(); }
            }
        }
    }

    function nodeMutated(node, octopusVersion) {
        if (node.querySelector("#processEditDropdown")) {
            console.debug("Loading Blue fin feature 'edit step as json'");
            addEditStepAsJsonMetaData();
            addEditStepAsJsonRefreshHandler(octopusVersion);
        }
        addEditStepAsJsonMenuItems(node);
    }

    function nodesMutated(nodes, octopusVersion) {
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            if (node.nodeType != 1) return; // Not an element just ignore.
            nodeMutated(node, octopusVersion);
        }
    }

    function observe(content, octopusVersion) {
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                nodesMutated(mutation.addedNodes, octopusVersion);
            });
        });
        observer.observe(content, { childList: true, subtree: true, attributes: false, characterData: false});

        chrome.runtime.onMessage.addListener(receiveMessage);
    }

    return {
        observe: observe,
        receiveMessage: receiveMessage,
        receiveEditedMessage: receiveEditedMessage,
        editStepAsJson: editStepAsJson,
        addEditStepAsJsonMetaData: addEditStepAsJsonMetaData,
        addEditStepAsJsonMenuItem: addEditStepAsJsonMenuItem,
        addEditStepAsJsonRefreshHandler: addEditStepAsJsonRefreshHandler,
        addEditStepAsJsonMenuItems : addEditStepAsJsonMenuItems
    };
})();