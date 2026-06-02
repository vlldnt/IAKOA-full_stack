import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { UserType } from '@/lib/types/AuthType';
import { isValidUser } from '@/utils/validators';
import { ApiError } from '@/lib/services/apiClient';
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
  user?: UserType;
}

// ── État initial ─────────────────────────────────────────────────────────────

const initialState: AuthState = {
  user: null,
  isLoading: true,
};

// ── Thunks asynchrones ───────────────────────────────────────────────────────

// Charge l'utilisateur courant au démarrage à partir du cookie de session.
// Le rafraîchissement automatique du token (sur 401) est géré par le client API.
export const refreshUser = createAsyncThunk<UserType | null>(
  'auth/refreshUser',
  async () => {
    try {
      return await authService.getUserAPI();
    } catch {
      // Non authentifié ou session expirée : aucun utilisateur courant.
      return null;
    }
  }
);

// Connecte l'utilisateur (les cookies de session sont posés par le serveur)
export const login = createAsyncThunk<AuthResult, { email: string; password: string }>(
  'auth/login',
  async ({ email, password }) => {
    try {
      const data = await authService.loginAPI(email, password);
      return {
        success: true,
        message: `${data.user.name} bien connecté.`,
        user: data.user,
      };
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Problème de réseau.';
      return { success: false, error: message };
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
      const data = await authService.registerAPI(name, email, password);
      return {
        success: true,
        message: `${data.user.name}, votre compte a été créé avec succès.`,
        user: data.user,
      };
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Impossibilité de créer un compte.';
      return { success: false, error: message };
    }
  }
);

// Déconnecte l'utilisateur (le serveur invalide le refresh token et efface les cookies)
export const logout = createAsyncThunk<void>(
  'auth/logout',
  async () => {
    try {
      await authService.logoutAPI();
    } catch {
      // La déconnexion locale doit aboutir même si l'appel réseau échoue.
    }
  }
);

// ── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    updateAuthUser(state, action: { payload: UserType }) {
      state.user = action.payload;
    },
  },
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

export const { updateAuthUser } = authSlice.actions;
export default authSlice.reducer;
