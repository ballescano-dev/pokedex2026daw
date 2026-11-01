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

async function showCurrentPokemon(pokemon_id=null) {
  const pokemon_rows = document.getElementsByClassName('pokemon-list-item');
  let current_pokemon = await pokeapi.getPokemonById(pokemon_id);

  if (pokemon_id !== null) {
    fillPokemonDisplay(current_pokemon);
    return;
  }

  for (const div of pokemon_rows) {
    div.onclick = () => {
      fillPokemonDisplay(current_pokemon);
    }
  }
}

function fillPokemonDisplay(pokemon) {
  // ID
  const pokemon_ids = document.getElementsByClassName('current-pokemon-id');
  for (const id of pokemon_ids) {
    id.innerHTML = formatPokemonId(pokemon.id);
  }

  // NAME
  const pokemon_names = document.getElementsByClassName('current-pokemon-name');
  for (const name of pokemon_names) {
    name.innerHTML = pokemon.name.toUpperCase();
  }

  // IMAGE
  const pokemon_img = document.getElementsByClassName('current-pokemon-pattern')[0].getElementsByTagName('img')[0];
  pokemon_img.src = `${img_src_base}${pokemon.id}.png`;
  pokemon_img.alt = `${pokemon.name.substring(0,1).toUpperCase()}${pokemon.name.substring(1)} image`;

  // TYPE(S)
  const badges_container = document.getElementById('badge-type-container');
  for (const type of pokemon.types) {
    const badge_type = document.createElement('span');
    if (type.type.name === 'grass' | type.type.name === 'fire' | type.type.name === 'water' | type.type.name === 'electric' | type.type.name === 'psychic' | type.type.name === 'poison') {
      badge_type.classList.add('badge-type', `bg-${type.type.name}`);
    } else {
      badge_type.classList.add('badge-type', 'bg-other');
    }
    badge_type.innerHTML = type.type.name.toUpperCase();
    badges_container.append(badge_type);
  }

  // STATS
  const progress_bars = document.getElementsByTagName('progress');
  for (const bar of progress_bars) {
    const div = bar.parentNode.parentNode;
    const progress_bar = div.children[1].children[0];
    const stat_number = div.children[2];
    const stat_txt = div.id.split('-')[0];
    for (const stat of pokemon.stats) {
      if (stat.stat.name === stat_txt) {
        progress_bar.value = stat.base_stat;
        stat_number.innerHTML = stat.base_stat;
      }
    }
  }
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