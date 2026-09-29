let loadedNames = [];
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
    await loadPokemon();
}

async function loadPokemon() {
    if (isLoading) return;
    setLoading(true);
    try {
        await loadNextBatch();
        toggleLoadError(false);
    } catch (error) {
        console.error(error);
        toggleLoadError(true);
    }
    setLoading(false);
}

async function loadNextBatch() {
    const pokemonList = await fetchPokemonList(currentOffset);
    await fetchAllDetails(pokemonList);
    currentOffset += LOAD_LIMIT;
    saveCacheToStorage();
    updateDisplayedNames();
}

