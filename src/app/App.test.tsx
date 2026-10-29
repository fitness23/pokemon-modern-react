import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { mockFetch } from './testing/mockFetch';

describe('App', () => {
  const api = 'https://pokeapi.co/api/v2';

  beforeEach(() => {
    mockFetch({
      [`${api}/type`]: { results: [] },
      [`${api}/ability`]: { results: [] },
      [`${api}/type/11`]: { pokemon: [{ slot: 1, pokemon: { name: 'squirtle', url: 'a' } }] },
    });
  });

  afterEach(() => vi.unstubAllGlobals());

  const renderAt = (path: string) =>
    render(
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>,
    );

  it('should render a nav link for each route', () => {
    renderAt('/search');

    const links = within(screen.getByRole('navigation')).getAllByRole('link');
    expect(links.map(a => a.textContent)).toEqual(['Search', 'Fire', 'Water']);
  });

  it('should mark the link of the current route as active', () => {
    renderAt('/water');

    expect(screen.getByText('Water').closest('li')).toHaveClass('active');
    expect(screen.getByText('Fire').closest('li')).not.toHaveClass('active');
  });

  it('should render the search page at the root and the water page at /water', async () => {
    const { unmount } = renderAt('/');
    expect(await screen.findByText('Search for Pokemon')).toBeInTheDocument();
    unmount();

    renderAt('/water');
    expect(await screen.findByText('Squirtle')).toBeInTheDocument();
  });
});
