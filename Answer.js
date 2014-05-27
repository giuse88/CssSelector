var $ = (function(){

//////////////////////////////////////////////////////////////////////
//																	//
//							HELPER METHODS							//
//																	//
//////////////////////////////////////////////////////////////////////

function HTMLCollectionToArray(collection) {
	var array = [];
	for ( var i = 0; i < collection.length; i++ )
		array.push(collection[i]);
	return array;
}

function onlyUnique(value, index, self) {
	return self.indexOf(value) === index;
 }


function matchClassNames(descriptionClassNames, elementClassNames) {

	for (var i = 0; i < descriptionClassNames.length; i++) {
		if (elementClassNames.indexOf(descriptionClassNames[i]) < 0)
			return false;
	}

	return true;
}

//////////////////////////////////////////////////////////////////////
//								PARSER 								//
// The parser takes in input a string representing a CSS selector	//
// and returns an array of tokens with the following structure :	//
// 		token = {													//
//			tagName 	: a name of a HTML tag,						//
//			id 			: id specified 								//
//			className	: CSS classes specified						//
//		}															//
// All previous element may be empty/ null.							//
//																	//
// For example : 													//
//  div.css_class#id is transformed to 								//
//	token = {														//
//		tagName : 'div',											//
//		id 		: 'id',												//
//		class 	: 'css_class'										//
//	}																//
//////////////////////////////////////////////////////////////////////


function parser(string) {

	var REG =  {
			'id'	: /#((?:[\w\u00c0-\uFFFF-]|\\.)+)/,
			'class'	: /\.((?:[\w\u00c0-\uFFFF-]|\\.)+)/,
			'tag'	: /^((?:[\w\u00c0-\uFFFF\*-]|\\.)+)/
	};

	/*
	 * Helper object to handle Css selector 
	 * 	type : identifies the selector type. It can be 'id', 'class' or 'tag'
	 * 	value : contain the value of the selector. For example, the 'id' name or the class name.
	 *  
	 *  id = 'this_is_an_id' is converted in { type : 'id', value: 'this_is_an_id'};
	 *  class = 'this_is_a_class' is converted in { type : 'class', value: 'this_is_a_class'};
	 * 
	 */
	
	function Selector(type, value) {
		this.type = type;
		this.value = value;
	}

	/*
	 * Search selectors of a given 'type' in a string 'str' 
	 */

	function findSelectors(type, str) {
		
		if (!str)
			return [];

		var selectors = [];

		while (str) {
			str = str.trim();
			var tag = REG[type].exec(str);
			if (!tag)
				break;
			var indexTag = tag.index;
			str = str.substring(indexTag + tag[0].length);
			selectors.push(new Selector(type,tag[1]));
		}

		return selectors;
	}

	/*
	 *  Helper function which builds a string with all classes found in
	 *  the array passed in input 
	 */
	
	function mergeClassNames(classComponents) {

		if ( !classComponents || classComponents.length < 1)
			return null;

		var mergedNames = "";
		for ( var i =0;  i < classComponents.length; i++)
				if ( classComponents[i].type === "class" )
					mergedNames += classComponents[i].value + " ";

		return mergedNames.trim();
	}

	function getFirstValueFromArray(idArray) {
		if (idArray && idArray.length > 0)
			return idArray[0].value;
		return null;
	}
	
	/************************************************
	*												* 
	*					Body parser					* 
	*												* 
	*************************************************/

	string = string.trim();
	var rawTokens = string.split(' ');	
	// filter out empty string
	rawTokens = rawTokens.filter(function (token) {
		return token.trim()
	});
	var tokens = [];

	for ( var i = 0; i< rawTokens.length; i++ ) {
		var tagArray = findSelectors("tag",rawTokens[i]);
		var idArray  = findSelectors("id",rawTokens[i]);
		var classArray = findSelectors("class", rawTokens[i]);
		var token = {
				"tagName": getFirstValueFromArray(tagArray),
				"id" : getFirstValueFromArray(idArray),
				"className" : mergeClassNames(classArray)
		}
		tokens.push(token)
	}

	return tokens;
}

//////////////////////////////////////////////////////////////////////
//							SEARCHER 								//
// The searcher consumes an array of tokens. It goes through the	//
// dom tree to search for those element that satisfy the properties	//
// specified in the token array.									//
//																	//
//////////////////////////////////////////////////////////////////////

function searcher(tokens) {

	/************************************************
	*												* 
	*				Filter functions				* 
	*												* 
	*************************************************/
	
	function filterByTagName(documents, targetTagName) {

		if (!documents || documents.length < 1 || !targetTagName)
			return documents;
	
		var filteredDocument = Array.prototype.filter.call(documents, function (testElement) {
			return testElement.nodeName === targetTagName.toUpperCase();
		});
	
		return filteredDocument;
	}

	function filterById(documents, id) {

		if (!documents || documents.length < 1 || !id)
			return documents;
		
		var filteredDocument = Array.prototype.filter.call(documents, function (testElement) {
				return testElement.id === id;
		});
		return filteredDocument;
	}

	function filterByClassName(documents, targetClassName) {

		if (!documents || documents.length < 1 || !targetClassName)
			return documents;
		var classNames = targetClassName.trim().split(' ');
		
		var filteredDocument = Array.prototype.filter.call(documents, function (element) {
				return matchClassNames(classNames, element.className.trim().split(' '));
		});

		return filteredDocument;
	}


	function getDOMElementsForASelector(selector, context) {

		var domElements = [];

		if (selector.id) {

			if ( context === document) {
				var element = document.getElementById(selector.id);
				domElements = element ?[element] : [];
			}else  {
				domElements = HTMLCollectionToArray(filterById(context.childNodes, selector.id)); 
			}

			domElements = filterByTagName(filterByClassName(domElements, selector.className), selector.tagName);

		} else if (selector.tagName) {

			domElements =  HTMLCollectionToArray(context.getElementsByTagName(selector.tagName));
			domElements = filterByClassName(domElements, selector.className);

		} else if (selector.className) {

			domElements = HTMLCollectionToArray(context.getElementsByClassName(selector.className));

		} else {
			console.log("Selector empty");
		}

		return domElements;
	}

	function getDomElements(selector, contexts) {
		var elements =[];
		for (var i =0;  i< contexts.length; i++) {
			var contextElement = getDOMElementsForASelector(selector, contexts[i]);
			elements = elements.concat(contextElement);
		}
		return elements;
	}

	/************************************************
	*												* 
	*				Searcher body					* 
	*												* 
	*************************************************/
	
	
	var elements= [document];

	for ( var i=0; i< tokens.length; i++) {
		elements = getDomElements(tokens[i], elements);
	}

	return elements.filter( onlyUnique );;

}


	var CssSelectorEngine =  function (selector) {
				return searcher(parser(selector));
		}
	
	return CssSelectorEngine;

})();