# IAKOA — Project Context

> Ce fichier sert de contexte persistant pour les prompts IA. Il résume l'architecture, les patterns et les décisions techniques du projet IAKOA.

---

## 1. Project Overview

IAKOA est une application web de découverte et création d'événements locaux en France.
- Les utilisateurs **découvrent** des événements via une liste paginée ou une carte interactive Leaflet
- Les **créateurs** (isCreator: true) publient des événements via leur compte entreprise
- Le backend expose une API REST NestJS + Prisma + PostgreSQL
- Le frontend est une SPA React 19 avec Redux Toolkit et React Router v7

---

## 2. Tech Stack

### Frontend
| Outil | Version | Usage |
|---|---|---|
| React | 19.2 | UI, composants |
| TypeScript | Latest | Typage statique |
| Vite | Latest | Bundler |
| Redux Toolkit | Latest | State management global |
| React Router | v7 | Routing SPA |
| Tailwind CSS | v4 | Styling utilitaire |
| DaisyUI | Latest | Composants UI Tailwind |
| Lucide React | Latest | Icônes |
| React Leaflet | Latest | Carte interactive |

### Backend
| Outil | Version | Usage |
|---|---|---|
| NestJS | Latest | Framework API REST |
| Prisma | Latest | ORM + migrations |
| PostgreSQL | 18 | Base de données (port 5432) |
| JWT | Latest | Auth (access + refresh tokens) |
| Passport | Latest | Stratégies OAuth (Google, Facebook) |
| class-validator | Latest | Validation DTOs |
| Swagger | Latest | Documentation API auto |

### APIs externes
- `geo.api.gouv.fr` — autocomplétion villes (SearchBar)
- `api-adresse.data.gouv.fr` (BAN) — autocomplétion adresses complètes avec coordonnées GPS

---

## 3. Frontend Architecture

```
frontend/src/
├── app/              # Router (AppRouter), Layout, App setup, app.css
├── features/
│   ├── auth/         # AuthModal, UnifiedAuthForm, OAuthCallback
│   ├── events_page/  # EventsPage, EventCard (avec bouton favoris), EventModal
│   ├── map_page/     # MapPage (Leaflet, markers, radius)
│   ├── create_event/ # CreateEventPage + sous-composants + hook + service
│   ├── create_company/ # CreateCompanyPage + sous-composants + hook
│   ├── favorites/    # FavoritesPage (grille événements favoris)
│   └── profile/      # AccountPage + EditProfileSection, ChangePasswordSection, CompaniesSection
├── components/
│   ├── Header/       # Header, SearchBar (keyword + ville)
│   └── ui/           # ValidatedInput, PasswordInput
├── lib/
│   ├── types/        # EventType, AuthType (UserType)
│   ├── services/     # eventsServices, authService, tokenService, companiesService, accountService, favoritesService
│   └── constants/    # FILTER_CATEGORY_GROUPS (72 catégories groupées avec hexColor)
├── store/
│   ├── index.ts      # { auth, events, filters, favorites }
│   ├── hooks.ts      # useAppDispatch, useAppSelector
│   └── slices/       # authSlice, eventsSlice, filtersSlice, favoritesSlice
└── utils/            # validators.ts
```

### Composants clés
- **ValidatedInput** — input avec bordure verte/rouge selon `isValid` + `showValidation`
- **SearchBar** — keyword + ville avec autocomplétion debounce 300ms + "Ma localisation"
- **EventCard** — carte événement (image, catégories colorées, prix, date) + bouton cœur favoris (Redux optimistic)
- **EventModal** — modal plein écran avec carte Leaflet, liens navigation, réseaux sociaux
- **AddressAutocomplete** — champ adresse BAN avec dropdown suggestions + indicateur sélection
- **CategorySelector** — multi-select catégories groupées avec badges colorés
- **PricingField** — prix en euros avec toggle "Gratuit"
- **SocialNetworksFields** — champs réseaux sociaux avec icônes SVG inline (Facebook, Instagram, X, YouTube, TikTok)
- **EventPreviewModal** — modal d'aperçu avant publication (voir section 8)
- **EditProfileSection** — affichage + édition inline nom/email avec `updateUser()`, badges isCreator/role
- **ChangePasswordSection** — changement mot de passe (regex complexité + confirm), `updateUser(userId, {password})`
- **CompaniesSection** — accordion par entreprise, édition inline + suppression, `updateCompany()` / `deleteCompany()`

