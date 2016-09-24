pygmy3_0.viewReleaseDeploymentProcess = (function() {
	var octopusVersion;

	function receiveMessage(response) {
        if (response.message == 'get-template-response' && response.properties.templateName == 'show-release-deployment-plan.html') {
            console.debug("  - got template 'show-release-deployment-plan.html'");
			console.debug("  - adding handler");
	        var showDeploymentProcessHandlerScript = document.createElement("script");
	        showDeploymentProcessHandlerScript.id = 'bluefin-showreleasedeploymentprocess-handler';
	        showDeploymentProcessHandlerScript.type = 'text/javascript';
	        var functionAsText = angularShowModalDialog.toString()
            if (commonpygmy.isNewerVersionThan(pygmy3_0.viewReleaseDeploymentProcess.octopusVersion, "3.4.0")) {
                functionAsText = functionAsText.replace(/\$modal/g, "$uibModal");
            }
            functionAsText = functionAsText.replace("#{template}", response.properties.template);
	        showDeploymentProcessHandlerScript.text = functionAsText.slice(functionAsText.indexOf("{") + 1, functionAsText.lastIndexOf("}"));
	        document.body.appendChild(showDeploymentProcessHandlerScript);
        }
	}

    function angularShowModalDialog(sendMessageHandler) {
    	var button = document.getElementById('bluefin-showreleasedeploymentprocess-button'); 
    	button.onClick = button.onclick = function() { 
            var analyticsHandler = document.getElementById('bluefin-showreleasedeploymentprocess-analytics-handler');
            analyticsHandler.click();

            var element = angular.element("#content-wrapper");
            var modal = element.injector().get('$modal');
			var modalInstance = modal.open({
                backdrop: "static",
                keyboard: !0,
                size: 'md',
                template: '#{template}',
                controller: function ($scope, $routeParams, busy, pageTitle, octopusRepository, $route, pluginRegistry, octoDialog, $modal, $location, unsavedChanges, $modalInstance) {
			        var isLoading = $scope.isLoading = busy.create();
			        var isSaving = $scope.isSaving = busy.create();
			        $scope.project = null;
			        $scope.close = function () { $modalInstance.close(); };
			        $scope.actionClass = function(action) {
			            return action.ActionType.replace(".", "").toLowerCase()
			        },
			        $scope.canHaveChildren = function(step) {
			            var action = pluginRegistry.getDeploymentAction(step.Actions[0].ActionType);
			            return action.canHaveChildren
			        };
			        $scope.releaseVersion = $routeParams.version;
			        var projectId = $routeParams.id;
			        var version = $routeParams.version;
			        var getTags = function(allOptions, selectedOptions) {
			            if (0 === allOptions.length)
			                return "";
			            var result = [];
			            return _.each(selectedOptions, function(e) {
			                allOptions.indexOf(e.Id) >= 0 && result.push(e.Name)
			            }),
			            result.join(",")
			        };

					//mock out channels for pre-3.2
					var getChannels = octopusRepository.Projects.getChannels || function (project) {
						return Octopus.Client.PromiseWrapper(function(resolve, reject) {
							resolve(null);
						});
					};

			        isLoading.promise(octopusRepository.Projects.get(projectId).then(function(project) {
			            isLoading.promise(octopusRepository.Lifecycles.get(project.LifecycleId).then(function(lifecycleDefinition) {
			                isLoading.promise(octopusRepository.Lifecycles.preview(lifecycleDefinition).then(function(lifecycle) {
			                    isLoading.promise(octopusRepository.Environments.all().then(function(environments) {
			                        isLoading.promise(getChannels(project).then(function(channels) {
			                            isLoading.promise(octopusRepository.Projects.getReleaseByVersion(project, version).then(function(release) {
			                            	isLoading.promise(octopusRepository.DeploymentProcesses.get(release.ProjectDeploymentProcessSnapshotId).then(function(deploymentProcess) {
				                                return $scope.project = project,
				                                $scope.lifecycle = lifecycle,
				                                $scope.environments = environments,
				                                $scope.channels = channels,
				                                $scope.deploymentProcess = deploymentProcess,
				                                $scope.builtInFeedPackageActions = _.filter(_.flatten(_.map(deploymentProcess.Steps, function(s) {
				                                    return s.Actions
				                                })), function(a) {
				                                    return "feeds-builtin" === a.Properties["Octopus.Action.Package.NuGetFeedId"]
				                                }),
				                                _.each(deploymentProcess.Steps, function(s) {
				                                    _.each(s.Actions, function(a) {
				                                        a.environments = getTags(a.Environments, environments);
				                                        if (a.channels)
				                                        	a.channels = getTags(a.Channels, channels.Items)
				                                    })
				                                })
			                            	}))
			                            }))
			                        }))
			                    }))
			                }))
			            }))
			        }));
			    },
                dialogClass: "modal"
            });
		}
    }

    function addDeploymentProcessLink(sendMessageHandler, receiveMessageHandler) {
        if (document.getElementById('bluefin-showreleasedeploymentprocess-button'))
    		return;

        console.log("Loading Blue fin feature 'show release deployment process'");

    	var headings = document.querySelectorAll('h3');
    	var variablesHeading;
    	for(var i=0; i < headings.length; i++ ) {
    		if (headings[i].innerText === 'Variables') {
    			variablesHeading = headings[i];
    		}
    	}
		var variablesNote = variablesHeading.nextSibling.nextSibling;

		console.debug("  - adding new heading");

        var newHeading = document.createElement('h3')
        newHeading.id = 'bluefin-showreleasedeploymentprocess-heading';
        newHeading.className = 'margin-top-20';
        newHeading.innerText = "Deployment Process";
		variablesNote.parentNode.insertBefore(newHeading, variablesNote.nextSibling.nextSibling.nextSibling);

		console.debug("  - adding new desciption text and 'show' link");
        var newDescription = document.createElement('p');
        newDescription.id = 'bluefin-showreleasedeploymentprocess-description';
        newDescription.className = 'subtle';
        newDescription.innerText = 'When this release was created, a snapshot of the project deployment process was taken. '
        var showLink = document.createElement('a');
        showLink.innerText = 'Show »';
        showLink.id = 'bluefin-showreleasedeploymentprocess-button'
        showLink.style.cursor = 'pointer';
		newDescription.appendChild(showLink);
		variablesNote.parentNode.insertBefore(newDescription, newHeading.nextSibling);

        console.debug("  - adding analytics handler");
        var span = document.createElement('span');
        span.id = 'bluefin-showreleasedeploymentprocess-analytics-handler';
        span.onclick = span.onClick = function () {
            chrome.runtime.sendMessage({ name: 'view-deployment-release-process', properties: {} }); // Analytics
        }
        variablesNote.parentNode.appendChild(span);

		console.debug("  - getting template html 'show-release-deployment-plan.html'");
		sendMessageHandler = sendMessageHandler || chrome.runtime.sendMessage;
		receiveMessageHandler = receiveMessageHandler || receiveMessage;
		sendMessageHandler({ message: 'get-template', properties: { templateName: 'show-release-deployment-plan.html' }}, receiveMessageHandler);
    }

	//separate function for mocking
    function getPageLocationHash() {
    	return location.hash;
    }

    function checkIfWeAreOnReleasePage(handler, getPageLocationHashfn) {
    	getPageLocationHashfn = getPageLocationHashfn || getPageLocationHash;
    	hash = getPageLocationHashfn();
        if (hash.match(/#\/projects\/.*\/releases\/[^\/]*$/i)) {
        	//cant use string.prototype.endsWith, as its not available under jasmine
        	//would be nice to fold into the regex above
        	if (hash.indexOf('/create', hash.length - '/create'.length) == -1) { 
	        	handler = handler || addDeploymentProcessLink
	        	handler();
			}
    	}
    }

    function setOctopusVersion(octopusVersion) {
    	this.octopusVersion = octopusVersion;
    }

    function observe(content, octopusVersion) {
    	setOctopusVersion(octopusVersion);
		var observer = new MutationObserver(function(targets, observer) { checkIfWeAreOnReleasePage(); });
        observer.observe(content, { childList: true, subtree: true, attributes: false, characterData: false});

        chrome.runtime.onMessage.addListener(receiveMessage);
    }

    return {
        observe: observe,
        receiveMessage: receiveMessage,
        checkIfWeAreOnReleasePage: checkIfWeAreOnReleasePage,
        addDeploymentProcessLink: addDeploymentProcessLink,
        setOctopusVersion: setOctopusVersion
    };
})();