pygmy3_0.viewReleaseDeploymentProcess = (function() {
  var octopusVersion;

  function receiveMessage(response) {
    if (response.message == 'get-template-response' && response.properties.templateName == 'show-release-deployment-plan.html') {
      console.debug('  - got template \'show-release-deployment-plan.html\'');
      console.debug('  - adding handler');
      var showDeploymentProcessHandlerScript = document.createElement('script');
      showDeploymentProcessHandlerScript.id = 'bluefin-showreleasedeploymentprocess-handler';
      showDeploymentProcessHandlerScript.type = 'text/javascript';
      var functionAsText = angularShowModalDialog.toString();
      if (commonpygmy.isNewerVersionThan(pygmy3_0.viewReleaseDeploymentProcess.octopusVersion, '3.4.0')) {
        functionAsText = functionAsText.replace(/\$modal/g, '$uibModal');
      }
      if (commonpygmy.isNewerVersionThan(pygmy3_0.viewReleaseDeploymentProcess.octopusVersion, '3.8.4')) {
        functionAsText = functionAsText.replace(/\$routeParams/g, '$stateParams');
      }
      functionAsText = functionAsText.replace('#{template}', response.properties.template);
      showDeploymentProcessHandlerScript.text = functionAsText.slice(functionAsText.indexOf('{') + 1, functionAsText.lastIndexOf('}'));
      document.body.appendChild(showDeploymentProcessHandlerScript);
    }
  }

  function angularShowModalDialog(sendMessageHandler) {
    var button = document.getElementById('bluefin-showreleasedeploymentprocess-button');
    button.onClick = button.onclick = function() {
      var analyticsHandler = document.getElementById('bluefin-showreleasedeploymentprocess-analytics-handler');
      analyticsHandler.click();

      var element = angular.element('#content-wrapper');
      var modal = element.injector().get('$modal');
      modal.open({
        backdrop: 'static',
        keyboard: !0,
        size: 'md',
        template: '#{template}',
        controller: function($scope, $routeParams, busy, pageTitle, octopusRepository, pluginRegistry, octoDialog, $modal, $location, unsavedChanges, $modalInstance) {
          var isLoading = $scope.isLoading = busy.create();
          $scope.project = null;
          $scope.close = function() {
            $modalInstance.close();
          };
          $scope.actionClass = function(action) {
            return action.ActionType.replace('.', '').toLowerCase();
          };
          $scope.canHaveChildren = function(step) {
            var action = pluginRegistry.getDeploymentAction(step.Actions[0].ActionType);
            return action.canHaveChildren;
          };

          $scope.releaseVersion = $routeParams.version;
          var projectId = $routeParams.id || $routeParams.projectId;
          var version = $routeParams.version;
          var getTags = function(allOptions, selectedOptions) {
            if (0 === allOptions.length) {
              return '';
            }
            var result = [];
            return selectedOptions.forEach(function(e) {
              allOptions.indexOf(e.Id) >= 0 && result.push(e.Name);
            }),
              result.join(',');
          };

          // mock out channels for pre-3.2
          var getChannels = octopusRepository.Projects.getChannels || function(project) {
            return Octopus.Client.PromiseWrapper(function(resolve, reject) {
              resolve(null);
            });
          };

          function channelMatches(release, action) {
            if (!release.ChannelId || !action.Channels) {
              return true;
            }
            if (action.Channels.length == 0) {
              return true;
            }
            return action.Channels.indexOf(release.ChannelId) > -1;
          }

          isLoading.promise(octopusRepository.Projects.get(projectId).then(function(project) {
            isLoading.promise(octopusRepository.Lifecycles.get(project.LifecycleId).then(function(lifecycleDefinition) {
              isLoading.promise(octopusRepository.Lifecycles.preview(lifecycleDefinition).then(function(lifecycle) {
                isLoading.promise(octopusRepository.Environments.all().then(function(environments) {
                  isLoading.promise(getChannels(project).then(function(channels) {
                    isLoading.promise(octopusRepository.Projects.getReleaseByVersion(project, version).then(function(release) {
                      isLoading.promise(octopusRepository.DeploymentProcesses.get(release.ProjectDeploymentProcessSnapshotId).then(function(deploymentProcess) {
                        var wasDeployedToChannel = release.ChannelId && release.ChannelId.length > 0 && channels && channels.Items.length > 1;
                        var getActionFromStep = function(s) {
                          return s.Actions;
                        };
                        var isBuiltInFeedAction = function(a) {
                          return 'feeds-builtin' === a.Properties['Octopus.Action.Package.NuGetFeedId'];
                        };

                        $scope.project = project;
                        $scope.lifecycle = lifecycle;
                        $scope.environments = environments;
                        $scope.wasDeployedToChannel = wasDeployedToChannel;
                        $scope.channelName = wasDeployedToChannel ? channels.Items.filter(function(c) {
                          return c.Id == release.ChannelId;
                        })[0].Name : null;
                        $scope.channels = channels;
                        $scope.deploymentProcess = deploymentProcess;
                        var mapOfStepsToActions = deploymentProcess.Steps.map(getActionFromStep);
                        var flattenedMapOfStepsToActions = [].concat.apply([], mapOfStepsToActions);
                        $scope.builtInFeedPackageActions = flattenedMapOfStepsToActions.filter(isBuiltInFeedAction);
                        deploymentProcess.Steps.forEach(function(s) {
                          s.Actions.forEach(function(a) {
                            a.channelMatches = channelMatches(release, a);
                            a.environments = getTags(a.Environments, environments);
                            if (a.channels) {
                              a.channels = getTags(a.Channels, channels.Items);
                            }
                          });
                          s.channelMatches = s.Actions.filter(function(a) {
                            return a.channelMatches;
                          }).length > 0;
                        });
                        return;
                      }));
                    }));
                  }));
                }));
              }));
            }));
          }));
        },
        dialogClass: 'modal',
      });
    };
  }

  function addDeploymentProcessLink(sendMessageHandler, receiveMessageHandler) {
    if (document.getElementById('bluefin-showreleasedeploymentprocess-button')) {
      return;
    }

    console.log('Loading Bluefin feature \'show release deployment process\'');

    var headings = document.querySelectorAll('h3');
    var variablesHeading;
    for (var i = 0; i < headings.length; i++) {
      if (headings[i].innerText === 'Variables') {
        variablesHeading = headings[i];
      }
    }
    var variablesNote = variablesHeading.nextSibling.nextSibling;

    console.debug('  - adding new heading');

    var newHeading = document.createElement('h3');
    newHeading.id = 'bluefin-showreleasedeploymentprocess-heading';
    newHeading.className = 'margin-top-20';
    newHeading.innerText = 'Deployment Process';
    variablesNote.parentNode.insertBefore(newHeading, variablesNote.nextSibling.nextSibling.nextSibling);

    console.debug('  - adding new desciption text and \'show\' link');
    var newDescription = document.createElement('p');
    newDescription.id = 'bluefin-showreleasedeploymentprocess-description';
    newDescription.className = 'subtle';
    newDescription.innerText = 'When this release was created, a snapshot of the project deployment process was taken. ';
    var showLink = document.createElement('a');
    showLink.innerText = 'Show »';
    showLink.id = 'bluefin-showreleasedeploymentprocess-button';
    showLink.style.cursor = 'pointer';
    newDescription.appendChild(showLink);
    variablesNote.parentNode.insertBefore(newDescription, newHeading.nextSibling);

    console.debug('  - adding analytics handler');
    var span = document.createElement('span');
    span.id = 'bluefin-showreleasedeploymentprocess-analytics-handler';
    span.onclick = span.onClick = function() {
      chrome.runtime.sendMessage({name: 'view-deployment-release-process', properties: {}}); // Analytics
    };
    variablesNote.parentNode.appendChild(span);

    console.debug('  - getting template html \'show-release-deployment-plan.html\'');
    sendMessageHandler = sendMessageHandler || chrome.runtime.sendMessage;
    receiveMessageHandler = receiveMessageHandler || receiveMessage;
    sendMessageHandler({message: 'get-template', properties: {templateName: 'show-release-deployment-plan.html'}}, receiveMessageHandler);
  }

  // separate function for mocking
  function getPageLocationHash() {
    return location.hash;
  }

  function checkIfWeAreOnReleasePage(handler, getPageLocationHashfn) {
    getPageLocationHashfn = getPageLocationHashfn || getPageLocationHash;
    hash = getPageLocationHashfn();
    if (hash.match(/#\/projects\/.*\/releases\/[^\/]*$/i)) {
      // cant use string.prototype.endsWith, as its not available under jasmine
      // would be nice to fold into the regex above
      if (hash.indexOf('/create', hash.length - '/create'.length) == -1) {
        handler = handler || addDeploymentProcessLink;
        handler();
      }
    }
  }

  function setOctopusVersion(octopusVersion) {
    pygmy3_0.viewReleaseDeploymentProcess.octopusVersion = octopusVersion;
  }

  function observe(content, octopusVersion) {
    setOctopusVersion(octopusVersion);
    var observer = new MutationObserver(function(targets, observer) {
      checkIfWeAreOnReleasePage();
    });
    observer.observe(content, {childList: true, subtree: true, attributes: false, characterData: false});

    chrome.runtime.onMessage.addListener(receiveMessage);
  }

  return {
    observe: observe,
    receiveMessage: receiveMessage,
    checkIfWeAreOnReleasePage: checkIfWeAreOnReleasePage,
    addDeploymentProcessLink: addDeploymentProcessLink,
    setOctopusVersion: setOctopusVersion,
  };
})();