### Layout des pages formulaire
- **Desktop (≥ lg)** : 2 colonnes — gauche scrollable (form), droite fixe (récapitulatif live + CTA)
- **Mobile/tablette (< lg)** : sections en block, bouton flottant fixe (`bottom-20` pour laisser place à la nav bottom)
- Chaîne flex complète : `html → body → #root → main (flex-1) → page (flex-1 flex-row)`

---

## 4. Backend Architecture

```
backend/src/
├── auth/         # JWT strategy, Guards (JwtAuthGuard, RolesGuard), OAuth (Google/Facebook)
├── users/        # GET /users/me, profil utilisateur
├── companies/    # CRUD entreprises (isCreator requis pour créer)
├── events/       # CRUD événements + filtres avancés
├── media/        # Gestion médias liés aux événements
└── prisma/       # PrismaService + schema
```

### Routes API principales
| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | `/auth/login` | Non | Login email/password |
| POST | `/auth/register` | Non | Création compte |
| POST | `/auth/logout` | Bearer | Déconnexion |
| POST | `/auth/refresh` | Bearer | Refresh token |
| GET | `/users/me` | Bearer | Profil utilisateur |
| GET | `/events` | Non | Liste événements (filtres + pagination) |
| GET | `/events/:id` | Non | Détail événement |
| POST | `/events` | Bearer | Créer événement (isCreator) |
| PATCH | `/events/:id` | Bearer | Modifier (propriétaire) |
| DELETE | `/events/:id` | Bearer | Supprimer (propriétaire) |
| GET | `/events/my-events` | Bearer | Mes événements |
| GET | `/companies/my-companies` | Bearer | Mes entreprises |
| POST | `/companies` | Bearer (isCreator) | Créer entreprise |
| PATCH | `/companies/:id` | Bearer (owner) | Modifier entreprise |
| DELETE | `/companies/:id` | Bearer (owner) | Supprimer entreprise |
| PATCH | `/users/:id` | Bearer | Modifier profil (name, email, password) |
| GET | `/users/:id/favorites` | Bearer | IDs événements favoris |
| POST | `/users/:id/favorites/:eventId` | Bearer | Ajouter favori |
| DELETE | `/users/:id/favorites/:eventId` | Bearer | Retirer favori |

---

## 5. Core Features

- **Découverte événements** — liste paginée (infinite scroll, prefetch), filtres (catégorie, ville, rayon, date, prix)
- **Carte interactive** — Leaflet, markers colorés par catégorie, rayon ajustable, localisation GPS
- **Authentification** — email/password + OAuth Google/Facebook, JWT access/refresh tokens
- **Création événement** — formulaire multi-sections, adresse → GPS, catégories multi-select, tarification, aperçu avant publication
- **Création entreprise** — formulaire avec SIREN, description, site web, réseaux sociaux
- **Entreprises** — modèle intermédiaire obligatoire entre user et événement
- **Favoris** — bouton cœur sur EventCard (optimistic Redux), FavoritesPage avec grille, persisté via `/users/:id/favorites`
- **Mon compte** — AccountPage (profil, mot de passe, entreprises) accessible via `/profile`

---

## 6. Data Flow

### Auth flow
```
User → UnifiedAuthForm → dispatch(login/register) → authSlice → tokenService (localStorage)
Refresh: App mount → dispatch(refreshUser) → GET /users/me → authSlice.user
Profile update: AccountPage → updateUser(id, payload) → dispatch(updateAuthUser(UserType)) → authSlice.user
```

### Events flow
```
SearchBar → dispatch(fetchFilteredEvents({filters})) → eventsSlice
→ eventsServices.fetchEventsPaginated(page, limit, filters) → GET /events?params
→ state.events.events[] → EventsPage (infinite scroll via IntersectionObserver)
```

### Create event flow
```
CreateEventPage → useCreateEventForm()
  ├── fetchMyCompanies() → GET /companies/my-companies (companyId)
  ├── searchAddresses(query) → api-adresse.data.gouv.fr → {label, city, postalCode, coordinates}
  ├── openPreview() → validate() → showPreview = true → EventPreviewModal
  └── handleSubmit() (depuis modal) → dispatch(createEvent(payload)).unwrap() → POST /events
       payload: { name, date(ISO), description, pricing(centimes), location{...coordinates}, companyId, website?, categories[], media:[] }
```

### Create company flow
```
CreateCompanyPage → useCreateCompanyForm()
  └── handleSubmit() → createCompany(payload) → POST /companies
       payload: { name, siren, description?, website?, socialNetworks?(nettoyé des champs vides) }
  → succès : redirect vers /create (enchaînement naturel)
```

