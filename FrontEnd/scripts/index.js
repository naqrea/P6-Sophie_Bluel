const worksUrl = "http://localhost:5678/api/works";
const categoriesUrl = "http://localhost:5678/api/categories";
let works = [];
let categories = [];

// Affichage des projets
function showProjects(works, targetElement) {
  targetElement.innerHTML = "";
  works.forEach((work) => {
    const project = document.createElement("figure");
    project.classList.add("project-figure");

    const projectImg = document.createElement("img");
    projectImg.src = work.imageUrl;

    const projectTitle = document.createElement("figcaption");
    projectTitle.textContent = work.title;

    project.appendChild(projectImg);
    project.appendChild(projectTitle);
    targetElement.appendChild(project);
  });
}
// Affichage des filtres
function showFilter(filter, name) {
  filter.textContent = name;
  filter.classList.add("filter");
  filter.setAttribute("tabindex", "0");
  filters.appendChild(filter);
}

// Filtrer par categorie
function filterProjectsByCategory(categoryId) {
  const filteredWorks = works.filter(
    (work) => work.category && work.category.id === categoryId
  );
  showProjects(filteredWorks, gallery);
}

function resetFilters() {
  filters.innerHTML = "";

  // Ajouter le filtre "Tous"
  const allFilter = document.createElement("li");
  showFilter(allFilter, "Tous");
  allFilter.addEventListener("click", () => showProjects(works, gallery));

  // Ajouter les filtres pour chaque catégorie
  categories.forEach((category) => {
    const filter = document.createElement("li");
    showFilter(filter, category.name);
    filter.addEventListener("click", () =>
      filterProjectsByCategory(category.id)
    );
  });
}

/**
 * Récupère les projets depuis l'API et les affiche.
 */
async function fetchWorks() {
  try {
    const response = await fetch(worksUrl);
    if (!response.ok)
      throw new Error(`La requête a échoué avec le statut ${response.status}`);

    works = await response.json();
    showProjects(works, gallery);
    showProjects(works, document.getElementById("modalProjects"));

    // Ajouter le filtre "Tous" si non existant
    if (
      ![...filters.children].some((filter) => filter.textContent === "Tous")
    ) {
      const allFilter = document.createElement("li");
      showFilter(allFilter, "Tous");
      allFilter.addEventListener("click", () => showProjects(works, gallery));
      allFilter.focus();
    }
  } catch (error) {
    console.error(`Erreur lors de la récupération des données: ${error}`);
  }
}

/**
 * Récupère les catégories depuis l'API et les affiche.
 */
async function fetchCategories() {
  try {
    const response = await fetch(categoriesUrl);
    if (!response.ok)
      throw new Error(`La requête a échoué avec le statut ${response.status}`);

    categories = await response.json();
    const categorySelect = document.getElementById("category");
    categories.forEach((category) => {
      const filter = document.createElement("li");
      showFilter(filter, category.name);
      filter.addEventListener("click", () =>
        filterProjectsByCategory(category.id)
      );

      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;
      categorySelect.appendChild(option);
    });
  } catch (error) {
    console.error(`Erreur lors de la récupération des données: ${error}`);
  }
}
// Ajoute les icônes de poubelle aux projets
function addBinIcons() {
  const projectFigures = document
    .getElementById("modalProjects")
    .querySelectorAll(".project-figure");
  projectFigures.forEach((figure, index) => {
    if (!figure.querySelector(".bin-icon")) {
      const bin = document.createElement("img");
      bin.src = "./assets/icons/bin.svg";
      bin.classList.add("bin-icon");
      bin.addEventListener("click", (e) => {
        const projectId = works[index].id;
        deleteProject(projectId, figure);
      });
      figure.appendChild(bin);
    }
  });
}

// Suppresion d'un projet
async function deleteProject(projectId, elementToDelete) {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("User is not authenticated.");
    return;
  }

  try {
    const response = await fetch(`${worksUrl}/${projectId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok)
      throw new Error(
        `La suppression a échoué avec le statut ${response.status}`
      );

    works = works.filter((work) => work.id !== projectId);
    showProjects(works, document.getElementById("modalProjects"));
    showProjects(works, gallery);
    addBinIcons();
    console.log(`Projet avec l'ID ${projectId} supprimé avec succès.`);
  } catch (error) {
    console.error(`Erreur lors de la suppression du projet: ${error}`);
  }
}

/**
 * Modifie la page d'accueil pour un utilisateur authentifié.
 */
