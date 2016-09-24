pygmy3_0.viewResultantVariableList = (function() {
    function receiveMessage(response) {
        if (response.message == 'get-template-response' && response.properties.templateName == 'view-resultant-variable-list.html') {
            console.debug("  - got template 'view-resultant-variable-list.html'");
            console.debug("  - adding handler");
            var viewResultantVariableListHandlerScript = document.createElement("script");
            viewResultantVariableListHandlerScript.id = 'bluefin-viewresultantvariablelist-handler';
            viewResultantVariableListHandlerScript.type = 'text/javascript';
            var functionAsText = angularShowModalDialog.toString()
            functionAsText = functionAsText.replace("#{template}", response.properties.template.replace(/'/g,"\\'"));
            viewResultantVariableListHandlerScript.text = functionAsText.slice(functionAsText.indexOf("{") + 1, functionAsText.lastIndexOf("}"));
            document.body.appendChild(viewResultantVariableListHandlerScript);
        }
    }

    function angularShowModalDialog() {
        var button = document.getElementById('bluefin-viewresultantvariablelist-button');
        button.onClick = button.onclick = function() {
            var analyticsHandler = document.getElementById('bluefin-viewresultantvariablelist-analytics-handler');
            analyticsHandler.click();

            var element = angular.element("#content-wrapper");
            var modal = element.injector().get('$modal');
            var modalInstance = modal.open({
                backdrop: "static",
                keyboard: !0,
                size: 'lg',
                template: '#{template}',
                controller: function ($scope, $routeParams, busy, pageTitle, octopusRepository, $route, pluginRegistry, octoDialog, $modal, $location, unsavedChanges, $modalInstance) {
                    var isLoading = $scope.isLoading = busy.create();
                    var isSaving = $scope.isSaving = busy.create();
                    var formatted = {};
                    $scope.close = function () { $modalInstance.close(); };

                    var formatScope = function(variableId, varscope, scopeValues) {
                        if (!varscope || !scopeValues)
                            return "";
                        if (formatted[variableId])
                            return formatted[variableId];
                        var values = [];
                        _.each(_.sortBy(_.pairs(varscope), function(pr) {
                            return pr[0]
                        }), function(pr) {
                            var refs = scopeValues[pr[0] + "s"];
                            _.each(pr[1], function(id) {
                                var item = _.findWhere(refs, {Id: id});
                                item && values.push({ type: pr[0], name: item.Name } )
                            })
                        });
                        return formatted[variableId] = values,
                        values
                    };
                    var projectId = $routeParams.id;

                    $scope.variableSetsLoading = {};
                    $scope.variables = [];
                    $scope.projectHasUnsavedChanges = unsavedChanges.hasUnsavedChanges();
                    $scope.variableSetsWaitingToLoad = 0;
                    isLoading.promise(octopusRepository.Projects.get(projectId).then(function(project) {
                        $scope.projectName = project.Name;
                        $scope.variableSetsWaitingToLoad += project.IncludedLibraryVariableSetIds.length;
                        isLoading.promise(octopusRepository.Variables.get(project.VariableSetId)).then(function(variableSet) {
                            _.each(variableSet.Variables, function(variable) {
                                variable.Source = 'Project';
                                variable.formattedScope = formatScope(variable.Id, variable.Scope, variableSet.ScopeValues);
                            });
                            $scope.variables = $scope.variables.concat(variableSet.Variables);
                        })

                        _.each(project.IncludedLibraryVariableSetIds, function(includedLibraryVariableSetId) {
                            var variableSetLoading = $scope.variableSetsLoading[includedLibraryVariableSetId] = busy.create();
                            variableSetLoading.promise(octopusRepository.LibraryVariableSets.get(includedLibraryVariableSetId)).then(function(libraryVariableSet) {
                                variableSetLoading.promise(octopusRepository.Variables.get(libraryVariableSet.VariableSetId)).then(function(variableSet) {
                                    _.each(variableSet.Variables, function(variable) {
                                        variable.Source = libraryVariableSet.Name;
                                        variable.SourceId = libraryVariableSet.Id;
                                        variable.formattedScope = formatScope(variable.Id, variable.Scope, variableSet.ScopeValues);
                                    });
                                    $scope.variables = $scope.variables.concat(variableSet.Variables);
                                    $scope.variableSetsWaitingToLoad--;
                                })
                            })
                        })
                    }));
                },
                dialogClass: "modal"
            });
        }
    }

    function hasClass(element, cls) {
        return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
    }

    function addViewResultantVariableListButton(sendMessageHandler, receiveMessageHandler) {
        if (document.getElementById('bluefin-viewresultantvariablelist-button'))
            return;

        var links = document.querySelectorAll('a');
        var includeVariableSetsLink = null;
        var chooseVariableSetsLink = null;
        for(var i=0; i < links.length; i++ ) {
            if (links[i].innerText === 'Include variable sets from the Library') {
                includeVariableSetsLink = links[i];
            }
            if (links[i].innerText === 'Choose different library variable sets') {
                chooseVariableSetsLink = links[i];
            }
        }
        if (includeVariableSetsLink == null) {
            console.log("Unable to find the 'Include variable sets from the Library' link - unable to setup the 'view resultant variable list' functionality");
            return;
        }
        if (chooseVariableSetsLink == null) {
            console.log("Unable to find the 'Choose different library variable sets' link - unable to setup the 'view resultant variable list' functionality");
            return;
        }

        var includeVariableSetsLinkContainer = includeVariableSetsLink.parentNode;
        //dont add the link until we've got one of these on the screen
        if (hasClass(includeVariableSetsLinkContainer, "ng-hide") && hasClass(chooseVariableSetsLink, "ng-hide"))
            return;

        console.log("Loading Blue fin feature 'show variable set variables'");

        console.debug("  - adding 'show' link");
        var showLinkContainer = document.createElement('div');
        showLinkContainer.className = 'pull-right'
        var showLink = document.createElement('a');
        showLink.innerText = 'Show resultant variable list';
        showLink.title = "Lists all available variables, combinining the project and variable sets variables";
        showLink.id = 'bluefin-viewresultantvariablelist-button';
        showLink.style.cursor = 'pointer';
        showLinkContainer.appendChild(showLink);

        //if the choose is hidden, then there are no variable sets yet
        if (hasClass(chooseVariableSetsLink, "ng-hide")) {
            showLinkContainer.className = 'ng-hide';
        }

        includeVariableSetsLinkContainer.parentNode.insertBefore(showLinkContainer, includeVariableSetsLinkContainer.nextSibling);

        console.debug("  - adding analytics handler");
        var span = document.createElement('span');
        span.id = 'bluefin-viewresultantvariablelist-analytics-handler';
        span.onclick = span.onClick = function () {
            chrome.runtime.sendMessage({ name: 'view-resultant-variable-list', properties: {} }); // Analytics
        }
        includeVariableSetsLinkContainer.appendChild(span);

        console.debug("  - getting template html 'view-resultant-variable-list.html'");
        sendMessageHandler = sendMessageHandler || chrome.runtime.sendMessage;
        receiveMessageHandler = receiveMessageHandler || receiveMessage;
        sendMessageHandler({ message: 'get-template', properties: { templateName: 'view-resultant-variable-list.html' }}, receiveMessageHandler);
    }

    //separate function for mocking
    function getPageLocationHash() {
        return location.hash;
    }

    function checkIfWeAreOnVariablesPage(handler, getPageLocationHashfn) {
        getPageLocationHashfn = getPageLocationHashfn || getPageLocationHash;
        hash = getPageLocationHashfn();
        if (hash.match(/#\/projects\/.*\/variables$/i)) {
            handler = handler || addViewResultantVariableListButton
            handler();
        }
    }

    function observe(content, octopusVersion) {
        if (commonpygmy.isNewerVersionThan(octopusVersion, "3.4.0")) {
            return;
        }
        var observer = new MutationObserver(function(targets, observer) { checkIfWeAreOnVariablesPage(); });
        observer.observe(content, { childList: true, subtree: true, attributes: false, characterData: false});

        chrome.runtime.onMessage.addListener(receiveMessage);
    }

    return {
        observe: observe,
        receiveMessage: receiveMessage,
        checkIfWeAreOnVariablesPage: checkIfWeAreOnVariablesPage,
        addViewResultantVariableListButton: addViewResultantVariableListButton
    };
})();