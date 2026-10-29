# React Pokemon

React equivalent of the Angular `PokemonAngular` app: the same three routes (Search, Fire, Water), styles and PokeAPI calls.

Built with Vite, React 19, TypeScript and React Router. Tests use Vitest and Testing Library.

## Commands

- `npm start` (or `npm run dev`): dev server at `http://localhost:5173/`
- `npm run build`: type-check and build to `dist/`
- `npm test`: run the unit tests (`npm test -- --run` for a single run)

## How it maps to the Angular app

| Angular | React |
|---|---|
| `AppComponent` + `app.routes.ts` (lazy `loadComponent`) | `app/App.tsx` with `React.lazy` routes |
| `SearchComponent`, `FireComponent`, `WaterComponent` | `search/Search.tsx`, `fire/Fire.tsx`, `water/Water.tsx` |
| `PokemonDetailComponent` (`input.required`) | `search/pokemon-detail/PokemonDetail.tsx` (props) |
| `HttpService` | `services/pokeApi.ts` (`fetch`) |
| `rxResource` | `hooks/useResource.ts` |
| `titlecase` pipe | `titleCase.ts` |
| `routerLinkActive` | `useMatch` in `NavItem` (adds `active` to the `<li>`) |
| Component `.scss` files | Same files, imported globally (React has no view encapsulation) |

`useResource` behaves like `rxResource`: it stays idle until enabled, resets the value when params change, keeps it on `reload()`, cancels superseded requests, and falls back to the default value if a request fails.

Not carried over: the Angular app's 10 second response cache (`ng-http-caching`) and the `deelay.me` delay were removed there before this port.
