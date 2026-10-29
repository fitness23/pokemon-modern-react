import { render, screen, within } from '@testing-library/react';
import PokemonDetail from './PokemonDetail';
import type { Detail } from '../../interfaces/detail-interface';

describe('PokemonDetail', () => {
  const detail: Detail = {
    name: 'charmander',
    sprites: { front_default: 'charmander.png' },
    abilities: [{ ability: { name: 'blaze', url: '' }, is_hidden: false, slot: 1 }],
    moves: [
      { move: { name: 'scratch', url: '' }, version_group_details: [] },
      { move: { name: 'ember', url: '' }, version_group_details: [] },
    ],
  };

  it('should render the name, sprite, abilities and moves', () => {
    const { container } = render(<PokemonDetail detail={detail} />);

    expect(screen.getByText('Name: Charmander')).toBeInTheDocument();
    expect(container.querySelector('img')).toHaveAttribute('src', 'charmander.png');
    expect(within(container.querySelector('.ability') as HTMLElement).getAllByRole('listitem').map(li => li.textContent)).toEqual(['Blaze']);
    expect(within(container.querySelector('.move') as HTMLElement).getAllByRole('listitem').map(li => li.textContent)).toEqual(['Scratch', 'Ember']);
  });
});
