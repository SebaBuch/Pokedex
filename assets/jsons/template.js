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
 
function getDialogTemplate(pokemon, activeTab) {
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
                <div class="dialog-tabs">
                    ${getTabButtonTemplate("stats", "Stats", activeTab)}
                    ${getTabButtonTemplate("evolution", "Evolution", activeTab)}
                    ${getTabButtonTemplate("about", "About", activeTab)}
                </div>
                <div class="tab-content">
                    ${getTabContentTemplate(pokemon, activeTab)}
                </div>
            </div>
            <div class="dialog-navigation">
                <button data-id="prev-button" class="nav-button" onclick="showPreviousPokemon()"
                    aria-label="Previous Pokémon">❮</button>
                <button data-id="next-button" class="nav-button" onclick="showNextPokemon()"
                    aria-label="Next Pokémon">❯</button>
            </div>
        </div>`;
}
 
function getTabButtonTemplate(tab, label, activeTab) {
    const activeClass = tab === activeTab ? "active" : "";
    return `<button class="tab-button ${activeClass}" onclick="showDialogTab('${tab}')">${label}</button>`;
}
 
function getTabContentTemplate(pokemon, activeTab) {
    if (activeTab === "stats") return getStatsTemplate(pokemon.stats);
    if (activeTab === "about" && pokemon.species) return getAboutTemplate(pokemon);
    if (activeTab === "evolution" && pokemon.evolution) return getEvolutionTemplate(pokemon.evolution);
    return `<p class="info-box info-text">Data could not be loaded.</p>`;
}
 
function getStatsTemplate(stats) {
    return `
        <div class="info-box">
            ${getStatTemplate("HP", stats.hp)}
            ${getStatTemplate("ATT", stats.attack)}
            ${getStatTemplate("DEF", stats.defense)}
        </div>`;
}
 
function getAboutTemplate(pokemon) {
    return `
        <div class="info-box">
            ${getAboutRowTemplate("Category", pokemon.species.category)}
            ${getAboutRowTemplate("Height", `${pokemon.body.height} m`)}
            ${getAboutRowTemplate("Weight", `${pokemon.body.weight} kg`)}
            ${getAboutRowTemplate("Gender", getGenderText(pokemon.species.genderRate))}
            ${getAboutRowTemplate("Abilities", formatAbilities(pokemon.body.abilities))}
        </div>`;
}
 
function getAboutRowTemplate(label, value) {
    return `
        <div class="about-row">
            <span class="about-label">${label}</span>
            <span class="about-value">${value}</span>
        </div>`;
}
 
function getGenderText(genderRate) {
    if (genderRate === -1) return "Genderless";
    const femalePercent = (genderRate / 8) * 100;
    return `♂ ${100 - femalePercent}% / ♀ ${femalePercent}%`;
}
 
function formatAbilities(abilities) {
    return abilities.map((ability) => capitalizeWords(ability)).join(", ");
}
 
function capitalizeWords(text) {
    const words = text.split("-");
    return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}
 
function getEvolutionTemplate(stages) {
    if (stages.length <= 1) return `<p class="info-box info-text">This Pokémon does not evolve.</p>`;
    const branchedClass = stages.some((stage) => stage.length > 1) ? "branched" : "";
    let stagesHtml = "";
    stages.forEach((stage, index) => {
        if (index > 0) stagesHtml += `<span class="evolution-arrow">❯</span>`;
        stagesHtml += `<div class="evolution-stage">${stage.map((member) => getEvolutionMemberTemplate(member)).join("")}</div>`;
    });
    return `<div class="info-box evolution-chain ${branchedClass}">${stagesHtml}</div>`;
}
 
function getEvolutionMemberTemplate(member) {
    return `
        <div class="evolution-member">
            <img class="evolution-image" src="${member.image}" alt="${member.name}" loading="lazy">
            <span class="evolution-name">${member.name}</span>
        </div>`;
}