const BASE_URL = "https://pokeapi.co/api/v2/pokemon";
const LOAD_LIMIT = 20;
const CACHE_KEY = "pokemonCache";

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