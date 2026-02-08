// Modèle d'un utilisateur
export interface UserType {
  id: string;
  name: string;
  email: string;
  isCreator: boolean;
  role: 'ADMIN' | 'USER';
  createdAt: string;
  updatedAt: string;
}

// Interface d'un contexte Auth
export interface AuthContextType {
  user: UserType | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string; message?: string }>;
  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshTokens: () => Promise<boolean>;
}
