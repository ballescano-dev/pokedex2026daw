import * as pokeapi from './pokeapi/api.js';
import * as bootstrap from './node_modules/bootstrap/dist/js/bootstrap.bundle.min.js';
const img_src_base = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/';

window.addEventListener('load', async () => {
  const pokemon_list = await pokeapi.getAllPokemons();
  const input_search = document.getElementById('pokemon-search');
  if (pokemon_list.length > 1000) {
    input_search.removeAttribute('disabled');
    input_search.style.cursor = 'text';
  }
  const result_search_container = document.getElementById('result-search-container');
  const form = document.getElementsByTagName('form')[0];
  form.onreset = ($event) => {
    result_search_container.classList.add('d-none');
    result_search_container.innerHTML = '';
  };
  input_search.addEventListener('input', () => { fillResultSearchContainer(input_search, result_search_container, pokemon_list) });
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