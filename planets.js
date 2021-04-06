// Planets game finder

function findJoining() {
	var gameList = document.getElementById("games");
	removeAllChildNodes(gameList);

	loadGames("?" + getQueryParams(), function(val) {
		console.log(val);

		getDetailsOfGames(val).then(data => {
			// Update html
			var numText = document.getElementById("numGames");
			numText.textContent = "Found " + val.length + " games";

			console.log(data);
			for (var i = 0; i < data.length; i++) {
				gameList.appendChild(gameDetailToHtml(data[i]));
			}
		});
	});
}

function findReplacements() {
	var gameList = document.getElementById("games");
	removeAllChildNodes(gameList);

	loadGames("?" + getQueryParams(), function(val) {
		var newlist = [];
		for (var i = 0; i < val.length; i++) {
			if (val[i].turnstatus.includes("o")) {
				newlist.push(val[i]);
			}
		}

		getDetailsOfGames(newlist).then(data => {
			// Update html
			var numText = document.getElementById("numGames");
			numText.textContent = "Found " + newlist.length + " games";

			console.log(data);
			for (var i = 0; i < data.length; i++) {
				gameList.appendChild(gameDetailToHtml(data[i]));
			}
		});
	});
}

function loadGames(args, callback) {
	var gameList = document.getElementById("games");
	removeAllChildNodes(gameList);
	var numText = document.getElementById("numGames");
	numText.textContent = "Searching...";

	fetch("https://api.planets.nu/games/list" + args)
		.then(response => response.json())
		.then(data => data.filter(filterByGameAttributes)) // 2021-04-06 - Pampelmops - Filter by game attributes
		.then(data => {
			data.sort(function(a, b) {
				return Date.parse(b.datecreated) - Date.parse(a.datecreated);
			})

			callback(data);
		});
}

// 2021-04-06 - Pampelmops - Function to filter by game attributes
function filterByGameAttributes(game) {
	// Difficulty Modifier
	var item = document.getElementById("difficultyModifier");
	if (item.checked) {
		var from = document.getElementById("difficultyModifierFrom").value;
		var to = document.getElementById("difficultyModifierTo").value;
		if (game.difficulty < from  ||  game.difficulty > to) return false;
	}
	
	return true;
}

function gameDetailToHtml(gameDetail) {
	var game = gameDetail.game;

	// Make game container
	var container = document.createElement("div");
	container.className = "gameContainer";

	// Make box 1 (leftmost)
	var box1 = document.createElement("div");
	container.appendChild(box1);

	// Sector Name
	var name = document.createElement("h3");
	name.className = "gameItemName";
	box1.className = "box1";
	
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

	// Date created
	var created = document.createElement("p");
	created.className = "gameItemDateCreated";
	box1.appendChild(created);
	created.textContent = "Game created " + game.datecreated;
	
	// 2021-04-06 - Pampelmops - Show difficulty modifier and host days

	// Difficulty modifier
	var difficulty = document.createElement("p");
	difficulty.className = "gameItemDifficulty";
	box1.appendChild(difficulty);
	difficulty.textContent = "Difficulty Modifier: " + Math.round(game.difficulty*100)/100;

	// Host days
	var hostDays = document.createElement("p");
	hostDays.className = "gameItemHostDays";
	box1.appendChild(hostDays);
	hostDays.textContent = "Host days: " + game.hostdays;

	// Box 2
	var box2 = document.createElement("div");
	container.appendChild(box2);

	var description = document.createElement("p");
	box2.appendChild(description);
	description.innerHTML = game.description;

	return container;
}

function getDetailsOfGames(games) {
	const promises = [];
	
	for (var i = 0; i < games.length; i++) {
		promises.push(getIndividualGame(games[i].id));
	}

	return Promise.all(promises);
}

function getIndividualGame(id) {
	return fetch("https://api.planets.nu/game/loadinfo?gameid=" + id)
		.then(response => response.json())
		.then(data => {
			return data;
		});
}

function getQueryParams() {
	// Game status
	var status = "status=";
	var first = true;

	var item = document.getElementById("interest");
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

function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}