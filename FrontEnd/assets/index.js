const worksUrl = "http://localhost:5678/api/works";
const categoriesUrl = "http://localhost:5678/api/categories";
const gallery = document.getElementById("gallery");
const filters = document.getElementById("filters");
const portfolio = document.getElementById("portfolio");

let works = [];
let categories = [];

function showProjects(works, targetElement) {
  targetElement.innerHTML = "";
  works.forEach((work) => {
    let project = document.createElement("figure");
    project.classList.add("project-figure");
    let projectImg = document.createElement("img");
    let projectTitle = document.createElement("figcaption");

    projectImg.src = work.imageUrl;
    projectTitle.textContent = work.title;

    project.appendChild(projectImg);
    project.appendChild(projectTitle);
    targetElement.appendChild(project);
  });
}

function showFilter(filter, name) {
  filter.textContent = name;
  filter.classList.add("filter");
  filter.setAttribute("tabindex", "0");
  filters.appendChild(filter);
}

function filterProjectsByCategory(categoryId) {
  gallery.innerHTML = "";
  showProjects(
    works.filter((work) => work.category.id === categoryId),
    gallery
  );
}

async function fetchWorks() {
  try {
    const response = await fetch(worksUrl);
    if (!response.ok) {
      throw new Error(`La requête a échoué avec le statut ${response.status}`);
    }
    works = await response.json();
    showProjects(works, gallery);
    showProjects(works, document.getElementById("modalProjects"));

    let filter = document.createElement("li");
    showFilter(filter, "Tous");
    filter.addEventListener("click", () => {
      gallery.innerHTML = "";
      showProjects(works, gallery);
    });
  } catch (error) {
    console.error(`Erreur lors de la récupération des données: ${error}`);
  }
}

async function fetchCategories() {
  try {
    const response = await fetch(categoriesUrl);
    if (!response.ok) {
      throw new Error(`La requête a échoué avec le statut ${response.status}`);
    }
    categories = await response.json();
    categories.forEach((category) => {
      let filter = document.createElement("li");
      showFilter(filter, category.name);
      filter.addEventListener("click", () => {
        filterProjectsByCategory(category.id);
      });
    });
  } catch (error) {
    console.error(`Erreur lors de la récupération des données: ${error}`);
  }
}

async function deleteProject(projectId) {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("User is not authenticated.");
    return;
  }

  try {
    const response = await fetch(`${worksUrl}/${projectId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `La suppression a échoué avec le statut ${response.status}`
      );
    }

    works = works.filter((work) => work.id !== projectId);
    showProjects(works, gallery);
    showProjects(works, document.getElementById("modalProjects"));

    console.log(`Projet avec l'ID ${projectId} supprimé avec succès.`);
  } catch (error) {
    console.error(`Erreur lors de la suppression du projet: ${error}`);
  }
}

function modifyHomePageForAuthenticatedUser() {
  const token = localStorage.getItem("token");
  if (token) {
    const loginLink = document.querySelector(
      'nav ul li a[href="./assets/pages/login.html"]'
    );
    if (loginLink) {
      loginLink.textContent = "Logout";
      loginLink.href = "#";
      loginLink.addEventListener("click", () => {
        localStorage.removeItem("token");
        window.location.reload("");
      });
    }

    const adminControls = document.createElement("div");
    adminControls.textContent = "Mode édition";
    adminControls.classList.add("admin-controls-banner");
    document.body.prepend(adminControls);

    const editProjectsButton = document.getElementById("editProjectsButton");
    editProjectsButton.classList.add("edit-projects-button");
    editProjectsButton.textContent = "modifier";

    document
      .getElementById("editProjectsButton")
      .addEventListener("click", function () {
        document.getElementById("editModal").style.display = "block";
        const projectFigures = document.querySelectorAll(".project-figure");
        projectFigures.forEach((figure) => {
          let bin = document.createElement("div");
          bin.classList.add("bin-icon");
          bin.textContent = "DEL";
          figure.appendChild(bin);
        });
        const bins = document.querySelectorAll(".bin-icon");
        bins.forEach((bin, index) => {
          bin.addEventListener("click", () => {
            const projectId = works[index].id;
            deleteProject(projectId);
            showProjects(works, document.getElementById("modalProjects"));
          });
        });
      });

    document
      .querySelector(".close-button")
      .addEventListener("click", function () {
        document.getElementById("editModal").style.display = "none";
      });

    window.onclick = function (event) {
      let modal = document.getElementById("editModal");
      if (event.target == modal) {
        modal.style.display = "none";
      }
    };
  }
}
// FONCTION POUR BOUTON AJOUTER PHOTOS

// const addProjectForm = document.getElementById("addProject");
// addProjectForm.addEventListener("submit", async function (e) {
//   e.preventDefault();
// });

fetchWorks();
fetchCategories();
modifyHomePageForAuthenticatedUser();
