const worksUrl = "http://localhost:5678/api/works";
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

function createFilterButtons(works) {
  let category = new Map();

  works.forEach((work) => {
    category.set(work.category.id, work.category.name);
  });

  category.forEach((name, id) => {
    let filter = document.createElement("li");
    filter.textContent = name;
    filters.appendChild(filter);
    filter.addEventListener("click", () => filterProjectsByCategory(id));
  });
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
    createFilterButtons(works);
  } catch (error) {
    console.error(`Erreur lors de la récupération des données: ${error}`);
  }
}

fetchWorks();
