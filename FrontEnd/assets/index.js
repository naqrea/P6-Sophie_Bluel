const worksUrl = "http://localhost:5678/api/works";
const gallery = document.getElementById("gallery");
const filters = document.getElementById("filters");

function filterByCategoryId(data, categoryId) {
  return data.filter((item) => item.categoryId === categoryId);
}

let allWorks = [];

async function fetchAndDisplayWorks() {
  await fetchWorks();
  createFilterButtons();
}

function createFilterButton(categoryId) {
  let filter = document.createElement("li");
  filter.textContent = `${categoryId}`;
  filter.onclick = () => filterAndDisplayWorks(categoryId);
  filters.appendChild(filter);
}

function createFilterButtons() {
  createFilterButton(1);
  createFilterButton(2);
  createFilterButton(3);
}

function filterAndDisplayWorks(categoryId) {
  let filteredWorks = filterByCategoryId(allWorks, categoryId);
  gallery.innerHTML = "";
  filteredWorks.forEach((work) => {
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

async function fetchWorks() {
  try {
    const response = await fetch(worksUrl);
    if (!response.ok) {
      throw new Error(`La requête a échoué avec le statut ${response.status}`);
    }
    allWorks = await response.json();
    allWorks.forEach((work) => {
      let project = document.createElement("figure");
      let projectImg = document.createElement("img");
      let projectTitle = document.createElement("figcaption");

      projectImg.src = work.imageUrl;
      projectTitle.textContent = work.title;

      project.appendChild(projectImg);
      project.appendChild(projectTitle);
      gallery.appendChild(project);
    });
  } catch (error) {
    console.error(`Erreur lors de la récupération des données: ${error}`);
  }
}

fetchAndDisplayWorks(); // Appel initial pour charger et afficher les œuvres

// async function fetchWorks() {
//   try {
//     const response = await fetch(worksUrl);
//     if (!response.ok) {
//       throw new Error(`La requête a échoué avec le statut ${response.status}`);
//     }
//     let works = await response.json();
//     for (let work of works) {
//       let project = document.createElement("figure");
//       let projectImg = document.createElement("img");
//       let projectTitle = document.createElement("figcaption");

//       projectImg.src = work.imageUrl;
//       projectTitle.textContent = work.title;

//       project.appendChild(projectImg);
//       project.appendChild(projectTitle);
//       gallery.appendChild(project);
//     }
//   } catch (error) {
//     console.error(`Erreur lors de la récupération des données: ${error}`);
//   }
// }

// fetchWorks();
