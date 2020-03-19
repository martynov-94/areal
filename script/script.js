let CocktailBase = {
  _cocktails: [],

  add(name, alcohol, imgPath, ...ingredients) {
    if (ingredients.length == 0 || !imgPath.endsWith(".jpg") || !/^[0-9]{1,2}%?$/i.test(alcohol)) return;
    this._cocktails.push( { name, alcohol: parseInt(alcohol), imgPath, ingredients: ingredients } );
  },

  getCocktails() {
    return this._cocktails.slice();
  },

  findBySearchQuery(searchQuery) {
    searchQuery = searchQuery.toLowerCase();
    let found = this.getCocktails().filter(el => el.name.toLowerCase().includes(searchQuery) || 
                                                 el.ingredients.join(" ").toLowerCase().split(" ").includes(searchQuery));
    return found;
  },

  select() {
    let selectedList = this.getCocktails();
    selectedList.sort((a, b) => a[controls.sortingField] > b[controls.sortingField] ? controls.sortingDirection : -controls.sortingDirection);
    selectedList = selectedList.filter(el => el.alcohol > controls.alcoholPercentage);
    if (controls.ingredient) selectedList = selectedList.filter(el => el.ingredients.includes(controls.ingredient));
    selectedList = selectedList.filter(el => el.name.toLowerCase().includes(controls.searchQuery) || 
                                             el.ingredients.join(" ").toLowerCase().split(" ").includes(controls.searchQuery));
    return selectedList;
  }
};

let controls = {
  _sortingField: "name",
  _sortingDirection: 1,
  _alcoholPercentage: 0,
  _ingredient: "",
  _searchQuery: "",

  get sortingField() {
    return this._sortingField;
  },

  set sortingField(val) {
    this._sortingField = val;
    sessionStorage.setItem("sortingField", val);
  },

  get sortingDirection() {
    return this._sortingDirection;
  },

  set sortingDirection(val) {
    this._sortingDirection = val;
    sessionStorage.setItem("sortingDirection", val);
  },

  get alcoholPercentage() {
    return this._alcoholPercentage;
  },

  set alcoholPercentage(val) {
    this._alcoholPercentage = val;
    sessionStorage.setItem("alcoholPercentage", val);
  },

  get ingredient() {
    return this._ingredient;
  },

  set ingredient(val) {
    this._ingredient = val;
    sessionStorage.setItem("ingredient", val);
  },

  get searchQuery() {
    return this._searchQuery;
  },

  set searchQuery(val) {
    this._searchQuery = val;
    // sessionStorage.setItem("searchQuery", val);
  },

  init(savedSortingField, savedSortingDirection, savedAlcoholPercentage, savedIngredient) {
    this.sortingField = savedSortingField || "name";
    this.sortingDirection = savedSortingDirection || 1;
    this.alcoholPercentage = savedAlcoholPercentage || 0;
    this.ingredient = savedIngredient || "";
  },

  clear() {
    this.sortingField = "name",
    this.sortingDirection = 1;
    this.alcoholPercentage = 0;
    this.ingredient = "";
    this.searchQuery = "";
  }
};

let paginationController = {
  _currentPage: 1,
  _currentPageAfterLoading: 1,

  get currentPage() {
    return this._currentPage;
  },

  set currentPage(val) {
    if (val < 0) return;
    this._currentPage = val;
  },

  get currentPageAfterLoading() {
    return this._currentPageAfterLoading;
  },

  set currentPageAfterLoading(val) {
    if (val < this.currentPage) return;
    this._currentPageAfterLoading = val;
  }
};


$(document).ready(function() {
  controls.init(sessionStorage.getItem("sortingField"), sessionStorage.getItem("sortingDirection"), 
                sessionStorage.getItem("alcoholPercentage"), sessionStorage.getItem("ingredient"));

  $(".sorting-panel__sorting-field-selection").val(controls.sortingField || "name");
  $(".filtering-panel__alcohol-filter-selection").val(+sessionStorage.getItem("alcoholPercentage") || 10);
  if (controls.ingredient) { 
    $(".filtering-panel__chosen-ingredient").css({ display: "inline-block" });
    $(".filtering-panel__chosen-ingredient").append(`<span>${controls.ingredient}</span>`);
  }
 
  showCocktails(CocktailBase.select());
});



$(".sorting-panel__sorting-field-selection").change(function() {
  controls.sortingField = $(".sorting-panel__sorting-field-selection").val();
  showCocktails(CocktailBase.select());
});

$(".sorting-panel__sorting-up-arrow").click(function() {
  controls.sortingDirection = -1;
  showCocktails(CocktailBase.select());
});

