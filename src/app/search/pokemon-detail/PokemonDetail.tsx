import type { Detail } from '../../interfaces/detail-interface';
import { titleCase } from '../../titleCase';
import './PokemonDetail.scss';

export default function PokemonDetail({ detail }: { detail: Detail }) {
  return (
    <div id="detail">
      <div className="image"><img src={detail.sprites?.front_default} title={titleCase(detail.name)} /></div>
      <div className="stats">
        <div className="name">Name: {titleCase(detail.name)}</div>
        <div className="ability">Abilities:
          <ul>
            {detail.abilities?.map(a => (
              <li key={a.ability.name}>{titleCase(a.ability.name)}</li>
            ))}
          </ul>
        </div>
        <div className="move">Moves:
          <ul>
            {detail.moves?.map(m => (
              <li key={m.move.name}>{titleCase(m.move.name)}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
