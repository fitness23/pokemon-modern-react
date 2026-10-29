import { useState } from 'react';
import { getFirePokemon } from '../services/pokeApi';
import { useResource } from '../hooks/useResource';
import { titleCase } from '../titleCase';
import type { Filter } from '../interfaces/filters-interface';
import './Fire.scss';

export default function Fire() {
  const [started, setStarted] = useState(false);

  const items = useResource<Filter[], void>({
    enabled: started, // idle: no request until the first click
    loader: (_, signal) => getFirePokemon(signal),
    defaultValue: [],
  });

  const load = () => {
    if (started) {
      items.reload();
    } else {
      setStarted(true);
    }
  };

  return (
    <>
      <p>
        Press the button below to start an async call. You'll see it becoming disabled during async call data transfer:
      </p>
      <button type="button" disabled={items.isLoading} onClick={load}>Get all Fire Pokemon</button>

      {items.value.length ? (
        <div>
          <p>Here are all the fire pokemon:</p>
          <ul>
            {items.value.map(item => (
              <li key={item.name}>{titleCase(item.name)}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div style={{ marginTop: 20 }}>Press the button above.</div>
      )}
    </>
  );
}
