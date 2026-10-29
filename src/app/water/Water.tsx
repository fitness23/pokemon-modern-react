import { getWaterPokemon } from '../services/pokeApi';
import { useResource } from '../hooks/useResource';
import { titleCase } from '../titleCase';
import type { Filter } from '../interfaces/filters-interface';
import './Water.scss';

export default function Water() {
  const waterPokemon = useResource<Filter[], void>({
    loader: (_, signal) => getWaterPokemon(signal),
    defaultValue: [],
  });

  return (
    <>
      <p>Here are all the water pokemon:</p>
      <ul>
        {waterPokemon.value.map(item => (
          <li key={item.name}>{titleCase(item.name)}</li>
        ))}
      </ul>
    </>
  );
}
