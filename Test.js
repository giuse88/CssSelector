var test$ = function() {
window.answerList = {
  A: $("div"),
  B: $("img.some_class"),
  C: $("#some_id"),
  D: $(".some_class"),
  E: $("input#some_id"),
  F: $("div#some_id.some_class"),
  G: $("div.some_class#some_id"),
  H: $("#some_id.wrong_class"),
  I: $('div #internal'),
  J: $('div #class_A_level_1'), 
  K: $('#l1 #l2'),			
  L: $('.class_A_level_1   .class_A_level_2'),
  M: $('.class_A_level_1 #l2.class_A_level_2 div.internal_1.internal_2'),
  N: $('div.class_B'),
  O: $('div.class_B.class_A_level_1'),
  P : $('div #l1 #l2'),
  Q : $(' div    #l2 ')
}

var expectedResult = {
  A: {
    DIV: 5
  },
  B: {
    IMG: 1
  },
  C: {
    DIV: 1
  },
  D: {
    DIV: 1,
    IMG: 1
  },
  E: {
  },
  F: {
    DIV: 1
  },
  G: {
    DIV: 1
  },
  H:{},
  I:{
	  DIV:1
  },
  J:{},
  K:{ DIV:1 },
  L:{ DIV:1 },
  M:{ DIV:1 },
  N:{ DIV:2 },
  O:{ DIV:1 }, 
  P:{ }, 
  Q:{ DIV:1 }, 
  questions: 17
}


var computeString = function(result) {
  var returnArray = [];

  var divs = result["DIV"] || 0;
  var imgs =  result["IMG"] || 0;

  if (divs === 1) returnArray.push(divs + " DIV");
  else returnArray.push(divs + " DIVs");

  if (imgs === 1) returnArray.push(imgs + " IMGs");
  else returnArray.push(imgs + " IMGs");

  return returnArray.join(", ");
}

var testsPassed = 0;

for (answerName in answerList){
  var answer = answerList[answerName], i = 0, ii = answer.length, tagList = {};

  for (; i < ii; i++) {
    var answerTag = answer[i].tagName;
    if (tagList[answerTag]) tagList[answerTag]++;
    else tagList[answerTag] = 1;
  }

  var expected = computeString(expectedResult[answerName]);
  var found = computeString(tagList);
  var result = (expected === found) ? "Yes" : "No";
  if (result === "Yes") testsPassed++;

  console.log("\n------------------------\n\nAnswer", answerName);
  console.log("Expected:", expected);
  console.log("Found:", found);
  console.log("Correct:", result);

}

console.log("\n------------------------\n\nTests Passed:", testsPassed, "of", expectedResult.questions ); 
}