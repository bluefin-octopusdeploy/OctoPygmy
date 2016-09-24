describe("view-release-deployment-process", function() {
  var originalConsoleDebug;
  var originalConsoleLog;

  beforeEach(function () {
    originalConsoleDebug = console.debug;
    originalConsoleLog = console.log;
    console.debug = function() {};
    console.log = function() {};
  });

  afterEach(function() {
    console.debug = originalConsoleDebug;
    console.log = originalConsoleLog
  });


  function removeElement(id) {
    var element = document.getElementById(id);
    if (element) {
      if (element.remove)
        element.remove();
      else
        element.parentNode.removeChild(element);
    }
  }

  describe("receiveMessage", function() {
    var showLink;
    beforeEach(function () {
      showLink = document.createElement('a');
      showLink.id = 'bluefin-showreleasedeploymentprocess-button';
      document.body.appendChild(showLink);
    });

    afterEach(function() {
      removeElement('bluefin-showreleasedeploymentprocess-handler');
      removeElement('bluefin-showreleasedeploymentprocess-button');
    });

    it("should do nothing if its not a 'get-template' message", function() {
      var message = { 'message': 'a-different-message' };
      pygmy3_0.viewReleaseDeploymentProcess.receiveMessage(message);

      var script = document.getElementById('bluefin-showreleasedeploymentprocess-handler');
      expect(script).toBe(null);
    });

    it("should do nothing if its not the 'show-release-deployment-plan.html' template", function() {
      var message = { 'message': 'get-template-response', 'properties': { 'templateName' : 'a-different-template.html', 'template': '<div>hello</div>' }};
      pygmy3_0.viewReleaseDeploymentProcess.receiveMessage(message);

      var script = document.getElementById('bluefin-showreleasedeploymentprocess-handler');
      expect(script).toBe(null);
    });

    it("should add a new script element for 3.4.x", function() {
      var template = '<div>hello</div>';
      var message = { 'message': 'get-template-response', 'properties': { 'templateName' : 'show-release-deployment-plan.html', 'template': template }};
      pygmy3_0.viewReleaseDeploymentProcess.setOctopusVersion("3.4.10");
      pygmy3_0.viewReleaseDeploymentProcess.receiveMessage(message);

      var script = document.getElementById('bluefin-showreleasedeploymentprocess-handler');
      expect(script).not.toBe(null);
      expect(script.type).toBe('text/javascript');
      expect(script.text).not.toContain("template: '#{template}'");
      expect(script.text).toContain("template: '" + template + "',");
      expect(script.text).toContain("$uibModal");
    });

    it("should add a new script element for 3.3.x", function() {
      var template = '<div>hello</div>';
      var message = { 'message': 'get-template-response', 'properties': { 'templateName' : 'show-release-deployment-plan.html', 'template': template }};
      pygmy3_0.viewReleaseDeploymentProcess.setOctopusVersion("3.3.9");
      pygmy3_0.viewReleaseDeploymentProcess.receiveMessage(message);

      var script = document.getElementById('bluefin-showreleasedeploymentprocess-handler');
      expect(script).not.toBe(null);
      expect(script.type).toBe('text/javascript');
      expect(script.text).not.toContain("template: '#{template}'");
      expect(script.text).toContain("template: '" + template + "',");
      expect(script.text).toContain("$modal");
    });
  });

  describe("checkIfWeAreOnReleasePage", function() {
    it("should add the link if we are on the releases page", function() {
      var called = false;
      var handler = function() { called = true; };
      var locationFn = function() { return "#/projects/my-fancy-project/releases/0.1.21" };

      
      pygmy3_0.viewReleaseDeploymentProcess.checkIfWeAreOnReleasePage(handler, locationFn);

      expect(called).toBe(true);
    });

    it("should not add the link if we are on the deployments page", function() {
      var called = false;
      var handler = function() { called = true; }
      var locationFn = function() { return "#/projects/Projects-411/releases/0.1.21/deployments/Deployments-5694" };
      
      pygmy3_0.viewReleaseDeploymentProcess.checkIfWeAreOnReleasePage(handler, locationFn);

      expect(called).toBe(false);
    });

    it("should not add the link if we are on the create release page", function() {
      var called = false;
      var handler = function() { called = true; }
      var locationFn = function() { return "#/projects/Projects-411/releases/create" };
      
      pygmy3_0.viewReleaseDeploymentProcess.checkIfWeAreOnReleasePage(handler, locationFn);

      expect(called).toBe(false);
    });
  });

  describe("addDeploymentProcessLink", function() {
    var variablesHeading;
    beforeEach(function () {
      var s = '<h3 class="margin-top-20">Variables</h3>\n\n        <p class="subtle"></p>\n\n        <!-- ngIf: viewShowVariables -->';
      var div = document.createElement('div');
      div.innerHTML = s;
      div.id = 'div-for-testing-view-release-deployment-process';
      document.body.appendChild(div);
    });


    afterEach(function() {
      removeElement('variablesHeading');
      removeElement('div-for-testing-view-release-deployment-process');
    });


    it("should add a heading", function() {
      var called = false;
      var sendMessageHandler = function(message, handler) { 
        called = true; 
        expect(handler).toBe(receiveMessageHandler);  
      };
      var receiveMessageHandler = function() {};

      pygmy3_0.viewReleaseDeploymentProcess.addDeploymentProcessLink(sendMessageHandler, receiveMessageHandler);

      expect(document.getElementById('bluefin-showreleasedeploymentprocess-heading')).not.toBe(null);
      expect(document.getElementById('bluefin-showreleasedeploymentprocess-heading').innerText).toBe("Deployment Process");
      expect(document.getElementById('bluefin-showreleasedeploymentprocess-description')).not.toBe(null);
      expect(document.getElementById('bluefin-showreleasedeploymentprocess-description').innerText).toBe("When this release was created, a snapshot of the project deployment process was taken. Show »");
      expect(document.getElementById('bluefin-showreleasedeploymentprocess-button')).not.toBe(null);
      expect(document.getElementById('bluefin-showreleasedeploymentprocess-button').innerText).toBe("Show »");
    });

    it("should not add more than once", function() {
      var called = false;
      var sendMessageHandler = function(message, handler) { 
        called = true; 
        expect(handler).toBe(receiveMessageHandler);  
      };
      var receiveMessageHandler = function() {};

      pygmy3_0.viewReleaseDeploymentProcess.addDeploymentProcessLink(sendMessageHandler, receiveMessageHandler);
      expect(document.querySelectorAll('h3').length).toBe(2); //"Variables" + "Deployment Process";
      pygmy3_0.viewReleaseDeploymentProcess.addDeploymentProcessLink(sendMessageHandler, receiveMessageHandler);
      expect(document.querySelectorAll('h3').length).toBe(2);
    });

    it("should add the analytics handler", function() {
      var called = false;
      var sendMessageHandler = function(message, handler) {
        called = true;
        expect(handler).toBe(receiveMessageHandler);
      };
      var receiveMessageHandler = function() {};

      pygmy3_0.viewReleaseDeploymentProcess.addDeploymentProcessLink(sendMessageHandler, receiveMessageHandler);

      expect(document.getElementById('bluefin-showreleasedeploymentprocess-analytics-handler')).not.toBe(null);
      expect(typeof document.getElementById('bluefin-showreleasedeploymentprocess-analytics-handler').onclick).toBe('function');
    });
  });

  describe("angularShowModalDialog", function() {
    //unfortunately, I dont there there is a way of testing this, given the dependency on AngularJS & the Octopus AngularJS app
  });
});
