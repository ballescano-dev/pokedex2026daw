const endpointBase = 'https://pokeapi.co/api/v2/';
const fullEndpoint = {
  'pokemon': `${endpointBase}pokemon/`,
  'type': `${endpointBase}type/`,
  'ability': `${endpointBase}ability/`
};

async function getAllPokemons() {
  let pokemonList = [];
  let response = await fetch(fullEndpoint.pokemon);
  if (!response.ok) {
    return pokemonList;
  }

  let data = await response.json();
  while (data.next || data.previous) {
    for (const result of data.results) {
      response = await fetch(result.url);
      if (response.ok) {
        let fullData = await response.json();
        pokemonList.push(fullData);
      }
    }
    if (!data.next) {
      return pokemonList;
    }
    response = await fetch(data.next);
    data = await response.json();
  }
};

async function getPokemonById(pokemonId) {
  let response = await fetch(`${fullEndpoint.pokemon}${pokemonId}`);
  if (response.ok) {
    let data = await response.json();
    return data;
  }
  return {};
}

async function getPokemonTypes(pokemonId) {
  let response = await fetch(`${fullEndpoint.pokemon}${pokemonId}`);
  if (response.ok) {
    let data = await response.json();
    return data.types;
  }
  return [];
}

async function getPokemonsAbility(abilityName) {
  let response = await fetch(`${fullEndpoint.ability}${abilityName}`);
  if (response.ok) {
    let data = await response.json();
    return data;
  }
  return {};
}

async function getPokemonType(typeName) {
  let response = await fetch(`${fullEndpoint.type}${typeName}`);
  if (response.ok) {
    let data = await response.json();
    return data;
  }
  return {};
}

async function getPokemonAbility(pokemonId, abilityName) {
  let pokemonResponse = await fetch(`${fullEndpoint.pokemon}${pokemonId}`);
  if (pokemonResponse.ok) {
    let pokemonData = await pokemonResponse.json();
    for (const ability of pokemonData.abilities) {
      let response = await fetch(ability.ability.url);
      if (response.ok) {
        data = await response.json();
        if (data.name === abilityName) return data;
      }
    }
    return {};
  }
  return {};
}

export { getAllPokemons, getPokemonById, getPokemonsAbility, getPokemonType, getPokemonTypes, getPokemonAbility };