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
	
	// 2021-04-06 - v0.3 - Pampelmops - Show difficulty modifier and host days

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

	// // 2021-04-18 - v0.5 - Pampelmops - Date last quit event
	if (gameDetail.lastQuitEvent) {
		var lastQuitEvent = document.createElement("p");
		lastQuitEvent.className = "gameItemDateLastQuitEvent";
		box2.appendChild(lastQuitEvent);
		lastQuitEvent.textContent = "Last quit event (dropped or resigned): " + gameDetail.lastQuitEvent.dateadded;
	}

	return container;
}

function displayGameList(gameDetailList) {
	for (var i = 0; i < gameDetailList.length; i++) {
		gameList.appendChild(gameDetailToHtml(gameDetailList[i]));
	}
}

export { displaySearching, displayGameList }