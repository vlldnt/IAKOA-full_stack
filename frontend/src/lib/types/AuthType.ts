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

