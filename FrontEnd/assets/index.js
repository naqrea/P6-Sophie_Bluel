// GET PROJETS ET CATEGORIES

const worksUrl = "http://localhost:5678/api/works";
const categoriesUrl = "http://localhost:5678/api/categories";
const gallery = document.getElementById("gallery");
const filters = document.getElementById("filters");

function showProjects(works) {
  works.forEach((work) => {
    let project = document.createElement("figure");
    let projectImg = document.createElement("img");
    let projectTitle = document.createElement("figcaption");

    projectImg.src = work.imageUrl;
    projectTitle.textContent = work.title;

    project.appendChild(projectImg);
    project.appendChild(projectTitle);
    gallery.appendChild(project);
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
  showProjects(works.filter((work) => work.category.id === categoryId));
}

async function fetchWorks() {
  try {
    const response = await fetch(worksUrl);
    if (!response.ok) {
      throw new Error(`La requête a échoué avec le statut ${response.status}`);
    }
    works = await response.json();
    showProjects(works);
    let filter = document.createElement("li");
    showFilter(filter, "Tous");
    filter.addEventListener("click", () => {
      gallery.innerHTML = "";
      showProjects(works);
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

fetchWorks();
fetchCategories();