### Favorites flow
```
App mount (user change) → dispatch(fetchFavorites(userId)) → GET /users/:id/favorites → favoritesSlice.ids[]
EventCard heart click → dispatch(optimisticToggle({eventId, add})) (sync immédiat)
                      → dispatch(toggleFavorite({userId, eventId, currentlyFavorited})) (API en background)
FavoritesPage → state.favorites.ids → Promise.all(ids.map(fetchEventById)) → grille EventCard
Déconnexion → dispatch(clearFavorites())
```

### Account flow
```
/profile → AccountPage → useAppSelector(state.auth.user)
  ├── EditProfileSection → updateUser(id, {name, email}) → dispatch(updateAuthUser(updated))
  ├── ChangePasswordSection → updateUser(id, {password}) (ne touche pas Redux)
  └── CompaniesSection (si user.isCreator) → fetchMyCompanies() au mount
       ├── edit accordion → updateCompany(id, payload) → mise à jour locale
       └── delete → confirm + deleteCompany(id) → filtre local
```

### Token management
```
tokenService.getAccessToken() → localStorage
Authorization: `Bearer ${token}` → tous les appels protégés
```

---

## 7. Key Patterns & Decisions

### State management
- **Redux Toolkit** pour état global (events, auth, filters, favorites)
- **useState local** pour l'état de formulaire (pattern: UnifiedAuthForm, useCreateEventForm, useCreateCompanyForm)
- Thunks async avec `createAsyncThunk` + `.unwrap()` pour capturer les erreurs
- Pattern `ensureMinLoadTime(500ms)` sur les fetchs pour éviter un flash de loader
- **Optimistic UI** pour les favoris : `optimisticToggle` dispatché immédiatement, API call en background
- `updateAuthUser` — action synchrone dans authSlice pour mettre à jour le profil après PATCH /users/:id

### Formulaires
- **Contrôlé pur** (useState), pas de react-hook-form
- Validation centralisée dans une fonction `validate()` synchrone, appelée avant ouverture de la preview
- Affichage erreurs : `<p className="text-xs text-red-500 mt-1">` sous le champ concerné
- Validation visuelle : `ValidatedInput` avec `isValid` + `showValidation` (bordures colorées)
- **Flux événement** : bouton "Aperçu →" → validate → modal preview → "Confirmer et publier" → POST

### API calls
- Plain `fetch()` dans les services — pas d'axios
- `Content-Type: application/json` + `Authorization: Bearer ${token}` pour les routes protégées
- `API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'`
- Erreur extraite via `res.json().catch(() => ({}))` → `errorData.message`

### Styling
- Tailwind CSS v4 + DaisyUI
- Couleur primaire : `--color-iakoa-blue: #2397FF` → classes `text-iakoa-blue`, `bg-iakoa-blue`, `border-iakoa-blue`
- Bordures validation : `border-green-500` (valide), `border-red-400` (erreur), `border-gray-200` + `focus:border-iakoa-blue` (neutre)
- Responsive : mobile-first, breakpoints `sm:` (640px), `md:` (768px), `lg:` (1024px)
- Hover/active : `hover:shadow-2xl`, `active:scale-[0.98]`
- Boutons flottants mobile : `fixed bottom-20 left-4 right-4` (bottom-20 = au-dessus de la nav bottom)

### Routing
- React Router v7, structure : `<Layout>` wrapping toutes les routes sauf `/auth/callback`
- Routes :
  - `/` → EventsPage
  - `/map` → MapPage
  - `/create` → CreateEventPage (isCreator requis)
  - `/company/new` → CreateCompanyPage (isCreator requis)
  - `/favorites` → FavoritesPage
  - `/profile` → AccountPage (redirige `/` si non connecté)
- `tsconfig.app.json` : alias `@/*` → `./src/*` (sans `baseUrl` — déprécié TS 6+)

---

## 8. Special Logic

### Aperçu avant publication (événement)
```typescript
// useCreateEventForm expose : showPreview, openPreview(), closePreview()
// openPreview() = validate() → si ok → showPreview = true
// handleSubmit() = setShowPreview(false) → dispatch(createEvent(payload))
// EventPreviewModal reçoit form, selectedAddress, companies, isSubmitting
// Boutons : "Modifier" (closePreview) | "Confirmer et publier" (handleSubmit)
```

