import * as pokeapi from './pokeapi/api.js';
import * as bootstrap from './node_modules/bootstrap/dist/js/bootstrap.bundle.min.js';
const img_src_base = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/';

window.addEventListener('load', async () => {
  fillButtonTypes();
  fillNumberKeyboard();
  const pokemon_list = await pokeapi.getAllPokemons();
  fillPokemonGrid(pokemon_list);
  showCurrentPokemon(1);

  // FORM + INPUT_SEARCH
  const input_search = document.getElementById('pokemon-search');
  input_search.removeAttribute('disabled');
  input_search.style.cursor = 'text';
  const result_search_container = document.getElementById('result-search-container');
  const form = document.getElementsByTagName('form')[0];
  
  form.onreset = ($event) => {
    result_search_container.classList.add('d-none');
    result_search_container.innerHTML = '';
  };
  form.onsubmit = async ($event) => {
    $event.preventDefault();
    input_search.value = '';
    const pokemon = await pokeapi.getPokemonById(input_search.value);
    showCurrentPokemon(pokemon);
  };
  input_search.addEventListener('input', () => { fillResultSearchContainer(input_search, result_search_container, pokemon_list) });
  for (const result of result_search_container.children) {
    result.addEventListener('click', () => { showCurrentPokemon($event) });
  }
  
  // NUMBER KEYBOARD
  const numbers_btn_container = document.getElementById('number-keyboard');
  const clean_btn = document.getElementsByClassName('rounded-letter')[0];
  const send_btn = document.getElementsByClassName('rounded-letter')[1];
  for (const btn of numbers_btn_container.children) {
    btn.onclick = () => {
      input_search.value += btn.textContent;
    };
  }
  clean_btn.onclick = () => {
    input_search.value = '';
  };
  send_btn.onclick = async () => {
    input_search.value = '';
    const pokemon = await pokeapi.getPokemonById(input_search.value);
    showCurrentPokemon(pokemon);
  };
});

function fillResultSearchContainer(input, result_container, pokemon_list) {
  input.value = input.value.trim().toLowerCase();
  result_container.innerHTML = '';
  result_container.classList.toggle('d-none');
  for (const pokemon of pokemon_list) {
    if (pokemon.name.toLowerCase().includes(input.value) || String(pokemon.id).includes(input.value)) {
      const result_item = document.createElement('div');
      result_item.classList.add('result-item');
      result_item.setAttribute('tabindex', '0');

      const span_pokemon_id = document.createElement('span');
      span_pokemon_id.id = 'result-pokemon-id';
      span_pokemon_id.innerHTML = formatPokemonId(pokemon.id);

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
      result_container.append(result_item);
    }
  }
}

function formatPokemonId(pokemon_id) {
  return `#${pokemon_id.toString().padStart(3, '0')}`;
}

function fillNumberKeyboard() {
  const container = document.getElementById('number-keyboard');
  for (let i = 0; i <= 9; i++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.classList.add('btn', 'btn-number');
    btn.textContent = i+1 <= 9 ? i+1 : 0;
    container.append(btn);
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
}

async function showCurrentPokemon(pokemon=null) {
  const pokemon_row = document.getElementById('catalog-grid').children;
  const pokemon_display = document.getElementsByClassName('current-pokemon-pattern')[0];
  
  let current_pokemon_name;
  if (pokemon !== null) {
    current_pokemon_name = pokemon.name;
    // await fillPokemonDisplay(pokemon_display, current_pokemon_name);
    return;
  }

  // for (const div of pokemon_row) {
  //   div.onclick = async () => {
  //     if (pokemon === null) current_pokemon_name = div.children[2].innerHTML;
  //     pokemon_display.innerHTML = '<div class="spinner-border"></div>';
  //     await fillPokemonDisplay(pokemon_display, current_pokemon_name);
  //   }
  // }
}

function fillPokemonGrid(pokemon_list) {
  const grid = document.getElementById('catalog-grid');
  const total_pokemon_number = document.getElementById('total-pokemon-number');
  total_pokemon_number.innerHTML = pokemon_list.length;
  for (const pokemon of pokemon_list) {
    const div = document.createElement('div');
    div.classList.add('col', 'pokemon-list-item');
    div.setAttribute('tabindex', '0');

    const img = document.createElement('img');
    img.src = `${img_src_base}${pokemon.id}.png`;
    img.alt = `${pokemon.name.substring(0,1).toUpperCase()}${pokemon.name.substring(1)} image`;
    img.classList.add('img-fluid');

    const pokemon_id_span = document.createElement('span');
    pokemon_id_span.classList.add('grid-pokemon-id');
    pokemon_id_span.textContent = formatPokemonId(pokemon.id);

    const pokemon_name_span = document.createElement('span');
    pokemon_name_span.classList.add('grid-pokemon-name');
    pokemon_name_span.textContent = pokemon.name.toUpperCase();

    const pokemon_types_div = document.createElement('div');
    pokemon_types_div.classList.add('pokemon-types');
    const pokemon_type_span = document.createElement('span');
    pokemon_type_span.classList.add('grid-pokemon-type');
    pokemon_type_span.textContent = pokemon.types[0].type.name.toUpperCase();
    pokemon_types_div.append(pokemon_type_span);
    if (pokemon.types.length > 1) {
      const pokemon_types_added_span = document.createElement('span');
      pokemon_types_added_span.classList.add('grid-pokemon-type');
      pokemon_types_added_span.textContent = `+${pokemon.types.length-1}`;
      pokemon_types_div.append(pokemon_types_added_span);
    }

    div.append(img);
    div.append(pokemon_id_span);
    div.append(pokemon_name_span);
    div.append(pokemon_types_div);
    grid.append(div);
  }
}

function fillStatusBar() {}