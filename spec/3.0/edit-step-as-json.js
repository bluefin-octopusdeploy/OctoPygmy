describe("edit-step-as-json", function() {
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


  describe("receiveMessage", function() {
	var span;

    beforeEach(function () {
      span = document.createElement('span');
      span.id = 'bluefin-editstepasjson-showeditorhandler';
      var attrib = document.createAttribute("data-json");
      attrib.value = 'notset';
      span.setAttributeNode(attrib);
      attrib = document.createAttribute("data-deployment-process-id");
      attrib.value = 'notset';
      span.setAttributeNode(attrib);
      document.body.appendChild(span);
    });

    afterEach(function() {
      span = document.getElementById('bluefin-editstepasjson-showeditorhandler');
      if (span) {
        if (span.remove)
          span.remove();
        else
          span.parentNode.removeChild(span);
      }
    });

  	it("calls show-editor-handler if its a 'edit-step-as-json-response' message", function() {
      var called = false;
      span.onClick = function() { called = true; };

      var response = { 'message': 'edit-step-as-json-response',  'properties': { 'json': '{"foo": "bar"}', 'deploymentProcessId': 1234 } };

      pygmy3_0.editStepAsJson.receiveMessage(response);
      span = document.querySelector("#bluefin-editstepasjson-showeditorhandler")
      expect(called).toBe(true);
      expect(span.attributes['data-json'].value).toBe('{"foo": "bar"}');
      expect(span.attributes['data-deployment-process-id'].value).toBe('1234');
  	});

  	it("does not call show-editor-handler if its not a 'edit-step-as-json-response' message", function() {
      var called = false;
      span.onClick = function() { called = true; };

      var response = { 'message': 'clone-step-response',  'properties': { 'status': 'success' } };

      pygmy3_0.editStepAsJson.receiveMessage(response);
      span = document.querySelector("#bluefin-editstepasjson-showeditorhandler")
      expect(called).toBe(false);
      expect(span.attributes['data-json'].value).toBe('notset');
      expect(span.attributes['data-deployment-process-id'].value).toBe('notset');
  	});
  });

  describe("receiveEditedMessage", function() {
    var span;

    beforeEach(function () {
      span = document.createElement('span');
      span.id = 'bluefin-editstepasjson-refreshbutton';
      var attrib = document.createAttribute("status");
      attrib.value = 'notset';
      span.setAttributeNode(attrib);
      attrib = document.createAttribute("message");
      attrib.value = 'notset';
      span.setAttributeNode(attrib);
      document.body.appendChild(span);
    });

    afterEach(function() {
      span = document.getElementById('bluefin-editstepasjson-refreshbutton');
      if (span) {
        if (span.remove)
          span.remove();
        else
          span.parentNode.removeChild(span);
      }
    });

  	it("calls refresh-handler if its a successful 'edited-step-as-json-response' message, sets message to blank ", function() {
      var called = false;
      span.onClick = function() { called = true; };

      var response = { 'message': 'edited-step-as-json-response',  'properties': { 'status': 'success' } };

      pygmy3_0.editStepAsJson.receiveEditedMessage(response);
      span = document.querySelector("#bluefin-editstepasjson-refreshbutton")
      expect(called).toBe(true);
      expect(span.attributes['message'].value).toBe('');
      expect(span.attributes['status'].value).toBe('success');
  	});

  	it("calls refresh-handler if its a failure 'edited-step-as-json-response' message, sets message", function() {
      var called = false;
      span.onClick = function() { called = true; };

      var response = { 'message': 'edited-step-as-json-response',  'properties': { 'status': 'failure', 'errorMessage': 'the error message', 'errors': [ "error1", "error2" ] } };

      pygmy3_0.editStepAsJson.receiveEditedMessage(response);
      expect(called).toBe(true);
      span = document.querySelector("#bluefin-editstepasjson-refreshbutton")
      expect(span.attributes['message'].value).toBe('Failed to save the step. the error message error1 error2');
      expect(span.attributes['status'].value).toBe('failure');
  	});

  	it("does not call refresh-handler if its not a 'edited-step-as-json-response' message", function() {
      var called = false;
      span.onClick = function() { called = true; };

      var response = { 'message': 'clone-step-response',  'properties': { 'status': 'success' } };

      pygmy3_0.editStepAsJson.receiveEditedMessage(response);
      span = document.querySelector("#bluefin-editstepasjson-refreshbutton")
      expect(called).toBe(false);
      expect(span.attributes['message'].value).toBe('notset');
      expect(span.attributes['status'].value).toBe('notset');
  	});
  });


  describe("angularShowModalDialog", function() {
	//might be hard to test?
  });

  describe("editStepAsJson", function() {
  	it("extracts the appropriate attributes, and calls the send message handler", function() {
      var actualMessage;
      var sendMessage = function (message) {
        actualMessage = message;
      }
      var receiveMessage = function() { }

      var attributes = {};
      attributes['data-step-id'] = {'value': '123'};
      attributes['data-deployment-process-id'] = { 'value': '456' };
      attributes['data-is-child'] = { 'value': 'true' };
      var scope = { 'parentElement': { 'attributes' : attributes }};

      var result = pygmy3_0.editStepAsJson.editStepAsJson.apply(scope, [{}, sendMessage, receiveMessage]);
      expect(actualMessage.message).toBe('edit-step-as-json');
      expect(actualMessage.properties.stepId).toBe('123');
      expect(actualMessage.properties.deploymentProcessId).toBe('456');
      expect(result).toBe(false); //needs to be false to prevent browser navigate
  	});
  });

  describe("addEditStepAsJsonMenuItem", function() {
  	it("adds a separator and a new menu item to the drop down", function() {
		var ul = document.createElement('ul');
      ul.className = 'dropdown-menu'
      var attrib = document.createAttribute('role');
      attrib.value = 'menu';
      ul.setAttributeNode(attrib);
      var li = document.createElement('li');
      ul.appendChild(li);
      li.innerHTML = '<a tabindex="-1">Existing menu item</a>'
      document.body.appendChild(ul);
      
      pygmy3_0.editStepAsJson.addEditStepAsJsonMenuItem();
      
      ul = document.querySelector("ul.dropdown-menu[role='menu']");
      expect(ul.children.length).toEqual(3);
      expect(ul.children[1].className).toEqual('divider');
      expect(ul.children[2].innerHTML).toEqual('<a tabindex="-1" href="">Edit step as JSON</a>');

      if (ul.remove) 
        ul.remove();
      else
        ul.parentNode.removeChild(ul);
  	});
  });

  describe("addEditStepAsJsonMetaData", function() {
  	it("adds the metadata attributes to the template", function() {
      var script = document.createElement('script');
      script.id = 'processEditDropdown';
      script.type="text/html"
      script.text = '<ul class="dropdown-menu" role="menu">';
      document.body.appendChild(script);
      pygmy3_0.editStepAsJson.addEditStepAsJsonMetaData();
      script = document.getElementById('processEditDropdown');

      expect(script.text).toEqual('<ul class="dropdown-menu" role="menu" data-step-id="{{step.Id}}" data-deployment-process-id="{{project.DeploymentProcessId}}" data-action-id="{{action.Id}}" data-is-child="{{isChild}}">');
  	});
  });

  describe("addEditStepAsJsonRefreshHandler", function() {
    function removeElement(id) {
      span = document.getElementById(id);
      if (span) {
        if (span.remove)
          span.remove();
        else
          span.parentNode.removeChild(span);
      }
    }

    beforeEach(function() {
      removeElement('bluefin-editstepasjson-showeditorhandler');
      removeElement('bluefin-editstepasjson-edithandler');
      removeElement('bluefin-editstepasjson-refreshbutton');
      removeElement('bluefin-editstepasjson-refreshhandler');
      removeElement('bluefin-editstepasjson-submitbutton');
    });

  	it("adds an edit handler element", function() {
      var octopusVersion = "3.4.10";
      pygmy3_0.editStepAsJson.addEditStepAsJsonRefreshHandler(octopusVersion);
      var handler = document.querySelector('#bluefin-editstepasjson-showeditorhandler')
      expect(handler).not.toBe(null);
      expect(handler.attributes.getNamedItem('data-json')).not.toBe(null);
      expect(handler.attributes.getNamedItem('data-json').value).toEqual("");
      expect(handler.attributes.getNamedItem('data-deployment-process-id')).not.toBe(null);
      expect(handler.attributes.getNamedItem('data-deployment-process-id').value).toEqual("");
  	});

  	it("adds an edit handler script for 3.4.x", function() {
      var octopusVersion = "3.4.10";
      pygmy3_0.editStepAsJson.addEditStepAsJsonRefreshHandler(octopusVersion);
      var script = document.querySelector('#bluefin-editstepasjson-edithandler');
      expect(script).not.toBe(null);
      expect(script.type).toEqual("text/javascript");
      expect(script.text).toContain("bluefin-editstepasjson-showeditorhandler"); //hard to test actual content
      expect(script.text).toContain("$uibModal");
  	});

    it("adds an edit handler script for 3.3.x", function() {
      var octopusVersion = "3.3.18";
      pygmy3_0.editStepAsJson.addEditStepAsJsonRefreshHandler(octopusVersion);
      var script = document.querySelector('#bluefin-editstepasjson-edithandler');
      expect(script).not.toBe(null);
      expect(script.type).toEqual("text/javascript");
      expect(script.text).toContain("bluefin-editstepasjson-showeditorhandler"); //hard to test actual content
      expect(script.text).toContain("$modal");
    });

  	it("adds an refresh handler element", function() {
      var octopusVersion = "3.4.10";
      pygmy3_0.editStepAsJson.addEditStepAsJsonRefreshHandler(octopusVersion);
      var handler = document.querySelector('#bluefin-editstepasjson-refreshbutton')
      expect(handler).not.toBe(null);
      expect(handler.attributes.getNamedItem('status')).not.toBe(null);
      expect(handler.attributes.getNamedItem('status').value).toEqual("");
      expect(handler.attributes.getNamedItem('message')).not.toBe(null);
      expect(handler.attributes.getNamedItem('message').value).toEqual("");
  	});

  	it("adds an refresh handler script", function() {
      var octopusVersion = "3.4.10";
      pygmy3_0.editStepAsJson.addEditStepAsJsonRefreshHandler(octopusVersion);
      var script = document.querySelector('#bluefin-editstepasjson-refreshhandler');
      expect(script).not.toBe(null);
      expect(script.type).toEqual("text/javascript");
      expect(script.text).toContain("var rerfeshHandler = document.getElementById('bluefin-editstepasjson-refreshbutton'); rerfeshHandler.onClick = rerfeshHandler.onclick = function() { if (this.attributes['status'].value == 'success') { angular.element(\"#processEditDropdown\").injector().get(\"$route\").reload();} else { angular.element(\"#processEditDropdown\").injector().get(\"octoDialog\").messageBox('Edit Step as JSON Failed', this.attributes['message'].value, [{label: 'ok'}]);} }");
  	});

  	it("adds an submit handler element", function() {
      var octopusVersion = "3.4.10";
      pygmy3_0.editStepAsJson.addEditStepAsJsonRefreshHandler(octopusVersion);
      var handler = document.querySelector('#bluefin-editstepasjson-submitbutton')
      expect(handler).not.toBe(null);
      expect(handler.attributes.getNamedItem('data-json')).not.toBe(null);
      expect(handler.attributes.getNamedItem('data-json').value).toEqual("");
      expect(handler.attributes.getNamedItem('data-deployment-process-id')).not.toBe(null);
      expect(handler.attributes.getNamedItem('data-deployment-process-id').value).toEqual("");
  	});

    it("doesn't add the handlers twice", function() {
      var octopusVersion = "3.4.10";
      pygmy3_0.editStepAsJson.addEditStepAsJsonRefreshHandler(octopusVersion);
      pygmy3_0.editStepAsJson.addEditStepAsJsonRefreshHandler(octopusVersion);
      expect(document.querySelectorAll('#bluefin-editstepasjson-showeditorhandler').length).toEqual(1);
      expect(document.querySelectorAll('#bluefin-editstepasjson-edithandler').length).toEqual(1);
      expect(document.querySelectorAll('#bluefin-editstepasjson-refreshbutton').length).toEqual(1);
      expect(document.querySelectorAll('#bluefin-editstepasjson-refreshhandler').length).toEqual(1);
      expect(document.querySelectorAll('#bluefin-editstepasjson-submitbutton').length).toEqual(1);
    });
  });

  describe("addEditStepAsJsonMenuItems", function() {
  	it("adds the onclick handler to all parent drop downs", function() {
	var div = document.createElement('div');
      div.className = 'menu-button';
      var link = document.createElement("a");
      link.id = 'link1';
      var attrib = document.createAttribute("external-dropdown");
      attrib.value = "{id: 'processEditDropdown', scope: { step: step } }";
      link.setAttributeNode(attrib);
      div.appendChild(link);
      document.body.appendChild(div);

      pygmy3_0.editStepAsJson.addEditStepAsJsonMenuItems(document);

      link = document.getElementById('link1');
      expect(link.onclick.toString()).toContain('function () { if (oldClickHandler) oldClickHandler(); addEditStepAsJsonMenuItem(); }');
  	});
  });

})