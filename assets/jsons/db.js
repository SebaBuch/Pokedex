const BASE_URL = "https://pokeapi.co/api/v2/pokemon";
const TYPE_URL = "https://pokeapi.co/api/v2/type";
const ARTWORK_URL = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork";
const FORM_ID_START = 10000;
const LOAD_LIMIT = 20;
const SEARCH_LIST_LIMIT = 2000;
const SUGGESTION_LIMIT = 8;
const CACHE_KEY = "pokemonCacheV2";

const POKEMON_TYPES = [
    "all",
    "normal",
    "fire",
    "water",
    "grass",
    "electric",
    "ice",
    "fighting",
    "poison",
    "ground",
    "flying",
    "psychic",
    "bug",
    "rock",
    "ghost",
    "dragon",
    "dark",
    "steel",
    "fairy"
];

let pokemonCache = {};