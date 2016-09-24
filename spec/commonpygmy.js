describe("commonpygmy", function() {
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

  	describe("addFilterInput", function() {
		it("adds the input to the node", function() {
			var input = { id: 'the-id' };
			var parent = { appendChild: function() {} };
			spyOn(parent,'appendChild');

			commonpygmy.addFilterInput(input, parent);
			expect(parent.appendChild).toHaveBeenCalled();
		});

		it("does not add the input to the node when it already exists", function() {
			var input = { id: 'the-id' };
			var parent = { appendChild: function() {} };
			spyOn(parent,'appendChild');
			spyOn(document,'getElementById').and.returnValue(input);

			commonpygmy.addFilterInput(input, parent);
			expect(parent.appendChild).not.toHaveBeenCalled();
		});
	});

	describe("showItems", function() {
		var allIds = '';
		var idsToShow = '';
		// When setting the style.display. Be sure to use valid values.
		// It runs against the XHTML parser.
		var nodeHtml = '<div id="z" octopygmy-id="za">&nbsp;</div>' +
						'<div id="x" octopygmy-id="zb">&nbsp;</div>' +
						'<div id="y" octopygmy-id="zc">&nbsp;</div>' +
						'<div id="w" octopygmy-id="zd">&nbsp;</div>' +
						'<div octopygmy-id="zd">&nbsp;</div>';
		var nodeSegment = '';

		beforeEach(function() {
			commonpygmy.theDocument = document.createElement('div');
			commonpygmy.theDocument.innerHTML = nodeHtml;
			nodeSegment = commonpygmy.theDocument;

			allIds = ['a','b','c','d'];
			idsToShow = ['b','d'];
		});

		it("shows the specified items", function() {
			commonpygmy.showItems(allIds, idsToShow, 'block', 'none');
			
			expect(nodeSegment.childNodes[1].style.display).toEqual('block');
			expect(nodeSegment.childNodes[3].style.display).toEqual('block');
			expect(nodeSegment.childNodes[4].style.display).toEqual('block');
		});

		it("hides the items not specified", function() {
			commonpygmy.showItems(allIds, idsToShow, 'block', 'none');

			expect(nodeSegment.childNodes[0].style.display).toEqual('none');
			expect(nodeSegment.childNodes[2].style.display).toEqual('none');
		});

		it("shows all items when given the allspark", function() {
			commonpygmy.showItems(allIds, '~all~', 'block', 'none');

			for (var index = 0; index < nodeSegment.childNodes.length; index++) {
				expect(nodeSegment.childNodes[index].style.display).toEqual('block');
			}
		});

		it("shows all items when given blank idsToShow", function() {
			// This is for the text filtering inputs.
			commonpygmy.showItems(allIds, '', 'block', 'none');

			for (var index = 0; index < nodeSegment.childNodes.length; index++) {
				expect(nodeSegment.childNodes[index].style.display).toEqual('block');
			}
		});
	});

	describe("isNewerVersionThan", function() {
		it("should return false when versions are the same", function() {
			expect(commonpygmy.isNewerVersionThan("3.4.0", "3.4.0")).toBe(false);
		});

		it("should return false when major is lower", function() {
			expect(commonpygmy.isNewerVersionThan("2.4.0", "3.4.0")).toBe(false);
		});

		it("should return false when minor is lower", function() {
			expect(commonpygmy.isNewerVersionThan("3.3.0", "3.4.0")).toBe(false);
		});

		it("should return false when revision is lower", function() {
			expect(commonpygmy.isNewerVersionThan("3.4.9", "3.4.10")).toBe(false);
		});

		it("should return true when major is higher", function() {
			expect(commonpygmy.isNewerVersionThan("4.0.0", "3.4.0")).toBe(true);
		});

		it("should return true when minor is higher", function() {
			expect(commonpygmy.isNewerVersionThan("3.4.0", "3.3.0")).toBe(true);
		});

		it("should return true when revision is higher", function() {
			expect(commonpygmy.isNewerVersionThan("3.4.9", "3.4.0")).toBe(true);
		});
	});
});