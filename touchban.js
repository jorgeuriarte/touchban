var testEl;
var zIndex = 100;

window.onload = function () {
	setup();
}

function setup() {
	projects = ['ticketBisMto', 'Rene'];
	setupKanbanProjectsList(projects);
	setupProject();
}

var cards;
function setupProject() {
	var list = document.getElementById('projectsList');
	var project = list.options[list.selectedIndex].text;
	setupBoard(getProjectStates(project));
	removeCardsFromDocument(document);
	putCardsOnDocument(getProjectCards(project), document);
}

function setupKanbanProjectsList(projects) {
	document.getElementById("menuArea").innerHTML = '';
	var select = document.createElement('select');
	select.id = 'projectsList'
	for (var p in projects) {
		option = document.createElement('option')
		option.value=p;
		option.text=projects[p];
		select.appendChild(option);
	}
	select.onchange = setupProject;
	document.getElementById("menuArea").appendChild(select);
}

function getProjectStates(project) {
	if (project == 'ticketBisMto')
		return {'Backlog':{'blue':15},
				'En proceso':{'orange':5},
				'En pruebas':{'magenta':5},
				'Merged':{'red':5},
				'Solucionado':{'green':10}
			};
	if (project == 'Rene') {
		return {'Priorizadas':{'blue':15},
				'Doing':{'red':5},
				'Done':{'green':10}
			};
	}
}

var projectCards = {};
function getProjectCards(project) {
	cards = projectCards[project];
	if (!cards) {
		projectCards[project] = cards = loadCardsForProject(project);
	}
	return cards;
}

function loadCardsForProject(project) {
	console.log('Loading cards for project "' + project + '"')
	if (project == 'ticketBisMto') {
		return [{id:100, text:"Uno"},
		     {id:103, text:"Otro"},
		     {id:105, text:"Una más, esta con texto largo, y con pocas probabilidades de caber en el espacio"}
		   ];
	}
	if (project == 'Rene') {
		return [{id:109, text:"René #1"},
		     {id:123, text:"René #234"},
		     {id:145, text:"René #sdsf"}
		     ];
	}	
}

function setupBoard(columns) {
	board = document.getElementById('board');
	board.innerHTML = '';
	left = 10;
	for (c in columns) {
		for (color in columns[c]) {
			var head = document.createElement('div');
			head.innerHTML = c;
			head.style.backgroundColor = color;
			head.setAttribute('class', 'header')
			head.style.position = "absolute";
			head.style.left = left + "px";
			board.appendChild(head);
		}
		sep = document.createElement('div');
		sep.setAttribute('style', 'clear: both;');
		board.appendChild(sep);
		col = document.createElement('div');
		col.setAttribute('class', 'column');
		col.style.left = left + "px";
		board.appendChild(col);
		left += 225;
		addColumnInfo(col);
	}
}

function _setupBoard(columns) {
	cabeceras = document.getElementById('boardHeaders');
	columnas = document.getElementById('boardColumns');
	cabeceras.innerHTML = '';
	columnas.innerHTML = '';
	for(c in columns) {
		for(color in columns[c]) {
			var head = document.createElement('th');
			head.innerHTML = c;
			head.style.backgroundColor = color;
			head.style.width = "150px";
			cabeceras.appendChild(head);
		}
		var col = document.createElement('td');
		col.id = c
		columnas.appendChild(col);
		addColumnInfo(col);
	}
	
}

var columnInfo = {}
function addColumnInfo(col) {
	columnInfo[getOffset(col).left] = col;
}

function findDropColumn(left, top) {
	for(var pos in columnInfo) {
		if (pos > left)
			 return columnInfo[pre];
		pre = pos
	}
	return columnInfo[pre];
}

function putCardsOnDocument(cards, doc) {
	colors = ['red','green','blue','pink','yellow'];
	for (c in cards) {
		var card = doc.createElement('div');
		card.setAttribute('class', 'card');
		card.setAttribute('id', cards[c].id)
		card.innerHTML = cards[c].text;
		card.style.backgroundColor = colors[c%colors.length];
		doc.body.appendChild(card);
		card.style.top = 50*c + "px";
	}
	makeCardsMovable(doc);
}

function makeCardsMovable(doc) {
	cards = document.getElementsByClassName('card');
	for (i=0; i<cards.length; i++) {
		cards[i].onmousedown = cards[i].ontouchstart = startDrag;
	}	
}

function removeCardsFromDocument(doc) {
	cards = document.getElementsByClassName('card');
	for (var c=cards.length-1; c >= 0; c--) {
		doc.body.removeChild(cards[c]);
 	}
}

function startDrag(e) {
	if (e.type === 'touchstart' || e.type === 'mousedown') {
		this.onmousedown = null;
		this.onmousemove = this.ontouchmove = moveDrag;
		this.onmouseup = this.ontouchend = endDrag;
		e.target.setAttribute('class', 'cardfloat');
	} else {
		document.onmousemove = moveDrag;
		document.onmouseup = function () {
			document.onmousemove = null;
			document.onmouseup = null;
		}
	}

	var pos = [this.offsetLeft,this.offsetTop];
	var that = this;
	var origin = getCoors(e);

	function moveDrag (e) {
		var currentPos = getCoors(e);
		var deltaX = currentPos[0] - origin[0];
		var deltaY = currentPos[1] - origin[1];
		this.style.left = (pos[0] + deltaX) + 'px';
		this.style.top  = (pos[1] + deltaY) + 'px';
		return false; // cancels scrolling
	}

	function endDrag(e) {
		this.onmousemove = null;
		this.onmousedown = startDrag;
		console.log("Dropped in " + findDropColumn(this.style.left, this.style.top).id);
		notificate("Changed status of " + e.target.id + " to '" + findDropColumn(this.style.left, this.style.top).id + "'");
		e.target.setAttribute('class', 'card');
	}
}

function getCoors(e) {
	var coors = [];
	if (e.targetTouches && e.targetTouches.length) { 	// iPhone
		var thisTouch = e.targetTouches[0];
		coors[0] = thisTouch.clientX;
		coors[1] = thisTouch.clientY;
	} else { 								// all others
		coors[0] = e.clientX;
		coors[1] = e.clientY;
	}
	return coors;
}

function getOffset( el ) {
    var _x = 0;
    var _y = 0;
    while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }
    return { top: _y, left: _x };
} 

function notificate(text) {
	document.getElementById("notificationArea").innerHTML=text;
}

function $(id) {
	return document.getElementById(id);
}
