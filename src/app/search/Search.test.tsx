import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Search from './Search';
import { mockFetch, requestedUrls } from '../testing/mockFetch';

describe('Search', () => {
  const api = 'https://pokeapi.co/api/v2';
  const typeUrl = `${api}/type/10`;
  const abilityUrl = `${api}/ability/66`;
  const detailUrl = `${api}/pokemon/4`;
  const charmander = { slot: 1, pokemon: { name: 'charmander', url: detailUrl } };

  const setup = () => {
    const fetchMock = mockFetch({
      [`${api}/type`]: { results: [{ name: 'fire', url: typeUrl }] },
      [`${api}/ability`]: { results: [{ name: 'blaze', url: abilityUrl }] },
      [typeUrl]: { pokemon: [charmander] },
      [abilityUrl]: { pokemon: [] },
      [detailUrl]: {
        name: 'charmander',
        sprites: { front_default: 'charmander.png' },
        abilities: [{ ability: { name: 'blaze', url: '' }, is_hidden: false, slot: 1 }],
        moves: [{ move: { name: 'scratch', url: '' }, version_group_details: [] }],
      },
    });
    render(<Search />);
    return fetchMock;
  };

  const typesSelect = () => screen.getByLabelText('By Types') as HTMLSelectElement;
  const abilitiesSelect = () => screen.getByLabelText('By Abilities') as HTMLSelectElement;
  const optionLabels = (select: HTMLElement) => within(select).getAllByRole('option').map(o => o.textContent);

  beforeEach(() => {
    vi.spyOn(window, 'scroll').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should fill the type and ability selects from the api', async () => {
    setup();

    expect(await within(typesSelect()).findByText('Fire')).toBeInTheDocument();
    expect(await within(abilitiesSelect()).findByText('Blaze')).toBeInTheDocument();
    expect(optionLabels(typesSelect())).toEqual(['Please select', 'Fire']);
    expect(optionLabels(abilitiesSelect())).toEqual(['Please select', 'Blaze']);
  });

  it('should ask the user to search before any selection is made', () => {
    setup();

    expect(screen.getByText('Please use the search to filter various Pokemon.')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('should list pokemon for a chosen type and reset the ability select', async () => {
    setup();
    await within(typesSelect()).findByText('Fire');
    await within(abilitiesSelect()).findByText('Blaze');

    await userEvent.selectOptions(abilitiesSelect(), abilityUrl);
    await userEvent.selectOptions(typesSelect(), typeUrl);

    expect(await screen.findByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Charmander')).toBeInTheDocument();
    expect(abilitiesSelect().value).toBe('');
    expect(screen.queryByText('Please use the search to filter various Pokemon.')).not.toBeInTheDocument();
  });

  it('should not search when "Please select" is chosen', async () => {
    const fetchMock = setup();
    await within(typesSelect()).findByText('Fire');

    await userEvent.selectOptions(typesSelect(), typeUrl);
    await screen.findByRole('table');
    await userEvent.selectOptions(typesSelect(), '');

    expect(screen.getByText('Please use the search to filter various Pokemon.')).toBeInTheDocument();
    expect(requestedUrls(fetchMock).filter(u => u.endsWith('/null') || u === '')).toEqual([]);
  });

  it('should show the pokemon detail and scroll to the top when a pokemon is viewed', async () => {
    setup();
    await within(typesSelect()).findByText('Fire');
    await userEvent.selectOptions(typesSelect(), typeUrl);

    await userEvent.click(await screen.findByText('View Pokemon Character'));

    const detail = await screen.findByText('Name: Charmander');
    expect(detail).toBeInTheDocument();
    const panel = detail.closest('#detail') as HTMLElement;
    expect(within(panel).getByText('Blaze')).toBeInTheDocument();
    expect(within(panel).getByText('Scratch')).toBeInTheDocument();
    expect(panel.querySelector('img')).toHaveAttribute('src', 'charmander.png');
    expect(window.scroll).toHaveBeenCalled();
  });
});
