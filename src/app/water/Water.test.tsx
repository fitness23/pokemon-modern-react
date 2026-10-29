import { render, screen } from '@testing-library/react';
import Water from './Water';
import { mockFetch, requestedUrls } from '../testing/mockFetch';

describe('Water', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('should load the water pokemon on creation and list them', async () => {
    const fetchMock = mockFetch({
      'https://pokeapi.co/api/v2/type/11': {
        pokemon: [
          { slot: 1, pokemon: { name: 'squirtle', url: 'a' } },
          { slot: 1, pokemon: { name: 'psyduck', url: 'b' } },
        ],
      },
    });

    render(<Water />);

    expect(await screen.findByText('Squirtle')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem').map(li => li.textContent)).toEqual(['Squirtle', 'Psyduck']);
    expect(requestedUrls(fetchMock)).toEqual(['https://pokeapi.co/api/v2/type/11']);
  });

  it('should render an empty list when the request fails', async () => {
    mockFetch({});

    render(<Water />);

    expect(await screen.findByText('Here are all the water pokemon:')).toBeInTheDocument();
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });
});
