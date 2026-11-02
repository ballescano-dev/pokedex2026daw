import * as pokeapi from './pokeapi/api.js';
import * as bootstrap from './node_modules/bootstrap/dist/js/bootstrap.bundle.min.js';
const img_src_base = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/';

window.addEventListener('load', async () => {
  fillButtonTypes();
  fillNumberKeyboard();
  const pokemon_list = await pokeapi.getAllPokemons();
  fillPokemonGrid(pokemon_list);
  showPokemon(1, pokemon_list);
  // quitar la "pagina de carga" cuando ya están todos los pokemon recogidos
  const loadingPage = document.getElementById('loading-page');
  loadingPage.classList.add('d-none');

  // FORM + INPUT_SEARCH
  const input_search = document.getElementById('pokemon-search');
  const result_search_container = document.getElementById('result-search-container');
  const form = document.getElementsByTagName('form')[0];
  
  form.onreset = ($event) => {
    result_search_container.classList.add('d-none');
    result_search_container.innerHTML = '';
  };
  form.onsubmit = async ($event) => {
    $event.preventDefault();
    const parameter = input_search.value ? input_search.value : 1;
    const pokemon = await pokeapi.getPokemonById(parameter);
    showPokemon(pokemon.id, pokemon_list);
    result_search_container.classList.add('d-none');
    result_search_container.innerHTML = '';
    input_search.value = '';
    input_search.blur(); //quitar el foco del input
  };
  input_search.addEventListener('input', () => { fillResultSearchContainer(input_search, result_search_container, pokemon_list) });
  
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
    const parameter = input_search.value ? input_search.value : 1;
    const pokemon = await pokeapi.getPokemonById(parameter);
    showPokemon(pokemon.id, pokemon_list);
    input_search.value = '';
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
      result_item.addEventListener('click', () => {
        showPokemon(pokemon.id, pokemon_list);
        result_container.classList.add('d-none');
        result_container.innerHTML = '';
        input.value = '';
        input.blur();
      });
      result_item.addEventListener('keydown', ($event) => {
        if ($event.key === 'Enter') {
          showPokemon(pokemon.id, pokemon_list);
          result_container.classList.add('d-none');
          result_container.innerHTML = '';
          input.value = '';
          input.blur();
        }
      });
      result_container.append(result_item);
    }
  }
}

