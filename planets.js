/*

App run structure:

1. Get search params for Game Summary List
2. Get the Game Summary List from the api
3. Filter that list for things we couldn't set params for
4. For each remaining game, get game details
5. Filter the detailed games
6. Sort the games
7. Show the games

*/

import * as Display from './display.js';

async function runSearch() {
	// Get game summary list
	const gameSummaryList = await getGameSummaryList();
	console.log(gameSummaryList);

	// Filter the game summary list
	const filteredGameSummaryList = filterGameSummaryList(gameSummaryList);
	console.log(filteredGameSummaryList);

	// Get the game details list
	//const gameDetailsList = getGameDetailsList(filteredGameSummaryList);

	// Filter the game details list
	//const filteredGameDetailsList = filterGameDetailsList(gameDetailsList);

	// Sort the game details list
	//const sortedFilteredGameDetailsList = sortGameDetailsList(filteredGameDetailsList)

	// Display the games to the user
	//Display.displayGameList(sortedFilteredGameDetailsList);
}

async function getGameSummaryList() {
	const searchParams = getGameSummarySearchParams();
	const url = "https://api.planets.nu/games/list?" + searchParams;

	Display.displaySearching();

	const response = await fetch(url)
		.then(response => response.json())
		.then(data => { return data });
	
	return response;
}

function filterGameSummaryList(gameSummaryList) {
	const filtered = gameSummaryList.filter(gameAttributeFilter);
	return filtered;
}

// 2021-04-06 - v0.3 - Pampelmops - Function to filter by game attributes
function gameAttributeFilter(game) {
	// Difficulty Modifier
	var item = document.getElementById("difficultyModifier");
	if (item.checked) {
		var from = document.getElementById("difficultyModifierFrom").value;
		var to = document.getElementById("difficultyModifierTo").value;
		if (game.difficulty < from  ||  game.difficulty > to) return false;
	}
	
	// 2021-04-12 - v0.4 - Pampelmops - Exclude beginner games
	item = document.getElementById("excludeBeginner");
	if (item.checked) {
		if (game.shortdescription.includes("Beginners") ) return false;
	}
	
	// 2021-04-12 - v0.4 - Pampelmops - Turns per week
	item = document.getElementById("turnsPerWeek");
	if (item.checked) {
		var from = document.getElementById("turnsPerWeekFrom").value;
		var to = document.getElementById("turnsPerWeekTo").value;
		if (game.turnsperweek > 0) { // Custom games apparently have turnsperweek=0
			if (game.turnsperweek < from  ||  game.turnsperweek > to) return false;
		}
		else {
			var count = (game.hostdays.match(/_/g) || []).length; // Count number of underscores
			// console.log("game.hostdays: " + game.hostdays + ", count: " + count);
			var turnCount = 7-count;
			if (turnCount < from  ||  turnCount > to) return false;
		}
	}
	
	return true;
}

function getGameSummarySearchParams() {
	// Game scope
	var scope = "scope=";
	var first = true;

	var item = document.getElementById("public");
	if (item.checked == true) { scope += "0"; first = false; }

	item = document.getElementById("private");
	if (item.checked == true) { if (!first) { status += "," } status += "1"; first = false; }

	if (first) {
		scope = "scope=0";
	}

	// Game status
	var status = "status=";
	first = true;

	item = document.getElementById("interest");
	if (item.checked == true) { status += "0"; first = false; }

	item = document.getElementById("joining");
	if (item.checked == true) { if (!first) { status += "," } status += "1"; first = false; }

	item = document.getElementById("running");
	if (item.checked == true) { if (!first) { status += "," } status += "2"; first = false; }

	item = document.getElementById("finished");
	if (item.checked == true) { if (!first) { status += "," } status += "3"; first = false; }

	item = document.getElementById("onhold");
	if (item.checked == true) { if (!first) { status += "," } status += "4"; first = false; }

	if (first) {
		status = "status=1,2";
	}

	// Game types
	var type = "type=";
	first = true;

	item = document.getElementById("training");
	if (item.checked == true) { type += "1"; first = false; }

	item = document.getElementById("classic");
	if (item.checked == true) { if (!first) { type += "," } type += "2"; first = false; }

	item = document.getElementById("team");
	if (item.checked == true) { if (!first) { type += "," } type += "3"; first = false; }

	item = document.getElementById("melee");
	if (item.checked == true) { if (!first) { type += "," } type += "4"; first = false; }

	item = document.getElementById("blitz");
	if (item.checked == true) { if (!first) { type += "," } type += "5"; first = false; }

	item = document.getElementById("champion");
	if (item.checked == true) { if (!first) { type += "," } type += "6"; first = false; }

	item = document.getElementById("academy");
	if (item.checked == true) { if (!first) { type += "," } type += "7"; first = false; }

	if (first) {
		type = "type=2,3,4";
	}

	return scope + "&" + status + "&" + type;
}
