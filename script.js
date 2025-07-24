/** @format */

// LES VARIABLES
const unorderedList = document.getElementById("unordered-list");
let placeholder = document.getElementById("placeholder");
const enterTaskInput = document.getElementById("enter-task-input");
const addTaskButton = document.getElementById("add-task-button");
const deleteATaskButton = document.getElementById("delete-a-task-button");
const deleteAllTaskButton = document.getElementById("delete-all-task-button");

/*
 * LES FONCTIONS
 */
// Fonction pour ajouter des tâches :
function createNewTask(task, checked = false) {
	deletePlaceholder();

	let li = document.createElement("li");
	let checkbox = document.createElement("input");
	checkbox.type = "checkbox";
	li.appendChild(checkbox);

	let spanLabel = document.createElement("span");
	spanLabel.className = "label";
	spanLabel.textContent = " " + task;
	li.appendChild(spanLabel);

	let p = document.createElement("p");
	p.className = "date";
	p.appendChild(document.createTextNode(showDate()));
	li.appendChild(p);
	unorderedList.appendChild(li);

	enterTaskInput.value = "";
	enterTaskInput.focus();

	if (checked) {
		checkbox.checked = true;
	}
}

// Fonction pour ajouter le placeholder
function newPlaceholder() {
	placeholder = createPlaceholder();
	unorderedList.appendChild(placeholder);
}

// Fonction pour Désactiver les boutons s'il n'y a plus aucune tâches
function disableButtons() {
	let placeholder = document.getElementById("placeholder");
	if (
		placeholder &&
		unorderedList.contains(placeholder) &&
		deleteATaskButton.dataset.mode === "saveMode"
	) {
		deleteATaskButton.disabled = true;
		deleteAllTaskButton.disabled = true;
	} else {
		deleteATaskButton.disabled = false;
		deleteAllTaskButton.disabled = false;
	}
}

// Fonction pour créer le placeholder :
function createPlaceholder() {
	let li = document.createElement("li");
	li.id = "placeholder";
	let checkbox = document.createElement("input");
	checkbox.type = "checkbox";
	checkbox.disabled = true;
	li.appendChild(checkbox);
	li.appendChild(document.createTextNode("..."));
	placeholder = li;

	return li;
}

// Fonction pour supprimer le placeholder
function deletePlaceholder() {
	placeholder = document.getElementById("placeholder");
	if (placeholder && unorderedList.contains(placeholder)) {
		placeholder.remove();
		placeholder = null;
	}
}

// Fonction pour Sauvegarder les tâches dans le localStorage
function storeTask(task) {
	let taskListStored = JSON.parse(localStorage.getItem("taskList") || "[]");
	let object1 = {};
	object1.label = task;
	object1.statut = "unchecked";
	object1.category = "none";
	object1.date = showDate();
	taskListStored.push(object1);
	sauvegarder(taskListStored);
}

// Fonction pour virer les accents et la casse
function normalizeText(text) {
	return text
		.normalize("NFD") // Décompose les accents
		.replace(/[\u0300-\u036f]/g, "") // Supprime les diacritiques
		.toUpperCase(); // Insensible à la casse
}

/*
 * FONCTION POUR VÉRIFIER LA TÂCHE ENTRÉE
 * Vérifie si l'entrée n'est pas vide
 * Vérifie si la tâche n'existe pas déjà
 */
function taskVerification(task) {
	let found = false;
	for (let li of unorderedList.querySelectorAll("li")) {
		const label = li.querySelector("span.label");
		if (!label) continue;
		if (normalizeText(label.textContent.trim()) === normalizeText(task)) {
			found = true;
			break;
		}
	}
	if (!task) {
		alert("Entrez une tâche valide !");
		return false;
	} else if (found) {
		alert("Cette tâche existe déjà !");
		enterTaskInput.value = "";
		return false;
	} else {
		return true;
	}
}

// Fonction pour recréer les elements pour supprimer l'ecouteur d'Event
function recreateElements() {
	document.querySelectorAll("li").forEach((li) => {
		li.classList.remove("delete-mode");
		let clone = li.cloneNode(true);
		li.replaceWith(clone);
	});
}

// Fonction pour supprimer une tache
function deleteATask(task) {
	let taskListDisplay = unorderedList.querySelectorAll("li");
	deletePlaceholder();
	let taskListStored = sync();
	let index = taskListStored.findIndex(
		(t) => t.label === task.textContent.trim()
	);

	taskListStored.splice(index, 1);
	return taskListStored;
}