$(".sorting-panel__sorting-down-arrow").click(function() {
  controls.sortingDirection = 1;
  showCocktails(CocktailBase.select());
});



$(".filtering-panel__alcohol-filter-selection").change(function() {
  controls.alcoholPercentage = $(".filtering-panel__alcohol-filter-selection").val();
  showCocktails(CocktailBase.select());
});

$(".filtering-panel__clear-button").click(function() {
  controls.alcoholPercentage = 0;
  controls.ingredient = "";
  
  $(".filtering-panel__chosen-ingredient").empty();
  $(".filtering-panel__chosen-ingredient").css({ display: "none" });
  $(".filtering-panel__alcohol-filter-selection").val("10");

  showCocktails(CocktailBase.select());
});



$(".search-panel__search-button").click(function() {
  controls.searchQuery = $(".search-panel__search-field").val();
  showCocktails(CocktailBase.select());
});

$(".search-panel__search-field").keypress(function(e) {
  if (e.which == 13) {
    $(".search-panel__search-button").click();
  }
});

$(".search-panel__clear-search-button").click(function() {
  controls.searchQuery = "";
  $(".search-panel__search-field").val("");
  showCocktails(CocktailBase.select());
});



$("body").on("click", ".cocktails-list__show-all-message", function() {
  controls.clear();
  controls.init();

  $(".search-panel__search-field").val("");
  $(".filtering-panel__alcohol-filter-selection").val("10");
  $(".sorting-panel__sorting-field-selection").val("name");
  $(".filtering-panel__chosen-ingredient").empty();
  $(".filtering-panel__chosen-ingredient").css({ display: "none" });

  showCocktails(CocktailBase.select());
});



$("body").on("click", ".cocktail-item__ingredients-item", function() {
  let ingredient = $(this).text();
  controls.ingredient = ingredient;

  $(".filtering-panel__chosen-ingredient").css({ display: "inline-block" });
  $(".filtering-panel__clear-button").css({ display: "inline-block" });
  $(".filtering-panel__chosen-ingredient").empty();
  $(".filtering-panel__chosen-ingredient").append(`<span>${ingredient}</span>`);

  showCocktails(CocktailBase.select());
});



$("body").on("click", ".pagination__item", function() {
  let page = +$(this).text();
  paginationController.currentPage = page;
  paginationController.currentPageAfterLoading = paginationController.currentPage;

  $(".pagination__item").removeClass("pagination__item_current");
  $(this).addClass("pagination__item_current");

  let firstToShow = (page - 1) * 6;

  $(".cocktail-item").css({ display: "none" });
  $(`.cocktail-item:eq(${firstToShow})`).show();
  $(`.cocktail-item:gt(${firstToShow}):lt(5)`).show();

  showMore();
});



function showCocktails(cocktailsList) {
  $(".cocktails-list").empty();
  paginationController.currentPage = 1;
  paginationController.currentPageAfterLoading = 1;

  if (cocktailsList.length == 0) {
    $(".cocktails-list").addClass("cocktails-list_empty");
    $(".cocktails-list").append(`<span class="cocktails-list__empty-message info-message">Ничего не найдено</span>
                                 <span class="cocktails-list__show-all-message info-message">Показать все</span>`);
    $(".pagination").empty();
    $(".cocktails-container__load-more-button-label").css({ display: "none" });

    return;
  }

  $(".cocktails-list").removeClass("cocktails-list_empty");

  for (let cocktail of cocktailsList) {
    let ingredients = "<ul class='cocktail-item__ingredients-list'>";
    
    for (let ingr of cocktail.ingredients) {
      ingredients += `<li class="cocktail-item__ingredients-item">${ingr}</li>`;
    }

    ingredients += "</ul>";

    $(".cocktails-list").append(`<div class="cocktails-list__cocktail-item cocktail-item">
        <img class="cocktail-item__img" src="img/${cocktail.imgPath}" alt=${cocktail.name} title=${cocktail.name} width="200" height="220">
        <span class="cocktail-item__name">${cocktail.name}</span>
        <span class="cocktail-item__alcohol-percentage">${cocktail.alcohol}%</span>
        <div class="cocktail-item__ingredients-section">${ingredients}</div>
      </div>`);
  }

  showMore();
  showPages();
}

function showPages() {
  $(".pagination").empty();

  let pagesNum = Math.ceil($(".cocktail-item").length / 6);
  let items = "";
  
  items += `<li class="pagination__item pagination__item_current">1</li>`;
  for (let i = 2; i <= pagesNum; i++) {
    items += `<li class="pagination__item">${i}</li>`;
  }

  $(".pagination").append(`<ul class="pagination__list">${items}</ul>`);
}

