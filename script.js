let loadedNames = [];
let typeLoadedNames = {};
let typeEntries = {};
let entriesRequest = null;
let searchResultNames = [];
let searchMatches = [];
let dialogEntries = [];
let displayedNames = [];
let currentOffset = 0;
let currentDialogIndex = 0;
let activeType = "all";
let activeSearch = "";
let isLoading = false;
let savedScrollPosition = 0;

async function init() {
    loadCacheFromStorage();
    renderTypeButtons();
    addDialogListeners();
    document.addEventListener("click", handleOutsideClick);
    await loadPokemon();
}

function loadCacheFromStorage() {
    try {
        const storedCache = sessionStorage.getItem(CACHE_KEY);
        if (storedCache) pokemonCache = JSON.parse(storedCache);
    } catch (error) {
        pokemonCache = {};
    }
}

function saveCacheToStorage() {
    try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(pokemonCache));
    } catch (error) {
        console.warn("Cache could not be saved", error);
    }
}

async function loadPokemon() {
    await runWithLoading(loadNextBatch);
}

async function runWithLoading(task) {
    if (isLoading) return;
    setLoading(true);
    try {
        await task();
        toggleLoadError(false);
    } catch (error) {
        console.error(error);
        toggleLoadError(true);
    }
    setLoading(false);
}

function setLoading(state) {
    isLoading = state;
    document.getElementById("loadMoreButton").disabled = state;
    document.getElementById("loadingScreen").classList.toggle("d-none", !state);
}

function toggleLoadError(show) {
    const errorMessage = document.getElementById("errorMessage");
    errorMessage.textContent = show ? "Pokémon could not be loaded. Check your connection and try again." : "";
    errorMessage.classList.toggle("d-none", !show);
}

async function loadNextBatch() {
    if (activeType === "all") {
        await loadNextAllBatch();
    } else {
        await loadNextTypeBatch(activeType);
    }
    saveCacheToStorage();
    updateDisplayedNames();
}

async function loadNextAllBatch() {
    const pokemonList = await fetchPokemonList(currentOffset);
    const names = await fetchAllDetails(pokemonList);
    loadedNames = loadedNames.concat(names);
    currentOffset += LOAD_LIMIT;
}

async function loadNextTypeBatch(type) {
    const entries = await fetchTypeEntries(type);
    const loadedCount = getTypeLoadedNames(type).length;
    const nextEntries = entries.slice(loadedCount, loadedCount + LOAD_LIMIT);
    const names = await fetchAllDetails(nextEntries);
    typeLoadedNames[type] = getTypeLoadedNames(type).concat(names);
}

function getTypeLoadedNames(type) {
    return typeLoadedNames[type] || [];
}

async function fetchPokemonList(offset) {
    const url = `${BASE_URL}?limit=${LOAD_LIMIT}&offset=${offset}`;
    const response = await fetch(url, { method: "GET" });
    if (!response.ok) throw new Error(`List request failed: ${response.status}`);
    const data = await response.json();
    return data.results;
}

async function fetchTypeEntries(type) {
    if (typeEntries[type]) return typeEntries[type];
    const response = await fetch(`${TYPE_URL}/${type}`, { method: "GET" });
    if (!response.ok) throw new Error(`Type request failed: ${type}`);
    const data = await response.json();
    typeEntries[type] = data.pokemon.map((entry) => entry.pokemon).filter(isBasePokemon);
    return typeEntries[type];
}

async function fetchAllPokemonEntries() {
    if (!entriesRequest) entriesRequest = requestAllPokemonEntries();
    return await entriesRequest;
}

async function requestAllPokemonEntries() {
    try {
        const url = `${BASE_URL}?limit=${SEARCH_LIST_LIMIT}`;
        const response = await fetch(url, { method: "GET" });
        if (!response.ok) throw new Error(`Search list request failed: ${response.status}`);
        const data = await response.json();
        return data.results.filter(isBasePokemon);
    } catch (error) {
        entriesRequest = null;
        throw error;
    }
}

function isBasePokemon(entry) {
    const id = Number(entry.url.split("/").filter(Boolean).pop());
    return id < FORM_ID_START;
}

