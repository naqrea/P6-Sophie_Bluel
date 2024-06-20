const worksUrl = "http://localhost:5678/api/works";
let works;

async function fetchWorks() {
  try {
    const response = await fetch(worksUrl);
    if (!response.ok) {
      throw new Error(`La requête a échoué avec le statut ${response.status}`);
    }
    works = await response.json();
    console.log(works);
    // works.forEach((work) => {
    //   console.log(work);
    // });
  } catch (error) {
    console.error(`Erreur lors de la récupération des données: ${error}`);
  }
}

fetchWorks();

console.log(works);

// works.forEach((work) => {
//   console.log(work);
// });
