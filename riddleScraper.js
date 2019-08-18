const rp = require('request-promise');

const $ = require('cheerio');

const url = 'https://riddles.fyi/random-riddles/';


function riddleParse (url){
rp(url)
  .then(function(html) {
  	{
    	var riddle = $('.query-title-link', html).text();
		var answer = $('.su-spoiler-content', html).text();
		if (answer.split(" ").length > 3){
			return riddleParse(url);
		}
		else{
			//console.log(riddle)
			//console.log(answer)
			riddle_dict = {"Riddle": riddle, "Answer": answer};
			//console.log(Object.values(riddle_dict))
			//console.log(riddle_dict)
			return riddle_dict;
			
		}
	};
  })

  .catch(function(err) {
    //handle error
  });
}

//riddleParse(url)
//var x = riddleParse(url);
//console.log(x)

function allRiddles(rounds){
	ridict = {}
	riddle = riddleParse(url)
	if (Object.keys(ridict).length === 0){
		ridict[riddle["Riddle"]] = riddle["Answer"]
		console.log(riddle)
	} 
	if (Object.keys(ridict).length === rounds){
		return ridict
	}
	return ridict;
}

//allRiddles(3)