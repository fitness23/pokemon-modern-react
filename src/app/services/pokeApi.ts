import type { Detail } from '../interfaces/detail-interface';
import type { Filter } from '../interfaces/filters-interface';
import type { Item } from '../interfaces/items-interface';

interface FilterListResponse {
  results: Filter[];
}

interface TypeResponse {
  pokemon: Item[];
}

export const API = 'https://pokeapi.co/api/v2';

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, { signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    throw new Error(err instanceof Error ? err.message : 'server error.');
  }
  if (!response.ok) {
    throw new Error(`Http failure response for ${url}: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export async function getTypes(signal?: AbortSignal): Promise<Filter[]> {
  return (await getJson<FilterListResponse>(`${API}/type`, signal)).results;
}

export async function getAbilities(signal?: AbortSignal): Promise<Filter[]> {
  return (await getJson<FilterListResponse>(`${API}/ability`, signal)).results;
}

export async function getWaterPokemon(signal?: AbortSignal): Promise<Filter[]> {
  const res = await getJson<TypeResponse>(`${API}/type/11`, signal);
  return res.pokemon.map(item => item.pokemon);
}

export async function getFirePokemon(signal?: AbortSignal): Promise<Filter[]> {
  const res = await getJson<TypeResponse>(`${API}/type/10`, signal);
  return res.pokemon.map(item => item.pokemon);
}

export async function getPokemonList(searchUrl: string, signal?: AbortSignal): Promise<Item[]> {
  return (await getJson<TypeResponse>(searchUrl, signal)).pokemon;
}

export function getPokemonDetail(searchUrl: string, signal?: AbortSignal): Promise<Detail> {
  return getJson<Detail>(searchUrl, signal);
}
