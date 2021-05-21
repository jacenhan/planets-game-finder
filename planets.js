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

const planetsUrl = "https://api.planets.nu/";

async function runSearch() {
	// Get game summary list
	document.documentElement.style.cursor = "progress";
	const gameSummaryList = await getGameSummaryList();

	// Filter the game summary list
	const filteredGameSummaryList = filterGameSummaryList(gameSummaryList);

	// Get the game details list
	const gameDetailsList = await getGameDetailsList(filteredGameSummaryList);

	// Filter the game details list
	const filteredGameDetailsList = filterGameDetailsList(gameDetailsList);

	// Sort the game details list
	const sortedFilteredGameDetailsList = sortGameDetailsList(filteredGameDetailsList)

	// Display the games to the user
	document.documentElement.style.cursor = "default";
	displayGameList(sortedFilteredGameDetailsList);
}

async function getGameSummaryList() {
	const searchParams = getGameSummarySearchParams();
	const url = planetsUrl + "games/list?limit=500&" + searchParams;

	displaySearching();

	const response = await fetch(url)
		.then(response => response.json())
		.then(data => { return data });
	
	return response;
}

function filterGameSummaryList(gameSummaryList) {
	const filtered = gameSummaryList.filter(gameAttributeFilter);
	return filtered;
}

async function getGameDetailsList(filteredGameSummaryList) {
	const promises = [];

	for (var i = 0; i < filteredGameSummaryList.length; i++) {
		promises.push(getGameDetails(filteredGameSummaryList[i].id));
	}

	const result = await Promise.all(promises)
		.then(response => {
			return response;
		});
	
	return result;
}

function filterGameDetailsList(gameDetailsList) {
	return gameDetailsList;
}

// 2021-04-18 - v0.5 - Pampelmops - Set timestamp of last quit event (resigned or dropped) for sorting
function sortGameDetailsList(filteredGameDetailsList) {
	var func;
	
	var sortDesc = document.getElementById("sortingDesc").checked;
	
	var sortByDateElement = document.getElementById("sortingDateCreated");
	//var sortByQuitElement = document.getElementById("sortingLastQuitEvent");
	var sortByDifficultyElement = document.getElementById("sortingDifficulty");

	// Sort by date created
	if (sortByDateElement.checked == true) {
		if (sortDesc) func = function(a, b) {return Date.parse(b.game.datecreated) - Date.parse(a.game.datecreated);};
		else func = function(a, b) {return Date.parse(a.game.datecreated) - Date.parse(b.game.datecreated);};
	}
	// Sort by difficulty
	else if (sortByDifficultyElement.checked == true) {
		if (sortDesc) func = function(a,b) {return b.game.difficulty - a.game.difficulty;}
		else func = function(a,b) {return a.game.difficulty - b.game.difficulty;}
	}

	/* This doesn't seem to be working - JacenHan
	// Sort by last quit event date
	else if (sortByQuitElement.checked == true) {
		var parseLastQuitEventDate = function (e) {
			if (e) return Date.parse(e.dateadded);
			return Date(0);
		};
		
		if (sortDesc) func = function(a, b) {return parseLastQuitEventDate(b.lastQuitEvent) - parseLastQuitEventDate(a.lastQuitEvent);};
		else func = function(a, b) {return parseLastQuitEventDate(a.lastQuitEvent) - parseLastQuitEventDate(b.lastQuitEvent);};
	}
	*/
	return filteredGameDetailsList.sort(func);
}

function getGameDetails(gameId) {
	const url = planetsUrl + "game/loadinfo?gameid=" + gameId;

	return fetch(url)
		.then(response => response.json())
		.then(data => {
			return data;
		});
}

// 2021-04-06 - v0.3 - Pampelmops - Function to filter by game attributes
// Comparison function to filter the game summary list (before getting game details)
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

	// Open slots filter
	item = document.getElementById("needReplacement");
	if (item.checked) {
		if ((game.turnstatus.match(/o/g) || []).length == 0) {
			return false;
		}
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
	// Game status
	var status = "status=";
	var first = true;

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

	return status + "&" + type;
}

/*
	Display functions for the app
*/

function clearList() {
	var gameList = document.getElementById("games");
	removeAllChildNodes(gameList);
}

function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

function displaySearching() {
	clearList();
	var numText = document.getElementById("numGames");
	numText.textContent = "Searching...";
}

