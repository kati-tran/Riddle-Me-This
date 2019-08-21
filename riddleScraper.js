const axios = require('axios');

const cheerio = require('cheerio');

const url = 'https://riddles.fyi/random-riddles/';
//let siteName = "";

let riddles = ""
let answer = ""

const fetchData = async() => {
	const result = await axios.get(url);
	return cheerio.load(result.data);
}

const getResults = async() => {
	const $ = await fetchData();

	riddles = $('.query-title-link').text()
	answer = $('.su-spoiler-content').text()
	console.log(riddles)
	console.log(answer)
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