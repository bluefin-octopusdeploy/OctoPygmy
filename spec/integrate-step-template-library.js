describe('integrate-step-template-library', function() {
	var libraryNode = {};
    var originalConsoleDebug;
    var originalConsoleLog;

	beforeEach(function() {
	    originalConsoleDebug = console.debug;
	    originalConsoleLog = console.log;
	    console.debug = function() {};
	    console.log = function() {};
		integrateStepTemplateLibrary.theDocument = document.createElement('div');
		integrateStepTemplateLibrary.theDocument.innerHTML = '<div id="library-templates"></div>';
		libraryNode = integrateStepTemplateLibrary.theDocument.childNodes[0];
	})

    afterEach(function() {
        console.debug = originalConsoleDebug;
        console.log = originalConsoleLog
    });

	describe('addTemplatesToListing', function() {
		var items = [
			{'Name':'Test1', 'Description': 'Some description', DownloadUrl: 'test1-url'},
			{'Name':'Test2', 'Description': 'Some other description', DownloadUrl: 'test2-url'},
			{'Name':'Common', 'Description': 'This one is pre-existing'}
		];
		var result = []
		var fakeLibrary = {}

		beforeEach(function() {
			fakeLibrary = {
				add: function(item) { result.push(item) },
				sort: function() {},
				items: [ 
					{ 
						elm: integrateStepTemplateLibrary.generateNodeFromHtml(integrateStepTemplateLibrary.templateHtml),
						values: function() { return {'template-name': 'Test2'} }
					},
					{ 
						elm: integrateStepTemplateLibrary.generateNodeFromHtml(integrateStepTemplateLibrary.templateHtml),
						values: function() { return {'template-name': 'Test1'} }
					}
				]
			}
			integrateStepTemplateLibrary.libraryList = fakeLibrary
			//integrateStepTemplateLibrary.libraryList.sort = function() {}
			integrateStepTemplateLibrary.existingTemplateNames = ['Common']

			integrateStepTemplateLibrary.addTemplateToListing(items[0]);
			integrateStepTemplateLibrary.addTemplateToListing(items[1]);
			integrateStepTemplateLibrary.addTemplateToListing(items[2]);
		})

		it('adds each template to the library node', function() {
			expect(result.length).toEqual(2)
		})

		it('puts the template name in the node', function() {
			expect(result[0]['template-name']).toEqual('Test1')
			expect(result[1]['template-name']).toEqual('Test2')
		})

		it('puts the description in the node', function() {
			expect(result[0]['description']).toEqual('Some description')
			expect(result[1]['description']).toEqual('Some other description')
		})

		it('sets the onlcick function', function() {
			expect(fakeLibrary.items[0].elm.getElementsByClassName('template-import')[0].onclick).toBeDefined();
			expect(fakeLibrary.items[0].elm.getElementsByClassName('template-import')[0].onclick).not.toBeNull();

			expect(fakeLibrary.items[1].elm.getElementsByClassName('template-import')[0].onclick).toBeDefined();
			expect(fakeLibrary.items[1].elm.getElementsByClassName('template-import')[0].onclick).not.toBeNull();
		})

		it('sets a function that sends a message', function() {
			spyOn(chrome.runtime, 'sendMessage')
			fakeLibrary.items[0].elm.getElementsByClassName('template-import')[0].onclick()
			fakeLibrary.items[1].elm.getElementsByClassName('template-import')[0].onclick()

			expect(chrome.runtime.sendMessage).toHaveBeenCalled()
			expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({ templateName: 'test1-url' })
			expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({ templateName: 'test2-url' })
		})
	})
})
