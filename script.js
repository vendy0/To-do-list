/** @format */

// Les variables
let itemPlaceholder = document.getElementById("item-placeholder");
const unorderedList = document.getElementById("unordered-list");
const addTask = document.getElementById("add-task");
const taskInput = document.getElementById("task-input");
const deleteTask = document.getElementById("delete-task");
const deleteAllButton = document.getElementById("delete-all-button");

// Fonction pour changer le mode du Bouton delete.
function updateDeleteButtonState() {
	let children = unorderedList.querySelectorAll("li");
	const isInSaveMode = deleteTask.dataset.action === "save";

	if (
		isInSaveMode &&
		children.length === 1 &&
		children[0] === itemPlaceholder
	) {
		deleteTask.disabled = true;
		deleteAllButton.disabled = true;
	} else {
		deleteTask.disabled = false;
		deleteAllButton.disabled = false;
	}
}

// Fonction creatrice de tache
function createNewTask(task, isPlaceholder = false) {
	const checkbox = document.createElement("input");
	checkbox.type = "checkbox";
	const li = document.createElement("li");
	li.appendChild(checkbox);
	li.appendChild(document.createTextNode(" " + task));
	unorderedList.appendChild(li);
	taskInput.value = "";
	taskInput.focus();
	checkbox.dataset.state = "unchecked";

	if (isPlaceholder) {
		li.id = "itemPlaceholder";
	}
}

// Fonction créatrice de PlaceHolder
function newPlaceholder() {
	createNewTask("...", true);
	itemPlaceholder = unorderedList.lastChild;
}

// Verifie les éléments du localStorage puis supprime le placeHolder
let taskList = JSON.parse(localStorage.getItem("taskList") || "[]");
if (taskList.length != 0) {
	itemPlaceholder.remove();
	itemPlaceholder = null;
}

// Ajouter les éléments du localStorage
taskList.forEach(createNewTask);
updateDeleteButtonState();

// Bouton ajouter, ajouter une nouvelle tache !
// Ajouter un élément avec la touche Entrée.
taskInput.addEventListener("keypress", (e) => {
	if (e.key === "Enter") addTask.click();
});

addTask.addEventListener("click", () => {
	let newTask = taskInput.value.trim();
	if (taskList.includes(newTask)) {
		alert("Cette tâche existe déjà !");
		taskInput.value = "";
		return;
	}
	// Si l'entrée est vide.	/ S'il y a encore l'élément PlaceHolder
	if (!newTask) {
		alert("Entrez une tache valide !");
		taskInput.value = "";
		return;
	}
	if (itemPlaceholder) {
		itemPlaceholder.remove();
		itemPlaceholder = null;
	}
	// Ajouter la nouvelle tache (newTask) et l'ajouter à la taskList.
	createNewTask(newTask);
	taskList.push(newTask);
	updateDeleteButtonState();

	// Sauvegarder la nouvelle tâche dans le local storage
	localStorage.setItem("taskList", JSON.stringify(taskList));
});

// Supprimer un élément.
function toogleDeleteMode() {
	let children = unorderedList.querySelectorAll("li");
	let tasks = JSON.parse(localStorage.getItem("taskList") || "[]");
	// Changer le texte et le data state du bouton
	if (deleteTask.dataset.action === "save") {
		// Comme la condition n’est pas respectée, on agit comme dans "default"
		deleteTask.dataset.action = "delete";
		deleteTask.textContent = "Terminé";
		addTask.disabled = true;
		taskInput.disabled = true;
		deleteAllButton.disabled = true;
	} else {
		// Revenir en mode normal
		deleteTask.dataset.action = "save";
		deleteTask.textContent = "Supprimer une tâche";
		addTask.disabled = false;
		taskInput.disabled = false;
		deleteAllButton.disabled = false;
		updateDeleteButtonState();
	}

	// Option de suppression au click.
	// Ajout des li sous forme de tableau taskList, Écouteur d'évènement.
	children.forEach((child) => {
		// Vérifie si l'écouteur est déjà ajouté.
		if (child.dataset.listener === "true") return;
		child.addEventListener("click", () => {
			// Arrête la suppression si c'est le placeholder.
			// Confirmation de supression.
			if (
				child == itemPlaceholder ||
				deleteTask.dataset.action === "save"
			)
				return;

			let label = child.textContent.trim();
			let hasConfirmed = false;
			if (!hasConfirmed) {
				hasConfirmed = confirm(
					`Voulez-vous vraiment effacer cette tâche de la liste \"${label}\" ?`
				);

				// Si c'est confirmé on change le data state, on supprime l'élément, puis on sauvegarde dans le local storage.
				if (hasConfirmed) {
					let index = tasks.findIndex((t) => t === label);
					if (index != -1) tasks.splice(index, 1);
					localStorage.setItem("taskList", JSON.stringify(tasks));
					child.remove();
					taskList = tasks;

					if (unorderedList.children.length == 0) {
						newPlaceholder();
					}
					updateDeleteButtonState();
				}
			}
		});
		child.dataset.listener = "true";
	});
}

deleteTask.addEventListener("click", toogleDeleteMode);

// Fonction de suppression totale.
function deleteAllFunction() {
	let children = unorderedList.querySelectorAll("li");
	let hasConfirmed = false;

	hasConfirmed = confirm("Voulez-vous vraiment TOUT supprimer ?");
	if (hasConfirmed) {
		children.forEach((child) => {
			child.remove();
		});
		newPlaceholder();
		localStorage.clear();
		updateDeleteButtonState();
	}
}

// Option pour tout supprimer
deleteAllButton.addEventListener("click", deleteAllFunction);

// Sauvegarde du checkbox.
// La case à cocher

// Le problème mtn c'est que si je supprime une tâche mais que je ne confirme pas, bien sûr la tâche n'est pas supprimée mais je ne peux plus là toucher pour la supprimer. Pour ça je devrai repasser en mode save puis revenir sur delete.