async function fetchAllDetails(pokemonList) {
    const requests = pokemonList.map((entry) => fetchPokemonDetails(entry.name, entry.url));
    const results = await Promise.all(requests);
    return results.map((pokemon) => pokemon.name);
}

async function fetchPokemonDetails(name, url) {
    if (pokemonCache[name]) return pokemonCache[name];
    const response = await fetch(url, { method: "GET" });
    if (!response.ok) throw new Error(`Detail request failed: ${name}`);
    const data = await response.json();
    pokemonCache[name] = reducePokemonData(data);
    return pokemonCache[name];
}

function reducePokemonData(data) {
    return {
        id: data.id,
        name: data.name,
        types: data.types.map((entry) => entry.type.name),
        image: getPokemonImage(data.sprites),
        hp: getStatValue(data.stats, "hp"),
        attack: getStatValue(data.stats, "attack"),
        defense: getStatValue(data.stats, "defense")
    };
}

function getPokemonImage(sprites) {
    return sprites.other["official-artwork"].front_default || sprites.front_default;
}

function getStatValue(stats, statName) {
    const stat = stats.find((entry) => entry.stat.name === statName);
    return stat ? stat.base_stat : 0;
}

function renderTypeButtons() {
    let buttonsHtml = "";
    POKEMON_TYPES.forEach((type) => {
        buttonsHtml += getTypeButtonTemplate(type);
    });
    document.getElementById("typeButtons").innerHTML = buttonsHtml;
}

async function filterByType(type) {
    if (isLoading) return;
    activeType = type;
    renderTypeButtons();
    if (activeSearch === "" && type !== "all" && getTypeLoadedNames(type).length === 0) {
        await loadPokemon();
    }
    updateDisplayedNames();
}

function updateDisplayedNames() {
    displayedNames = getSourceNames().filter(matchesActiveType);
    renderPokemonCards();
    updateLoadMoreButton();
}

function getSourceNames() {
    if (activeSearch !== "") return searchResultNames;
    return activeType === "all" ? loadedNames : getTypeLoadedNames(activeType);
}

function matchesActiveType(name) {
    return activeType === "all" || pokemonCache[name].types.includes(activeType);
}

function renderPokemonCards() {
    const cardContainer = document.getElementById("cardContainer");
    if (displayedNames.length === 0) {
        cardContainer.innerHTML = getNotFoundTemplate();
        return;
    }
    let cardsHtml = "";
    displayedNames.forEach((name, index) => {
        cardsHtml += getPokemonCardTemplate(pokemonCache[name], index);
    });
    cardContainer.innerHTML = cardsHtml;
}

function updateLoadMoreButton() {
    const hasMore = activeSearch === "" && (activeType === "all" || hasMoreOfType(activeType));
    document.getElementById("loadMoreButton").classList.toggle("d-none", !hasMore);
}

function hasMoreOfType(type) {
    const entries = typeEntries[type] || [];
    return getTypeLoadedNames(type).length < entries.length;
}

function getSearchValue() {
    return document.getElementById("searchInput").value.trim().toLowerCase();
}

function checkSearchInput() {
    const searchValue = getSearchValue();
    document.getElementById("searchButton").disabled = searchValue.length < 3;
    if (searchValue.length === 0 && activeSearch !== "") {
        activeSearch = "";
        searchResultNames = [];
        searchMatches = [];
        updateDisplayedNames();
    }
    updateSuggestions();
}

function handleSearchKey(event) {
    if (event.key === "Enter") searchPokemon();
    if (event.key === "Escape") hideSuggestions();
}

async function searchPokemon() {
    const searchValue = getSearchValue();
    if (searchValue.length < 3 || isLoading) return;
    hideSuggestions();
    activeSearch = searchValue;
    searchResultNames = [];
    searchMatches = [];
    await runWithLoading(loadSearchResults);
    updateDisplayedNames();
}