### Adresse → Coordonnées GPS
```typescript
// api-adresse.data.gouv.fr/search/?q=query&limit=5&autocomplete=1
// Retourne GeoJSON : feature.geometry.coordinates = [lng, lat]
// → { lat: coordinates[1], lng: coordinates[0] }
// Debounce 300ms, déclenché à partir de 3 caractères
// Validation : adresse acceptée uniquement si sélectionnée dans la liste (pas texte libre)
```

### Pricing (euros ↔ centimes)
```typescript
// Stockage backend : entier en centimes (ex: 2500 = 25.00€)
// Saisie utilisateur : string décimal en euros ("12.50")
// Conversion au submit : Math.round(parseFloat(pricingEuros) * 100)
// Toggle "Gratuit" → pricing: 0
```

### Catégories
```typescript
// 72 catégories dans FILTER_CATEGORY_GROUPS (7 groupes)
// + synonymes dans SYNONYMS (non affichés dans les filtres)
// Helpers : getCategoryLabel(id), getCategoryHexColor(id), getCategoryShadowColor(id)
// Utilisées pour badges EventCard, markers Leaflet, CategorySelector, EventPreviewModal
```

### Auth guards (frontend)
```typescript
// user.isCreator → peut créer une entreprise et des événements
// user.role: 'ADMIN' | 'USER' → accès admin
// Gardes inline dans les composants (pas de ProtectedRoute)
// Bandeau d'avertissement si !isCreator, lien /company/new si aucune entreprise
// AccountPage : if (!user) → navigate('/') + return null (guard inline)
// CompaniesSection dans AccountPage : affichée seulement si user.isCreator
```

### Companies (relation user → événement)
```typescript
// Un user peut avoir N entreprises (GET /companies/my-companies)
// Chaque événement appartient à une entreprise (companyId: UUID requis)
// isCreator = true requis pour créer une entreprise
// Si 1 seule entreprise → auto-sélectionnée dans le formulaire
// Si N entreprises → <select> dans le formulaire
// SIREN : exactement 9 chiffres (/^\d{9}$/) — filtré côté onChange (pas de lettres)
// socialNetworks : champs vides filtrés avant envoi API (Object.entries filter)
```

---

## 9. Constraints & Requirements

### Responsive
- **Mobile** : formulaires en block, bouton flottant fixe `bottom-20`
- **Tablette** : idem mobile (breakpoint lg = 1024px pour le split)
- **Desktop (≥ lg)** : layout 2 colonnes (form scrollable + panneau droit fixe avec récapitulatif live)

### Design system
- Pas de composant UI tiers lourd (pas de shadcn, pas de MUI) — Tailwind + DaisyUI natif
- Icônes exclusivement Lucide React (sauf logos réseaux sociaux = SVG inline dans SocialNetworksFields)
- Animations : `transition-all duration-150`, `animate-spin` (loaders), `scale-[0.98]` sur active
- Modals : backdrop `bg-black/50 backdrop-blur-sm`, fermeture au clic backdrop

### Sécurité
- Tokens en localStorage (access + refresh)
- Bearer token sur toutes les routes protégées
- Propriété vérifiée côté backend pour update/delete (ownerId)

### Environnement
- `VITE_API_BASE_URL` ou fallback `http://localhost:3000` (eventsServices, companiesService)
- `VITE_API_URL` utilisé dans authService (même valeur attendue)
- PostgreSQL 18, cluster `main`, port 5432, user `iakoa_dev`, db `iakoa-backend`

---

## 10. Types clés (référence rapide)

```typescript
// UserType
{ id, name, email, isCreator: boolean, role: 'ADMIN'|'USER', createdAt, updatedAt }

// EventType
{ id?, name, date(ISO), description, pricing(centimes), location: Location,
  companyId, company?, website, categories: string[], media: Media[] }

// Location
{ address, city, postalCode, country, coordinates: { lat, lng } }

// CompanyType (frontend)
{ id, name, siren, isValidated, website?, description?, ownerId }

// CreateCompanyPayload
{ name, siren, description?, website?, socialNetworks?: SocialNetworks }

// SocialNetworks
{ facebook?, instagram?, x?, youtube?, tiktok? }

// AddressSuggestion (geocodingService)
{ label, city, postalCode, country, coordinates: { lat, lng } }

// FavoritesState (Redux)
{ ids: string[], isLoading: boolean, error: string | null }

// UpdateUserPayload (accountService)
{ name?: string, email?: string, password?: string }

// EventFilterParams
{ page?, limit?, keyword?, city?, latitude?, longitude?, radius?,
  categories?, dateFrom?, dateTo?, priceMin?, priceMax?, isFree? }
```
