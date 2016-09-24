var pygmy3_0 = (function() {
	var contentElementId = "main-wrapper";	

	function worksWithPage() {
		console.debug("Checking for version 3.0 of Octopus Deploy");
		console.debug("   path: " + commonpygmy.location().pathname);
		console.debug("   title:" + commonpygmy.document().title);

		if (commonpygmy.location().pathname.indexOf('/app') < 0) return false;
		if (commonpygmy.document().title.indexOf("Octopus Deploy") < 0) return false;
		if (!commonpygmy.document().getElementById(contentElementId)) return false;

		return true;
	}

	function setup(options) {
		var self = this;
        chrome.runtime.sendMessage({ message: 'get-octopus-version'}, function(response) {
        	if (response && response.message == 'get-octopus-version-response') {
				console.info("Setting up OctoPygmy for Octopus Deploy 3.0 (" + response.version + ")");

				var content = document.getElementById(contentElementId);

				console.debug("Initializing features based upon options");
				if(options.dashboard) self.dashboardCollapser.observe(content);
				if(options.environments) self.environmentCollapser.observe(content);
				if(options.machines) self.environmentFilter.observe(content);
				if(options.libraryTemplate) self.integrateStepTemplateLibrary.observe(content);
				if(options.updateAllTemplate) self.stepTemplateUpdater.observe(content);
				if(options.cloneStep) self.cloneStep.observe(content);
				if(options.editStepAsJson) self.editStepAsJson.observe(content, response.version);
				if(options.viewReleaseDeploymentProcess) self.viewReleaseDeploymentProcess.observe(content, response.version);
				if(options.viewResultantVariableList) self.viewResultantVariableList.observe(content, response.version);
        	}
        });

	}

	return {
		worksWithPage: worksWithPage,
		setup: setup
	};

})();