function formatPokemonId(pokemonId) {
  return `#${pokemonId.toString().padStart(3, '0')}`;
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

async function showPokemon(pokemon_id, pokemonList) {
  const current_pokemon = await pokeapi.getPokemonById(pokemon_id);
  fillPokemonDisplay(current_pokemon, pokemonList);
}

async function fillPokemonDisplay(pokemon, pokemonList) {
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
  badges_container.innerHTML = '';
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
  const response = await pokeapi.getPokemonSpecie(pokemon.id);
  const description = document.getElementById('pokemon-description');
  description.innerHTML = `"${response[0]}"`;
  const weight = document.getElementById('pokemon-weight');
  weight.innerHTML = pokemon.weight/10;
  const height = document.getElementById('pokemon-height');
  height.innerHTML = pokemon.height/10;
  const specie = document.getElementById('pokemon-specie');
  specie.innerHTML = response[1];

  // SELECT ITEM LIST
  const grid = document.getElementById('catalog-grid');
  for (const item of grid.children) {
    item.classList.remove('active');
    const itemId = Number(item.children[1].innerHTML.substring(1));
    if (itemId === pokemon.id) {
      item.classList.add('active');
      //mover el grid hasta el pokemon actual
      const top = item.offsetTop - grid.offsetTop - grid.clientHeight/2 + item.clientHeight/2;
      grid.scrollTo({
        behavior: 'smooth',
        top
      });
    }
  }

  // PREVIOUS POKEMON BUTTON
  const prevPokemon = await getXPrevPokemon(1, pokemon, pokemonList);
  const idPrevPokemon = document.getElementById('id-prev-pokemon');
  idPrevPokemon.innerHTML = formatPokemonId(prevPokemon.id);
  const namePrevPokemon = document.getElementById('name-prev-pokemon');
  namePrevPokemon.innerHTML = prevPokemon.name.toUpperCase();
  const prevPokemonBtn = document.getElementById('btn-prev-pokemon');
  prevPokemonBtn.onclick = () => { showPokemon(prevPokemon.id, pokemonList) };

  // NEXT POKEMON BUTTON
  const nextPokemon = await getXNextPokemon(1, pokemon, pokemonList);
  const idNextPokemon = document.getElementById('id-next-pokemon');
  idNextPokemon.innerHTML = formatPokemonId(nextPokemon.id);
  const nameNextPokemon = document.getElementById('name-next-pokemon');
  nameNextPokemon.innerHTML = nextPokemon.name.toUpperCase();
  const nextPokemonBtn = document.getElementById('btn-next-pokemon');
  nextPokemonBtn.onclick = () => { showPokemon(nextPokemon.id, pokemonList) };

  // ARROWS CONTROLS
  const leftArrow = document.getElementById('arrow-left');
  leftArrow.onclick = () => { showPokemon(prevPokemon.id, pokemonList) };
  const rightArrow = document.getElementById('arrow-right');
  rightArrow.onclick = () => { showPokemon(nextPokemon.id, pokemonList) };
  const upArrow =  document.getElementById('arrow-up');
  upArrow.onclick = async () => {
    const prevPokemon = await getXPrevPokemon(10, pokemon, pokemonList);
    showPokemon(prevPokemon.id, pokemonList);
  };
  const downArrow =  document.getElementById('arrow-down');
  downArrow.onclick = async () => {
    const nextPokemon = await getXNextPokemon(10, pokemon, pokemonList);
    showPokemon(nextPokemon.id, pokemonList);
  };

  // INFO CRYO BUTTON
  const infoCryoBtn = document.getElementById('info-cryo')
  infoCryoBtn.onclick = async () => {
    const nextPokemon = await getXNextPokemon(5, pokemon, pokemonList);
    showPokemon(nextPokemon.id, pokemonList);
  };
}

// TODO: FILTRAR POR EL TIPO DE POKEMON. SI ES NULL, TODOS; SI NO, SOLO LOS POKEMON QUE COINCIDAN CON EL TIPO
// LO MISMO HAY QUE HACER UNA FUNCIÓN NUEVA EN API.JS O DIRECTAMENTE CREAR UNA LISTA DE OBJETOS Y FILTRAR DE LOS 1351 
// VACIAR POKEMON_LIST, RECORRER LOS TIPOS DE CADA POKEMON, COMPARAR CON EL PARAMETRO TYPE Y AÑADIR A POKEMON_LIST
function fillPokemonGrid(pokemon_list, type=null) {
  const grid = document.getElementById('catalog-grid');
  const total_pokemon_number = document.getElementById('total-pokemon-number');
  total_pokemon_number.innerHTML = pokemon_list.length;
  for (const pokemon of pokemon_list) {
    const div = document.createElement('div');
    div.classList.add('col', 'pokemon-list-item');
    div.setAttribute('tabindex', '0');
    div.addEventListener('click', () => showPokemon(pokemon.id, pokemon_list));
    div.addEventListener('keydown', ($event) => {
      if ($event.key === 'Enter') {
        $event.preventDefault();
        showPokemon(pokemon.id, pokemon_list);
      }
    });

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

    div.append(img, pokemon_id_span, pokemon_name_span, pokemon_types_div);
    grid.append(div);
  }
}

async function getXPrevPokemon(gap, currentPokemon, pokemonList) {
  const currentIndex = pokemonList.findIndex(pokemon => pokemon.id === currentPokemon.id);
  const prevIndex = (currentIndex - gap + pokemonList.length) % pokemonList.length;
  return await pokeapi.getPokemonById(pokemonList[prevIndex].id);
}

async function getXNextPokemon(gap, currentPokemon, pokemonList) {
  const currentIndex = pokemonList.findIndex(pokemon => pokemon.id === currentPokemon.id);
  const nextIndex = (currentIndex + gap) % pokemonList.length;
  return await pokeapi.getPokemonById(pokemonList[nextIndex].id);
}