function modifyHomePageForAuthenticatedUser() {
  const token = localStorage.getItem("token");
  if (token) {
    const loginLink = document.getElementById("login-link");
    if (loginLink) {
      loginLink.textContent = "logout";
      loginLink.href = "#";
      loginLink.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("token");
        window.location.reload();
      });
    }

    const editMode = document.createElement("div");
    const editModeIcon = document.createElement("img");
    const editModeTitle = document.createElement("p");
    editModeIcon.src = "../assets/icons/editb.svg";
    editMode.appendChild(editModeIcon);
    editMode.appendChild(editModeTitle);
    editModeTitle.textContent = "Mode édition";
    editMode.classList.add("edit-mode-banner");
    document.body.prepend(editMode);

    const editProjectsButton = document.getElementById("editProjectsButton");
    const addProjectButton = document.getElementById("addProjectButton");
    const editModal = document.getElementById("editModal");

    editProjectsButton.style.display = "flex";
    editProjectsButton.addEventListener("click", (e) => {
      e.preventDefault();
      editModal.style.display = "flex";
      document.getElementById("addProjectForm").style.display = "none";
      document.getElementById("deleteProjectForm").style.display = "flex";
      showProjects(works, document.getElementById("modalProjects"));
      addBinIcons();

      const projectFigures = document
        .getElementById("modalProjects")
        .querySelectorAll(".project-figure");
      projectFigures.forEach((figure, index) => {
        const bin = document.createElement("img");
        bin.src = "./assets/icons/bin.svg";
        bin.classList.add("bin-icon");
        bin.addEventListener("click", (e) => {
          e.stopPropagation();
          const projectId = works[index].id;
          deleteProject(projectId, figure);
        });
        figure.appendChild(bin);
      });
    });

    addProjectButton.addEventListener("click", (e) => {
      e.preventDefault();
      editModal.style.display = "flex";
      document.getElementById("modalProjects").style.display = "none";
      document.getElementById("addProjectForm").style.display = "flex";
    });

    document.querySelector(".close-button").addEventListener("click", (e) => {
      e.preventDefault();
      document.getElementById("modalProjects").style.display = "flex";
      document.getElementById("addProjectForm").style.display = "none";
      editModal.style.display = "none";
    });

    window.onclick = (event) => {
      if (event.target == editModal) {
        editModal.style.display = "none";
      }
    };
  }
}
document.addEventListener("DOMContentLoaded", () => {
  fetchWorks();
  fetchCategories();
  modifyHomePageForAuthenticatedUser();

  // Gestion de l'affichage des modales
  const editModal = document.getElementById("editModal");
  const editProjectsButton = document.getElementById("editProjectsButton");
  const addProjectButton = document.getElementById("addProjectButton");
  const submitProjectButton = document.getElementById("submitProjectButton");

  const closeButton = document.querySelector(".close-button");

  // Désactiver le bouton par défaut
  submitProjectButton.disabled = true;
  submitProjectButton.classList.add("disabled-button");

  // Fonction pour vérifier l'état des champs
  function checkFormFields() {
    const fileInput = document.getElementById("file");
    const titleInput = document.getElementById("title");
    const categorySelect = document.getElementById("category");

    if (
      fileInput.files.length > 0 &&
      titleInput.value.trim() !== "" &&
      categorySelect.value !== ""
    ) {
      submitProjectButton.disabled = false;
      submitProjectButton.classList.remove("disabled-button");
    } else {
      submitProjectButton.disabled = true;
      submitProjectButton.classList.add("disabled-button");
    }
  }

  // Ajouter des gestionnaires d'événements pour les champs de formulaire
  const fileInput = document.getElementById("file");
  const titleInput = document.getElementById("title");
  const categorySelect = document.getElementById("category");

  fileInput.addEventListener("change", checkFormFields);
  titleInput.addEventListener("input", checkFormFields);
  categorySelect.addEventListener("change", checkFormFields);

  // Afficher la modal pour l'édition des projets
  editProjectsButton.addEventListener("click", (e) => {
    e.preventDefault();
    editModal.style.display = "flex";
    document.getElementById("addProjectForm").style.display = "none";
    document.getElementById("modalProjects").style.display = "flex";
    showProjects(works, document.getElementById("modalProjects"));

    const projectFigures = document
      .getElementById("modalProjects")
      .querySelectorAll(".project-figure");
    projectFigures.forEach((figure, index) => {
      if (!figure.querySelector(".bin-icon")) {
        const bin = document.createElement("img");
        bin.src = "./assets/icons/bin.svg";
        bin.classList.add("bin-icon");
        bin.addEventListener("click", (e) => {
          e.stopPropagation();
          const projectId = works[index].id;
          deleteProject(projectId, figure);
        });
        figure.appendChild(bin);
      }
    });
  });

  // Afficher la modal pour ajouter un projet
  addProjectButton.addEventListener("click", (e) => {
    e.preventDefault();
    editModal.style.display = "flex";
    document.getElementById("deleteProjectForm").style.display = "none";
    document.getElementById("addProjectForm").style.display = "flex";
    document.getElementById("addProjectForm").reset();
  });

  const imagePreview = document.getElementById("imagePreview");

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        imagePreview.src = event.target.result;
        imagePreview.style.display = "block";
      };
      reader.readAsDataURL(file);
    } else {
      imagePreview.src = "";
      imagePreview.style.display = "none";
    }
  });

  submitProjectButton.addEventListener("click", async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("User is not authenticated.");
      return;
    }

    const fileInput = document.getElementById("file");
    const title = document.getElementById("title").value;
    const categoryId = document.getElementById("category").value;

    const formData = new FormData();
    formData.append("image", fileInput.files[0]);
    formData.append("title", title);
    formData.append("category", categoryId);

    try {
      const response = await fetch(worksUrl, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok)
        throw new Error(`L'ajout a échoué avec le statut ${response.status}`);

      const newWork = await response.json();
      works.push(newWork);
      showProjects(works, document.getElementById("modalProjects"));
      showProjects(works, gallery);
      fileInput.value = "";
      imagePreview.src = "./assets/icons/picture.svg";
      console.log(`Projet ajouté avec succès: ${newWork.title}`);
      editModal.style.display = "none";
    } catch (error) {
      console.error(`Erreur lors de l'ajout du projet: ${error}`);
    }
  });

  // Fermer la modal
  closeButton.addEventListener("click", (e) => {
    e.preventDefault();
    editModal.style.display = "none";
  });

  // Fermer la modal en cliquant en dehors de celle-ci
  window.addEventListener("click", (event) => {
    if (event.target === editModal) {
      editModal.style.display = "none";
    }
  });
});
