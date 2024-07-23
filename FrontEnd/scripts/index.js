const worksUrl = "http://localhost:5678/api/works";
const categoriesUrl = "http://localhost:5678/api/categories";
let works = [];
let categories = [];

/**
 * Affiche les projets dans l'élément cible.
 * @param {Array} works - Tableau des projets à afficher.
 * @param {HTMLElement} targetElement - Élément dans lequel afficher les projets.
 */
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

/**
 * Affiche un filtre dans l'élément cible.
 * @param {HTMLElement} filter - Élément du filtre à configurer.
 * @param {string} name - Nom du filtre à afficher.
 */
function showFilter(filter, name) {
  filter.textContent = name;
  filter.classList.add("filter");
  filter.setAttribute("tabindex", "0");
  filters.appendChild(filter);
}

/**
 * Filtre et affiche les projets par catégorie.
 * @param {number} categoryId - ID de la catégorie selon laquelle filtrer.
 */
function filterProjectsByCategory(categoryId) {
  const filteredWorks = works.filter((work) => work.category.id === categoryId);
  showProjects(filteredWorks, gallery);
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

/**
 * Supprime un projet via l'API et met à jour l'interface utilisateur.
 * @param {number} projectId - ID du projet à supprimer.
 * @param {HTMLElement} elementToDelete - Élément du projet à supprimer dans l'interface utilisateur.
 */
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

    const adminControls = document.createElement("div");
    adminControls.textContent = "Mode édition";
    adminControls.classList.add("admin-controls-banner");
    document.body.prepend(adminControls);

    const editProjectsButton = document.getElementById("editProjectsButton");
    const addProjectButton = document.getElementById("addProjectButton");
    const editModal = document.getElementById("editModal");

    editProjectsButton.classList.add("edit-projects-button");
    editProjectsButton.textContent = "modifier";
    editProjectsButton.addEventListener("click", (e) => {
      e.preventDefault();
      editModal.style.display = "flex";
      document.getElementById("addProjectForm").style.display = "none";
      document.getElementById("deleteProjectForm").style.display = "flex";
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
