const mealsContainer = document.getElementById("mealsid");
const favContainer = document.getElementById("fav-list");
const mealPopup = document.getElementById("meal-popup");
const closePopupBtn = document.getElementById("close-popup");
const mealInfoEl = document.getElementById("meal-info");

const search = document.getElementById("search");
const searchBtn = document.getElementById("search-btn");

getRandomMeal();
fetchFavMeals();

async function getRandomMeal() {
  const resp = await fetch(
    "https://www.themealdb.com/api/json/v1/1/random.php"
  );
  const respData = await resp.json();
  const randomMeal = respData.meals[0];

  addMeal(randomMeal, true);
}

async function getMealById(id) {
  const resp = await fetch(
    "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id
  );

  const respData = await resp.json();

  const meal = respData.meals[0];

  return meal;
}

async function getMealBySearch(term) {
  const resp = await fetch(
    "https://www.themealdb.com/api/json/v1/1/search.php?s=" + term
  );

  const respData = await resp.json();

  const meals = respData.meals;

  return meals;
}

function addMeal(mealData, random = false) {
  const mealDiv = document.createElement("div");
  mealDiv.classList.add("meal");
  mealDiv.innerHTML = `  
    <div class="meal-header">
    ${
      random
        ? `<span class="meal-header-heading">Random Recipe
    </span>`
        : ""
    }
    <img src="${mealData.strMealThumb}" alt="${
    mealData.strMeal
  }" class="meal-header-img">
  </div>
  <div class="meal-body">
    <h4 class="meal-body-name">${mealData.strMeal}</h4>
    <button class="meal-body-btn">
      <i class="fas fa-bookmark"></i>
    </button>
  </div>
`;

  const saveBtn = mealDiv.querySelector(".meal-body .meal-body-btn");
  saveBtn.addEventListener("click", () => {
    if (saveBtn.classList.contains("active")) {
      removeMealLs(mealData.idMeal);
      saveBtn.classList.remove("active");
    } else {
      addMealLs(mealData.idMeal);
      saveBtn.classList.add("active");
    }

    fetchFavMeals();
  });

  mealDiv.addEventListener('click', () => {
    showMealInfo(mealData);
  })

  mealsContainer.appendChild(mealDiv);
}

function addMealLs(mealId) {
  const mealIds = getMealsLs();
  localStorage.setItem("mealIds", JSON.stringify([...mealIds, mealId]));
}

function removeMealLs(mealId) {
  const mealIds = getMealsLs();
  localStorage.setItem(
    "mealIds",
    JSON.stringify(mealIds.filter((id) => id !== mealId))
  );
}

function getMealsLs() {
  const mealIds = JSON.parse(localStorage.getItem("mealIds"));
  return mealIds === null ? [] : mealIds;
}

async function fetchFavMeals() {
  favContainer.innerHTML = ``;
  const mealIds = getMealsLs();
  for (let i = 0; i < mealIds.length; i++) {
    const mealId = mealIds[i];
    meal = await getMealById(mealId);
    addToFav(meal);
  }
}

function addToFav(mealData) {
  const favMeal = document.createElement("li");
  favMeal.classList.add("fm-list-item");
  favMeal.innerHTML = `  
    <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}" class="fm-list-item-img">
    <span class="fm-list-item-caption">${mealData.strMeal}</span>
    <button class="clear"><i class="fas fa-window-close"></i></button>
    `;

  const btn = favMeal.querySelector(".clear");
  btn.addEventListener("click", () => {
    removeMealLs(mealData.idMeal);
    fetchFavMeals();
  });

  favMeal.addEventListener('click', () => {
    showMealInfo(mealData);
  })

  favContainer.appendChild(favMeal);
}

function showMealInfo(mealData) {

  mealInfoEl.innerHTML = ``;

  const mealEl = document.createElement("div");

  const ingredients = [];

  for(let i = 1; i <= 20; i++){
    if(mealData['strIngredient'+i]){
      ingredients.push(`${mealData['strIngredient'+i]}-${mealData['strMeasure'+i]}`);
    }
    else{
      break;
    }
  }

  mealEl.innerHTML = `
    <h1>${mealData.strMeal}</h1>
    <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}"/>
    <p>${mealData.strInstructions}</p>
    <h3>Ingredients:</h3>
    <ul>
      ${ingredients
        .map(
          (ing) => `
      <li>${ing}</li>
      `
      )
      .join('')}
    </ul>
  `;

  mealInfoEl.appendChild(mealEl);

  mealPopup.classList.remove("hidden");
}

searchBtn.addEventListener("click", async () => {
  mealsContainer.innerHTML = ``;
  const find = search.value;
  const meals = await getMealBySearch(find);

  if (meals) {
    meals.forEach((meal) => {
      addMeal(meal);
    });
  }
});

closePopupBtn.addEventListener("click", () => {
  mealPopup.classList.add("hidden");
});
