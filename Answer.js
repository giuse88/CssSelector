var $ = function (selector) {
  var tokens = parser(selector);
  return searcher(tokens);
}

function parser(string) {

  var REG =  {
    'id'    : /#((?:[\w\u00c0-\uFFFF-]|\\.)+)/,
    'class' : /\.((?:[\w\u00c0-\uFFFF-]|\\.)+)/,
    'tag'   : /^((?:[\w\u00c0-\uFFFF\*-]|\\.)+)/
  };

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
      var str = str.substring(indexTag + tag[0].length);
      selectors.push(new Selector(type,tag[1]));
    }

    return selectors;
  }

  function mergeClassNames(classComponents) {

    if ( !classComponents || classComponents.length < 1)
      return null;
//
    var mergedNames = "";
    for ( var i =0;  i < classComponents.length; i++)
      if ( classComponents[i].type === "class" )
        mergedNames += classComponents[i].value + " ";
//
    return mergedNames.trim();
  }

  function getFirstValueFromArray(idArray) {
    if (idArray && idArray.length > 0)
      return idArray[0].value;
    return null;
  }

  function Selector(type, value) {
    this.type = type;
    this.value = value;
  }

//  console.log("Selector Parser ");
  var nextIndex = 0;
  string = string.trim();
  var tokens = string.split(' ');
  // filter out empty string
  tokens = tokens.filter(function (token) {return token.trim()});
  var selectors = [];

  for ( var i = 0; i< tokens.length; i++ ) {
// retrieves the compoent of a selector
    var tagArray = findSelectors("tag",tokens[i]);
    var idArray  = findSelectors("id",tokens[i]);
    var classArray = findSelectors("class", tokens[i]);
// create the selector
    var selector = {
      "tagName": getFirstValueFromArray(tagArray),
      "id" : getFirstValueFromArray(idArray),
      "className" : mergeClassNames(classArray)
    }
//save the selector for this element
    selectors.push(selector)
  }

  return selectors;
}

  function HTMLCollectionToArray(collection) {
    var array = [];
    for ( var i = 0; i < collection.length; i++ )
        array.push(collection[i]);
    return array;
  }

function searcher(tokens) {

  function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }


  function matchClassNames(descriptionClassNames, elementClassNames) {
    console.log("match");
    // class specified in the css description
    for (var i = 0; i < descriptionClassNames.length; i++) {
      if (elementClassNames.indexOf(descriptionClassNames[i]) < 0)
        return false;
    }
    return true;
  }

  function filterByTagName(documents, targetTagName) {

    if (!documents || documents.length < 1 || !targetTagName)
      return documents;
    //
    var filteredDocument = Array.prototype.filter.call(documents, function (testElement) {
      console.log(testElement);
      return testElement.nodeName === targetTagName.toUpperCase();
    });
    //
    return filteredDocument;
  }

  function filterById(documents, id) {

    if (!documents || documents.length < 1 || !id)
      return documents;
    //
    var filteredDocument = Array.prototype.filter.call(documents, function (testElement) {
      console.log(testElement);
      return testElement.id === id;
    });
    //
    return filteredDocument;
  }

  function filterByClassName(documents, targetClassName) {

    if (!documents || documents.length < 1 || !targetClassName)
      return documents;
    var classNames = targetClassName.trim().split(' ');
    //
    var filteredDocument = Array.prototype.filter.call(documents, function (element) {
      return matchClassNames(classNames, element.className.trim().split(' '));
    });
    //
    return filteredDocument;
  }


function getDOMElementsForASelector(selector, context) {

    var domElements = [];
    if (selector.id) {
      console.log("I am in id seciton");
     if ( context === document) {
    	 var element = document.getElementById(selector.id);
    	 domElements = element ?[element] : [];
      }else  {
    	  domElements = HTMLCollectionToArray(filterById(context.childNodes, selector.id)); 
      }
      domElements = filterByTagName(filterByClassName(domElements, selector.className), selector.tagName);
    } else if (selector.tagName) {
      console.log("I am in tag seciton");
      domElements =  HTMLCollectionToArray(context.getElementsByTagName(selector.tagName));
      domElements = filterByClassName(domElements, selector.className);
    } else if (selector.className) {
      console.log("I am in class seciton");
      domElements = HTMLCollectionToArray(context.getElementsByClassName(selector.className));
    } else {
      console.log("Selector empty weird");
    }
    return domElements;
  }

  function getDomElements(selector, contexts) {
    console.log(contexts);
    var elements =[];
    for (var i =0;  i< contexts.length; i++) {
     // console.log(getDOMElementsForASelector(selector, document));
      var contextElement = getDOMElementsForASelector(selector, contexts[i]);
      elements = elements.concat(contextElement);
    }
    return elements;
  }

  var elements= [document];

  for ( var i=0; i< tokens.length; i++) {
    console.log( "Token : " , tokens[i]);
    console.log( "Elements : " ,  elements);
    elements = getDomElements(tokens[i], elements);
  }

  return elements.filter( onlyUnique );;

}
