var commonpygmy = {
	allItemsValue: '~all~',
	pygmyIdAttributeName: 'octopygmy-id',
	theDocument: window.document,
	location: function() { return window.location; },
	document: function() { return window.document; },

	groupingId: function(groupName) {
		return "octopygmy-" + groupName.toLowerCase().replace(/[^a-z0-9]/g,'') + "-grouping";
	},

	addFilterInput: function(inputNode, parentNode)
	{
		console.debug("Adding filter input");

		var existingInput = document.getElementById(inputNode.id);

		if (existingInput)
		{
			console.debug("Filter input (" + inputNode.id + ") already exists, skipping...");
			return;
		}

		parentNode.appendChild(inputNode);
	},

	showItems: function(allIds, idsToShow, showStyle, hideStyle)
	{
		var showAll = idsToShow == commonpygmy.allItemsValue || idsToShow == ''

		for(var i = 0; i < allIds.length; i++)
		{
			var id = allIds[i];
			var items = commonpygmy.theDocument.querySelectorAll('[' + commonpygmy.pygmyIdAttributeName + '=z' + id + ']');
			for(var index = 0; index < items.length; index++) {
				var item = items[index];
				if (showAll || idsToShow.indexOf(id) >= 0)
				{
					item.style.display = showStyle;
				} 
				else 
				{
					item.style.display = hideStyle;
				}
			}
		}
	},

	setNodePygmyId: function(node, pygmyId)
	{
		node.setAttribute(commonpygmy.pygmyIdAttributeName, "z" + pygmyId);
	},

	//returns true if a is newer than b
	isNewerVersionThan: function(a, b)
	{
		var a_components = a.split(".");
    	var b_components = b.split(".");

    	var majorA = parseInt(a_components[0]);
    	var majorB = parseInt(b_components[0]);

    	if (majorA > majorB)
    		return true;
    	if (majorA < majorB)
    		return false;

    	var minorA = parseInt(a_components[1]);
    	var minorB = parseInt(b_components[1]);

    	if (minorA > minorB)
    		return true;
    	if (minorA < minorB)
    		return false;

    	var revisionA = parseInt(a_components[2]);
    	var revisionB = parseInt(b_components[2]);

    	if (revisionA > revisionB)
    		return true;
    	if (revisionA < revisionB)
    		return false;

    	return false;
	}
}