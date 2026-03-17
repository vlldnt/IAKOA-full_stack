import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { UserType } from '@/lib/types/AuthType';
import { isValidUser } from '@/utils/validators';
import * as tokenService from '@/lib/services/tokenService';
import * as authService from '@/lib/services/authService';

// ── Types ────────────────────────────────────────────────────────────────────

interface AuthState {
  user: UserType | null;
  isLoading: boolean;
}

interface AuthResult {
  success: boolean;
  error?: string;
  message?: string;
}

// ── État initial ─────────────────────────────────────────────────────────────

const initialState: AuthState = {
  user: null,
  isLoading: true,
};

// ── Thunks asynchrones ───────────────────────────────────────────────────────

// Vérifie et rafraîchit les informations utilisateur au chargement
// Gère automatiquement le renouvellement des tokens expirés
export const refreshUser = createAsyncThunk<UserType | null>(
  'auth/refreshUser',
  async () => {
    let token = tokenService.getAccessToken();
    if (!token) return null;

    try {
      let userData = await authService.getUserAPI(token);

      // Si le token d'accès a expiré, tenter de le rafraîchir
      if (!userData) {
        const refreshToken = tokenService.getRefreshToken();
        if (!refreshToken) {
          tokenService.clearTokens();
          return null;
        }

        const data = await authService.refreshTokensAPI(refreshToken);
        if (data) {
          tokenService.setTokens(data.access_token, data.refresh_token);
          const newToken = tokenService.getAccessToken();
          if (newToken) {
            userData = await authService.getUserAPI(newToken);
          }
        }
      }

      if (userData) return userData;

      tokenService.clearTokens();
      return null;
    } catch {
      tokenService.clearTokens();
      return null;
    }
  }
);

// Connecte l'utilisateur avec email/password et stocke les tokens
export const login = createAsyncThunk<AuthResult, { email: string; password: string }>(
  'auth/login',
  async ({ email, password }) => {
    try {
      const { response, data } = await authService.loginAPI(email, password);

      if (response.ok) {
        tokenService.setTokens(data.access_token, data.refresh_token);
        return {
          success: true,
          message: `User: ${JSON.stringify(data.user.name)} bien connecté.`,
          user: data.user,
        };
      }

      return { success: false, error: data.message || 'La connection a échoué.' };
    } catch {
      return { success: false, error: 'Problème de réseau.' };
    }
  }
);

// Valide les données, crée un compte et connecte l'utilisateur
export const register = createAsyncThunk<AuthResult, { name: string; email: string; password: string }>(
  'auth/register',
  async ({ name, email, password }) => {
    const validation = isValidUser(name, email, password);
    if (!validation.valid) {
      return { success: false, error: validation.errors.join(', ') };
    }

    try {
      const { response, data } = await authService.registerAPI(name, email, password);

      if (response.ok) {
        tokenService.setTokens(data.access_token, data.refresh_token);
        return {
          success: true,
          message: `${data.name}, votre compte a été créé avec succès.`,
          user: data.user,
        };
      }

      return { success: false, error: data.message || 'Impossibilité de créer un compte.' };
    } catch {
      return { success: false, error: 'Problème de réseau' };
    }
  }
);

// Déconnecte l'utilisateur et supprime les tokens
export const logout = createAsyncThunk<void>(
  'auth/logout',
  async () => {
    const token = tokenService.getAccessToken();
    if (token) {
      await authService.logoutAPI(token);
    }
    tokenService.clearTokens();
  }
);

// ── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // refreshUser — chargement initial de l'utilisateur
    builder
      .addCase(refreshUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(refreshUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoading = false;
      })
      .addCase(refreshUser.rejected, (state) => {
        state.user = null;
        state.isLoading = false;
      });

    // login — connexion de l'utilisateur
    builder
      .addCase(login.fulfilled, (state, action) => {
        // Le user est renvoyé dans le payload via le thunk
        const result = action.payload as AuthResult & { user?: UserType };
        if (result.success && result.user) {
          state.user = result.user;
        }
        state.isLoading = false;
      });

    // register — création de compte
    builder
      .addCase(register.fulfilled, (state, action) => {
        const result = action.payload as AuthResult & { user?: UserType };
        if (result.success && result.user) {
          state.user = result.user;
        }
        state.isLoading = false;
      });

    // logout — déconnexion
    builder
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
      });
  },
});

export default authSlice.reducer;
