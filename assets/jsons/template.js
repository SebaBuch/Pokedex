function formatId(id) {
    return String(id).padStart(3, "0");
}

function getBackgroundClasses(types) {
    const splitClass = types[1] ? `split-${types[1]}` : "";
    return `bg-${types[0]} ${splitClass}`;
}

function getTypeButtonTemplate(type) {
    const activeClass = type === activeType ? "active" : "";
    return `
        <button class="type-button bg-${type} ${activeClass}" onclick="filterByType('${type}')">
            ${type}
        </button>`;
}

function getTypeBadgesTemplate(types) {
    let badgesHtml = "";
    types.forEach((type) => {
        badgesHtml += `<span class="type-badge">${type}</span>`;
    });
    return badgesHtml;
}

function getPokemonCardTemplate(pokemon, index) {
    return `
        <button data-id="card" class="pokemon-card ${getBackgroundClasses(pokemon.types)}" onclick="openDialog(${index})">
            <span class="card-header">
                <span class="card-name">${pokemon.name.toUpperCase()}</span>
                <span class="pokemon-id">#${formatId(pokemon.id)}</span>
            </span>
            <span class="card-body">
                <span class="type-list">${getTypeBadgesTemplate(pokemon.types)}</span>
                <img data-id="card-image" class="card-image" src="${pokemon.image}"
                    alt="${pokemon.name}" loading="lazy">
            </span>
        </button>`;
}

function getSuggestionTemplate(name) {
    return `
        <li>
            <button class="suggestion-button" onclick="selectSuggestion('${name}')">${name}</button>
        </li>`;
}

function getNotFoundTemplate() {
    return `<p data-id="not-found" class="not-found">No match found.</p>`;
}

function getStatTemplate(label, value) {
    const barWidth = Math.min((value / 150) * 100, 100);
    return `
        <div class="stat-row">
            <span class="stat-label">${label}</span>
            <span class="stat-value">${value}</span>
            <div class="stat-bar">
                <div class="stat-bar-fill" style="width: ${barWidth}%"></div>
            </div>
        </div>`;
}

function getDialogTemplate(pokemon) {
    return `
        <div data-id="overlay-pokemon-name" class="dialog-wrapper">
            <div class="dialog-card ${getBackgroundClasses(pokemon.types)}">
                <div class="dialog-header">
                    <span class="pokemon-id">#${formatId(pokemon.id)}</span>
                    <button data-id="close-dialog-button" class="close-button" onclick="closeDialog()"
                        aria-label="Close">✕</button>
                </div>
                <h2 class="dialog-name">${pokemon.name.toUpperCase()}</h2>
                <div class="type-list type-list-row">${getTypeBadgesTemplate(pokemon.types)}</div>
                <img data-id="dialog-image" class="dialog-image" src="${pokemon.image}" alt="${pokemon.name}">
                <div class="stats">
                    ${getStatTemplate("HP", pokemon.hp)}
                    ${getStatTemplate("ATT", pokemon.attack)}
                    ${getStatTemplate("DEF", pokemon.defense)}
                </div>
            </div>
            <div class="dialog-navigation">
                <button data-id="prev-button" class="nav-button" onclick="showPreviousPokemon()"
                    aria-label="Previous Pokémon">></button>
                <button data-id="next-button" class="nav-button" onclick="showNextPokemon()"
                    aria-label="Next Pokémon">></button>
            </div>
        </div>`;
}