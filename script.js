import * as pokeapi from './pokeapi/api.js';
import * as bootstrap from './node_modules/bootstrap/dist/js/bootstrap.bundle.min.js';
const img_src_base = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/';

window.addEventListener('load', async () => {
  const pokemon_list = await pokeapi.getAllPokemons();
  fillButtonTypes();

  const input_search = document.getElementById('pokemon-search');
  input_search.removeAttribute('disabled');
  input_search.style.cursor = 'text';
  const result_search_container = document.getElementById('result-search-container');
  const form = document.getElementsByTagName('form')[0];

  form.onreset = ($event) => {
    result_search_container.classList.add('d-none');
    result_search_container.innerHTML = '';
  };
  form.onsubmit = ($event) => { searchPokemon($event) };
  input_search.addEventListener('input', () => { fillResultSearchContainer(input_search, result_search_container, pokemon_list) });
  for (const result of result_search_container.children) {
    result.addEventListener('click', () => { searchPokemon($event) });
  }
});

function fillResultSearchContainer(input, result_container, pokemon_list) {
  let cont = 0;
  input.value = input.value.trim().toLowerCase();
  result_container.innerHTML = '';
  result_container.classList.toggle('d-none');
  for (const pokemon of pokemon_list) {
    if (pokemon.name.toLowerCase().includes(input.value) || String(pokemon.id).includes(input.value)) {
      cont++;

      const result_item = document.createElement('div');
      result_item.classList.add('result-item');

      const span_pokemon_id = document.createElement('span');
      span_pokemon_id.id = 'result-pokemon-id';
      span_pokemon_id.innerHTML = `#${pokemon.id.toString().padStart(3, '0')}`;

      const span_pokemon_name = document.createElement('span');
      span_pokemon_name.id = 'result-pokemon-name';
      span_pokemon_name.innerHTML = pokemon.name.toUpperCase();

      const span_pokemon_type = document.createElement('span');
      span_pokemon_type.id = 'result-pokemon-type';
      for (let i = 0; i < pokemon.types.length; i++) {
        // if (pokemon.types[i].type.name.toLowerCase() === 'grass') pokemon.types[i].type.name = 'plant';
        // if (pokemon.types[i].type.name.toLowerCase() === 'electric') pokemon.types[i].type.name = pokemon.types[i].type.name.substring(0, 4);
        // if (pokemon.types[i].type.name.toLowerCase() === 'psychic') pokemon.types[i].type.name = pokemon.types[i].type.name.substring(0, 3);
        if (i < pokemon.types.length-1) {
          span_pokemon_type.innerHTML += `${pokemon.types[i].type.name.toUpperCase()}/`;
        } else {
          span_pokemon_type.innerHTML += pokemon.types[i].type.name.toUpperCase();
        }
      }
      
      result_item.append(span_pokemon_id, span_pokemon_name, span_pokemon_type);
      if (cont  < 10) result_container.append(result_item);
    }
  }
}

async function fillButtonTypes() {
  const types = await pokeapi.getPokemonTypes();
  const div_filters = document.getElementsByClassName('filter-controls')[0];
  const button = document.createElement('button');
  button.type = 'button';
  button.classList.add('btn', 'filter', 'active');
  button.textContent = 'ALL';
  div_filters.append(button);
  for (const type of types.results) {
    if (type.name.toLowerCase() === 'unknown') continue;
    const button = document.createElement('button');
    button.type = 'button';
    button.classList.add('btn', 'filter', `filter-${type.name}`);
    button.textContent = type.name.toUpperCase();
    div_filters.append(button);
  }
  div_filters.classList.remove('spinner-border');
}

async function searchPokemon($event) {
  $event.preventDefault();
  // TODO: BUSCAR POKEMON
  const pokemon = await pokeapi.getPokemonById();
}