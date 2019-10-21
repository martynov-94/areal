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



CocktailBase.add("Пиранья", "60%", "piranha.jpg", "водка", "ликер", "Кока-Кола");
CocktailBase.add("Светящийся", "30%", "luminous.jpg", "водка", "тоник", "лед");
CocktailBase.add("Оазис", "45%", "oasis.jpg", "джин", "ликер Блю Кюрасо", "тоник");
CocktailBase.add("Красный грех", "18%", "red-sin.jpg", "ликер", "сок апельсиновый", "шампанское красное", "лед", "сахар");
CocktailBase.add("С апельсиновым соком", "32%", "orange-juice.jpg", "мартини", "водка", "сок апельсиновый", "лед");
CocktailBase.add("Мохито", "8%", "mojito.jpg", "мята свежая", "сахар коричневый", "ром Bacardi Carta Blanca", "Спрайт", "лайм", "лед");
CocktailBase.add("Дайкири", "20%", "daiquiri.jpg", "ром", "лайм", "лимон", "сироп сахарный");
CocktailBase.add("Пина колада", "25%", "pina-colada.jpg", "лед", "сок ананасовый", "ром", "сливки", "молоко кокосовое", "ананас");
CocktailBase.add("Любовь на пляже", "35%", "love-beach.jpg", "водка", "шнапс персиковый", "сок клюквенный", "сок ананасовый");
CocktailBase.add("Б-52", "80%", "b52.jpg", "ликер кофейный", "ликер Бейлис", "ликер");
CocktailBase.add("Гавайский", "70", "hawaii.jpg", "лед", "сок ананасовый", "ликер Блю Кюрасо", "ром", "молоко кокосовое");
CocktailBase.add("Морской Бриз", "40%", "sea-breeze.jpg", "водка", "сок грейпфрутовый", "сок клюквенный");
CocktailBase.add("Араго", "50%", "arago.jpg", "коньяк", "ликер", "сливки");
CocktailBase.add("Клубничный", 34, "strawberry.jpg", "клубника", "водка", "сахар", "лайм");
CocktailBase.add("Удар Кнутом", "92%", "whip.jpg", "коньяк", "вермут сухой", "вермут сладкий", "ликер апельсиновый", "Абсент");
CocktailBase.add("Бакарди", "15%", "bacardi.jpg", "ром Bacardi Carta Blanca", "лайм", "сироп");
CocktailBase.add("Голубая Акула", "70%", "blue-shark.jpg", "водка", "текила", "ликер Блю Кюрасо");
CocktailBase.add("Отвертка", "40%", "screwdriver.jpg", "водка", "сок апельсиновый");
CocktailBase.add("Куба Либре", "50%", "cuba-libre.jpg", "лайм", "ром Bacardi Carta Blanca", "Кока-Кола");
CocktailBase.add("Лимончелло", "35%", "limonchello.jpg", "водка", "лимон", "вода", "сахар");
CocktailBase.add("Шипучий Джин", "20%", "gin-fizz.jpg", "джин", "лимон", "сахар", "содовая");
CocktailBase.add("Черный Русский", "60%", "black-russian.jpg", "водка", "ликер кофейный", "ликер");