async function loadSearchResults() {
    const entries = await fetchAllPokemonEntries();
    searchMatches = entries.filter((entry) => entry.name.includes(activeSearch));
    searchResultNames = await fetchAllDetails(searchMatches.slice(0, LOAD_LIMIT));
    saveCacheToStorage();
}

async function updateSuggestions() {
    if (getSearchValue().length < 3) {
        hideSuggestions();
        return;
    }
    try {
        const entries = await fetchAllPokemonEntries();
        renderSuggestions(entries);
    } catch (error) {
        hideSuggestions();
    }
}

function getSuggestionNames(entries) {
    const searchValue = getSearchValue();
    const matches = entries.filter((entry) => entry.name.includes(searchValue));
    return matches.slice(0, SUGGESTION_LIMIT).map((entry) => entry.name);
}

function renderSuggestions(entries) {
    const names = getSuggestionNames(entries);
    if (getSearchValue().length < 3 || names.length === 0) {
        hideSuggestions();
        return;
    }
    const suggestionList = document.getElementById("suggestionList");
    suggestionList.innerHTML = names.map((name) => getSuggestionTemplate(name)).join("");
    suggestionList.classList.remove("d-none");
}

function hideSuggestions() {
    const suggestionList = document.getElementById("suggestionList");
    suggestionList.innerHTML = "";
    suggestionList.classList.add("d-none");
}

function selectSuggestion(name) {
    document.getElementById("searchInput").value = name;
    hideSuggestions();
    searchPokemon();
}

function handleOutsideClick(event) {
    if (!event.target.closest(".search-bar")) hideSuggestions();
}

function addDialogListeners() {
    const dialog = document.getElementById("pokemonDialog");
    dialog.addEventListener("click", (event) => {
        if (event.target === dialog) closeDialog();
    });
    dialog.addEventListener("close", unlockScroll);
}

async function openDialog(index) {
    const name = displayedNames[index];
    dialogEntries = [];
    await runWithLoading(loadDialogEntries);
    if (dialogEntries.length === 0) dialogEntries = getDisplayedEntries();
    currentDialogIndex = dialogEntries.findIndex((entry) => entry.name === name);
    renderDialogContent();
    lockScroll();
    document.getElementById("pokemonDialog").showModal();
}

async function loadDialogEntries() {
    dialogEntries = await getNavigationEntries();
}

async function getNavigationEntries() {
    if (activeSearch !== "") return searchMatches;
    if (activeType !== "all") return typeEntries[activeType];
    return await fetchAllPokemonEntries();
}

function getDisplayedEntries() {
    return displayedNames.map((name) => ({ name: name, url: "" }));
}

function renderDialogContent() {
    const pokemon = pokemonCache[dialogEntries[currentDialogIndex].name];
    document.getElementById("pokemonDialog").innerHTML = getDialogTemplate(pokemon);
}

function closeDialog() {
    document.getElementById("pokemonDialog").close();
}

async function showNextPokemon() {
    const nextIndex = (currentDialogIndex + 1) % dialogEntries.length;
    await showDialogPokemon(nextIndex);
}

async function showPreviousPokemon() {
    const previousIndex = (currentDialogIndex - 1 + dialogEntries.length) % dialogEntries.length;
    await showDialogPokemon(previousIndex);
}

async function showDialogPokemon(index) {
    if (isLoading) return;
    const entry = dialogEntries[index];
    setDialogLoading(true);
    try {
        await fetchPokemonDetails(entry.name, entry.url);
        currentDialogIndex = index;
        saveCacheToStorage();
    } catch (error) {
        console.error(error);
    }
    setDialogLoading(false);
    renderDialogContent();
}

function setDialogLoading(state) {
    isLoading = state;
    document.querySelectorAll(".nav-button").forEach((button) => (button.disabled = state));
    document.getElementById("pokemonDialog").classList.toggle("dialog-loading", state);
}

function lockScroll() {
    savedScrollPosition = window.scrollY;
    document.body.style.top = `-${savedScrollPosition}px`;
    document.body.classList.add("scroll-locked");
}

function unlockScroll() {
    document.body.classList.remove("scroll-locked");
    document.body.style.top = "";
    window.scrollTo(0, savedScrollPosition);
}

