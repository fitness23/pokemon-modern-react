import { useEffect, useState, type ChangeEvent } from 'react';
import { getAbilities, getPokemonDetail, getPokemonList, getTypes } from '../services/pokeApi';
import { useResource } from '../hooks/useResource';
import { titleCase } from '../titleCase';
import PokemonDetail from './pokemon-detail/PokemonDetail';
import type { Filter } from '../interfaces/filters-interface';
import type { Item } from '../interfaces/items-interface';
import type { Detail } from '../interfaces/detail-interface';
import './Search.scss';

type SearchField = 'types' | 'abilities';

export default function Search() {
  // '' is the "Please select" option, meaning no search.
  const [typeUrl, setTypeUrl] = useState('');
  const [abilityUrl, setAbilityUrl] = useState('');
  const [detailUrl, setDetailUrl] = useState<string | null>(null);

  // Choosing one filter clears the other, so at most one of these is set.
  const searchUrl = typeUrl || abilityUrl || null;

  const pokemonTypes = useResource<Filter[], void>({
    loader: (_, signal) => getTypes(signal),
    defaultValue: [],
  });

  const pokemonAbilities = useResource<Filter[], void>({
    loader: (_, signal) => getAbilities(signal),
    defaultValue: [],
  });

  const items = useResource<Item[], string | null>({
    params: searchUrl,
    enabled: searchUrl !== null,
    loader: (url, signal) => getPokemonList(url as string, signal),
    defaultValue: [],
  });

  const detail = useResource<Detail | undefined, string | null>({
    params: detailUrl,
    enabled: detailUrl !== null,
    loader: (url, signal) => getPokemonDetail(url as string, signal),
    defaultValue: undefined,
  });

  useEffect(() => {
    if (detail.value) {
      window.scroll({ top: 0, left: 0, behavior: 'smooth' });
    }
  }, [detail.value]);

  const setSearchUrl = (field: SearchField) => (event: ChangeEvent<HTMLSelectElement>) => {
    const url = event.target.value;
    if (field === 'types') {
      setTypeUrl(url);
      setAbilityUrl('');
    } else {
      setAbilityUrl(url);
      setTypeUrl('');
    }
  };

  return (
    <>
      {detail.value && <PokemonDetail detail={detail.value} />}

      <form noValidate className="generalForm" onSubmit={e => e.preventDefault()}>
        <div className="generalSearchOption">
          <div className="generalSearchOptionInner">
            <div className="generalSearchOptionTitle">Search for Pokemon</div>
            <ol>
              <li className="selectQuestion">
                <label htmlFor="types">By Types</label>
                <select id="types" value={typeUrl} onChange={setSearchUrl('types')}>
                  <option value="">Please select</option>
                  {pokemonTypes.value.map(pokemonType => (
                    <option key={pokemonType.url} value={pokemonType.url}>{titleCase(pokemonType.name)}</option>
                  ))}
                </select>
              </li>
              <li><div className="divider">or</div></li>
              <li className="selectQuestion">
                <label htmlFor="abilities">By Abilities</label>
                <select id="abilities" value={abilityUrl} onChange={setSearchUrl('abilities')}>
                  <option value="">Please select</option>
                  {pokemonAbilities.value.map(pokemonAbility => (
                    <option key={pokemonAbility.url} value={pokemonAbility.url}>{titleCase(pokemonAbility.name)}</option>
                  ))}
                </select>
              </li>
            </ol>
          </div>
        </div>
      </form>

      <div className="content">
        {items.value.length ? (
          <table className="standardTable">
            <tbody>
              <tr><th>Name</th><th>View</th></tr>
              {items.value.map(item => (
                <tr key={item.pokemon.url}>
                  <td>{titleCase(item.pokemon.name)}</td>
                  <td><a className="viewPokemon" onClick={() => setDetailUrl(item.pokemon.url)}>View Pokemon Character</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="useSearch">Please use the search to filter various Pokemon.</div>
        )}
      </div>
    </>
  );
}