function showMore() {
  $(".cocktails-container__load-more-button-label").unbind();

  let cocktailDivsNum = $(".cocktail-item").length;
  let divsToLoad = 6;

  if (cocktailDivsNum <= ( (paginationController.currentPage - 1) * 6) + divsToLoad ) {
    $(".cocktails-container__load-more-button-label").css({ display: "none" });
    return;
  }

  $(".cocktail-item").css({ display: "none" });

  $(`.cocktail-item:eq(${ (paginationController.currentPage - 1) * 6 })`).show();
  $(`.cocktail-item:gt(${ (paginationController.currentPage - 1) * 6 }):lt(${divsToLoad - 1})`).show();
  $(".cocktails-container__load-more-button-label").css({ display: "inline-block" });

  $(".cocktails-container__load-more-button-label").click(function () {
    if ( ((paginationController.currentPage - 1) * 6) + divsToLoad + 6 <= cocktailDivsNum ) {
      divsToLoad += 6;
    } else {
      divsToLoad = cocktailDivsNum;
      $(".cocktails-container__load-more-button-label").css({ display: "none" });
    }

    paginationController.currentPageAfterLoading++;

    $(`.cocktail-item:eq(${( paginationController.currentPage - 1) * 6 })`).show();
    $(`.cocktail-item:gt(${( paginationController.currentPage - 1) * 6 }):lt(${divsToLoad - 1})`).show();
    $(`.pagination__item:eq(${paginationController.currentPageAfterLoading - 1})`).addClass("pagination__item_current");
  });
}



CocktailBase.add("Piranha", "60%", "piranha.jpg", "vodka", "liqueur", "Coca-Cola");
CocktailBase.add("Luminous", "30%", "luminous.jpg", "vodka", "tonic water", "ice");
CocktailBase.add("Oasis", "45%", "oasis.jpg", "gin", "Blue Curacao liqueur", "tonic water");
CocktailBase.add("Red Sin", "18%", "red-sin.jpg", "liqueur", "orange juice", "red champagne", "ice", "sugar");
CocktailBase.add("With Orange Juice", "32%", "orange-juice.jpg", "martini", "vodka", "orange juice", "ice");
CocktailBase.add("Mojito", "8%", "mojito.jpg", "fresh mint", "brown sugar", "Bacardi Carta Blanca rum", "Sprite", "lime", "ice");
CocktailBase.add("Daiquiri", "20%", "daiquiri.jpg", "rum", "lime", "lemon", "sugar syrup");
CocktailBase.add("Pina Colada", "25%", "pina-colada.jpg", "ice", "pineapple juice", "rum", "cream", "coconut milk", "pineapple");
CocktailBase.add("Love on the Beach", "35%", "love-beach.jpg", "vodka", "peach schnapps", "cranberry juice", "pineapple juice");
CocktailBase.add("B-52", "80%", "b52.jpg", "coffee liqueur", "Baileys liqueur", "liqueur");
CocktailBase.add("Hawaii", "70", "hawaii.jpg", "ice", "pineapple juice", "Blue Curacao liqueur", "rum", "coconut milk");
CocktailBase.add("Sea Breeze", "40%", "sea-breeze.jpg", "vodka", "grapefruit juice", "cranberry juice");
CocktailBase.add("Arago", "50%", "arago.jpg", "cognac", "liqueur", "cream");
CocktailBase.add("Strawberry", 34, "strawberry.jpg", "strawberry", "vodka", "sugar", "lime");
CocktailBase.add("Whip", "92%", "whip.jpg", "cognac", "dry vermouth", "sweet vermouth", "orange liqueur", "absinthe");
CocktailBase.add("Bacardi", "15%", "bacardi.jpg", "Bacardi Carta Blanca rum", "lime", "syrup");
CocktailBase.add("Blue Shark", "70%", "blue-shark.jpg", "vodka", "tequila", "Blue Curacao liqueur");
CocktailBase.add("Screwdriver", "40%", "screwdriver.jpg", "vodka", "orange juice");
CocktailBase.add("Cuba Libre", "50%", "cuba-libre.jpg", "lime", "Bacardi Carta Blanca rum", "Coca-Cola");
CocktailBase.add("Limonchello", "35%", "limonchello.jpg", "vodka", "lemon", "water", "sugar");
CocktailBase.add("Gin Fizz", "20%", "gin-fizz.jpg", "gin", "lemon", "sugar", "soda");
CocktailBase.add("Black Russian", "60%", "black-russian.jpg", "vodka", "coffee liqueur", "liqueur");