function gameDetailToHtml(gameDetail) {
	var game = gameDetail.game;

	// Make game container
	var container = document.createElement("div");
	container.className = "gameContainer";

	// Make box 1 (leftmost)
	var box1 = document.createElement("div");
	container.appendChild(box1);
	box1.className = "box1 gameItemBox";

	// Sector Name
	var name = document.createElement("h3");
	name.className = "gameItemName";
	
	var link = document.createElement("a");
	link.textContent = game.name;
	link.href = "https://planets.nu/#/sector/" + game.id;
	link.target = "_blank";
	link.className = "gameLink";
	name.appendChild(link);
	box1.appendChild(name);

	// Short description
	var shortDesc = document.createElement("p");
	shortDesc.className = "gameItemShortDesc";
	shortDesc.textContent = game.shortdescription;
	box1.appendChild(shortDesc);

	// Turn counter and status
	var turnCounter = document.createElement("p");
	turnCounter.className = "gameItemTurnCounter";
	turnCounter.textContent = "Turn " + game.turn + " - " + game.statusname;
	box1.appendChild(turnCounter);

	// Open slots
	var open = [];
	for (var i = 0; i < gameDetail.players.length; i++) {
		if (gameDetail.players[i].status == 0) {
			open.push(gameDetail.players[i]);
		}
	}

	var slotsText = (gameDetail.game.slots - open.length) + "/" + gameDetail.game.slots + " slots filled.";
	var slotsTextLong = "";
	if (open.length > 0) {
		slotsTextLong = "Remaining slots: ";
		for (var i = 0; i < open.length; i++) {
			slotsTextLong += raceIdToString(open[i].raceid);
			if (i != open.length - 1) {
				slotsTextLong += ", ";
			}
		}
	}

	var slots = document.createElement("p");
	slots.className = "gameItemSlots";
	slots.textContent = slotsText;
	box1.appendChild(slots);

	if (open.length > 0) {
		var slotsBox = document.createElement("div");
		slotsBox.className = "gameItemSlotsLong";
		slotsBox.textContent = slotsTextLong;
		slots.appendChild(slotsBox);
	}

	/*
		Box 3 (middle) (yes I know they are out of order)
	*/

	var box3 = document.createElement("div");
	container.appendChild(box3);
	box3.className = "gameItemBox box3";

	// Date created
	var created = document.createElement("p");
	created.className = "gameItemDateCreated";
	box3.appendChild(created);
	created.textContent = "Game created " + game.datecreated;
	
	// 2021-04-06 - v0.3 - Pampelmops - Show difficulty modifier and host days

	// Difficulty modifier
	var difficulty = document.createElement("p");
	difficulty.className = "gameItemDifficulty";
	box3.appendChild(difficulty);
	difficulty.textContent = "Difficulty Modifier: " + Math.round(game.difficulty*100)/100;

	// Host days
	var hostDays = document.createElement("p");
	hostDays.className = "gameItemHostDays";
	box3.appendChild(hostDays);
	hostDays.textContent = "Host days: " + game.hostdays;

	// // 2021-04-18 - v0.5 - Pampelmops - Date last quit event
	if (gameDetail.lastQuitEvent) {
		var lastQuitEvent = document.createElement("p");
		lastQuitEvent.className = "gameItemDateLastQuitEvent";
		box3.appendChild(lastQuitEvent);
		lastQuitEvent.textContent = "Last quit event (dropped or resigned): " + gameDetail.lastQuitEvent.dateadded;
	}

	/*
		Box 2 (right)
	*/
	var box2 = document.createElement("div");
	container.appendChild(box2);
	box2.className = "gameItemBox";

	var description = document.createElement("p");
	box2.appendChild(description);
	description.innerHTML = game.description;

	return container;
}

function displayGameList(gameDetailList) {
	clearList();
	var gameListElement = document.getElementById("games");
	
	var numText = document.getElementById("numGames");
	numText.textContent = "Found " + gameDetailList.length + " games";

	for (var i = 0; i < gameDetailList.length; i++) {
		gameListElement.appendChild(gameDetailToHtml(gameDetailList[i]));
	}
}

function raceIdToString(id) {
	switch (id) {
		case 0:
			return "Any Race";
		case 1:
			return "The Feds";
		case 2:
			return "The Lizard Alliance";
		case 3:
			return "The Bird Men";
		case 4:
			return "The Fascists";
		case 5:
			return "The Privateers";
		case 6:
			return "The Cyborg";
		case 7:
			return "The Crystals";
		case 8:
			return "The Evil Empire";
		case 9:
			return "The Robots";
		case 10:
			return "The Rebels";
		case 11:
			return "The Colonies";
		case 12:
			return "The Horwasp";
		default:
			return "Unknown Race";
	}
}
