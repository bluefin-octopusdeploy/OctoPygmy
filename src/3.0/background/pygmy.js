var pygmy3_0 = (function() {
	
	function setup()
	{
		console.log("Setting up BlueFin background for Octopus Deploy 3.0");
		pygmy3_0.stepTemplateUpdate.setup();
		pygmy3_0.cloneStepHandler.setup();
		pygmy3_0.editStepAsJsonHandler.setup();
		pygmy3_0.templateLoader.setup();
		pygmy3_0.octopusVersionHandler.setup();
	}
	
	return {
		setup: setup	
	};
	
})();