// Fonction pour sauvegarder dans le localStorage
function sauvegarder(taskListStored) {
	localStorage.setItem("taskList", JSON.stringify(taskListStored));
}

// Fonction pour recuperer du le localStorage
function sync() {
	let taskListStored = JSON.parse(localStorage.getItem("taskList") || "[]");
	return taskListStored;
}

// Fonction de suppression
function deleteMode() {
	let taskListDisplay = unorderedList.querySelectorAll("li");
	taskListDisplay.forEach((task) => {
		task.addEventListener("click", () => {
			// Confirmation :
			let hasConfirmed = false;
			hasConfirmed = confirm(
				`Voulez-vous vraiment supprimer cette tache : ${task.textContent} ?`
			);

			if (hasConfirmed) {
				let taskListStored = deleteATask(task);
				task.remove();
				let taskListDisplay = unorderedList.querySelectorAll("li");
				if (taskListDisplay.length === 0) newPlaceholder();
				sauvegarder(taskListStored);
			}
		});
	});
}

// Fonction pour Désactiver les checkboxs
function disableCheckboxes(disable) {
	let checkboxes = unorderedList.querySelectorAll("input");
	if (disable) {
		checkboxes.forEach((checkbox) => {
			checkbox.disabled = true;
		});
	} else {
		checkboxes.forEach((checkbox) => {
			checkbox.disabled = false;
		});
	}
}

/*
 * Fonction pour Changer de mode save / delete.
 * Changer de mode
 * Désactiver l'input et les boutons
 * Désactiver les checkbox
 */
function toggleDeleteMode() {
	if (deleteATaskButton.dataset.mode == "saveMode") {
		deleteATaskButton.dataset.mode = "deleteMode";
		deleteATaskButton.textContent = "Terminé";
		addTaskButton.disabled = true;
		enterTaskInput.disabled = true;
		deleteAllTaskButton.disabled = true;

		deleteMode();
		disableCheckboxes(true);
	} else {
		deleteATaskButton.dataset.mode = "saveMode";
		deleteATaskButton.textContent = "Supprimer une tâche";
		addTaskButton.disabled = false;
		enterTaskInput.disabled = false;
		deleteAllTaskButton.disabled = false;

		recreateElements();
		disableCheckboxes(true);
	}
}

// Fontion pour tout supprimer :
function deleteAll() {
	let hasConfirmed = false;
	hasConfirmed = confirm("Voulez-vous vraiment TOUT supprimer ?");
	if (hasConfirmed) {
		localStorage.removeItem("taskList");
		unorderedList.querySelectorAll("li").forEach((li) => {
			li.remove();
		});
		newPlaceholder();

		disableButtons();
	}
}

// Fonction pour checker

/**
 * LE CODE
 */

enterTaskInput // Ajouter avec la touche entrer
	.addEventListener("keypress", (e) => {
		if (e.key === "Enter") addTaskButton.click();
	});

// Recupérer le localStorage et placer les tâches
let taskListStored = sync();
if (taskListStored) {
	taskListStored.forEach((task) => {
		if (task.statut === "unchecked") {
			createNewTask(task.label);
		} else if (task.statut === "checked") {
			createNewTask(task.label, true);
		}
	});
}

disableButtons();

// Ajouter des tâches au clic.
addTaskButton.addEventListener("click", () => {
	let taskListDisplay = unorderedList.querySelectorAll("li");
	let newTask = enterTaskInput.value.trim();
	let inputIsOkay = taskVerification(newTask);
	if (!inputIsOkay) return;
	createNewTask(newTask);
	storeTask(newTask);
	disableButtons();
});

// Supprimer un élément
deleteATaskButton.addEventListener("click", () => {
	toggleDeleteMode();
	disableButtons();
});

// Supprimer tous les elements :
deleteAllTaskButton.addEventListener("click", deleteAll);
/*
 * Afficher un log : C + A + L
 * Commenter ce log : A + S + C
 * Uncomment : A + S + U
 * Supprimer le log : A + S + D
 */

unorderedList.querySelectorAll("li").forEach((li) => {
	li.addEventListener("change", () => {
		let taskListStored = sync();
		let span = li.querySelector("span");
		let index = taskListStored.findIndex(
			(t) => t.label === span.textContent.trim()
		);

		taskListStored[index].statut =
			taskListStored[index].statut === "checked"
				? "unchecked"
				: "checked";

		sauvegarder(taskListStored);
	});
});

function showDate() {
	let now = new Date();
	return (
		now.toLocaleDateString() +
		" - " +
		now.getHours() +
		":" +
		now.getMinutes()
	);
}
