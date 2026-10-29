import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Fire from './Fire';
import { deferred, mockFetch } from '../testing/mockFetch';

describe('Fire', () => {
  const url = 'https://pokeapi.co/api/v2/type/10';
  const body = { pokemon: [{ slot: 1, pokemon: { name: 'charmander', url: 'a' } }] };
  const button = () => screen.getByRole('button', { name: 'Get all Fire Pokemon' });

  afterEach(() => vi.unstubAllGlobals());

  it('should not request anything until the button is pressed', () => {
    const fetchMock = mockFetch({ [url]: body });

    render(<Fire />);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByText('Press the button above.')).toBeInTheDocument();
  });

  it('should disable the button while loading, then list the pokemon', async () => {
    const response = deferred<typeof body>();
    mockFetch({ [url]: () => response.promise });
    render(<Fire />);

    await userEvent.click(button());
    await waitFor(() => expect(button()).toBeDisabled());

    response.resolve(body);

    expect(await screen.findByText('Charmander')).toBeInTheDocument();
    expect(button()).toBeEnabled();
    expect(screen.queryByText('Press the button above.')).not.toBeInTheDocument();
  });

  it('should request again when the button is pressed a second time', async () => {
    const fetchMock = mockFetch({ [url]: body });
    render(<Fire />);

    await userEvent.click(button());
    await screen.findByText('Charmander');
    await userEvent.click(button());

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(screen.getByText('Charmander')).toBeInTheDocument();
  });

  it('should keep rendering when the request fails', async () => {
    const response = deferred<typeof body>();
    mockFetch({ [url]: () => response.promise });
    render(<Fire />);

    await userEvent.click(button());
    await waitFor(() => expect(button()).toBeDisabled());
    response.reject(new Error('boom'));

    await waitFor(() => expect(button()).toBeEnabled());
    expect(screen.getByText('Press the button above.')).toBeInTheDocument();
  });
});
