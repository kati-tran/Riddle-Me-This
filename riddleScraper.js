const axios = require('axios');

const cheerio = require('cheerio');

const url = 'https://riddles.fyi/random-riddles/';
//let siteName = "";

let riddles = []
let answer = []

const fetchData = async() => {
	const result = await axios.get(url);
	return cheerio.load(result.data);
}

const getResults = async(rounds) => {
	const $ = await fetchData();

	r = $('.query-title-link').text()
	a = $('.su-spoiler-content').text()
	if (a.split(" ").length > 3){
		return getResults();
	}
	else{
		riddles.push(r)
		answer.push(a)
	}
	return {
		riddles,
		answer,
	};
};

module.exports = getResults;

//riddleParse(url)
// var x = riddleParse(url);
// console.log(x)

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