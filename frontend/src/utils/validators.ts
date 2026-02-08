// Fonctions de validation pour les formulaires d'authentification

// Email: format standard avec regex
export const isValidEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Nom: 2-30 caractères (lettres, espaces, tirets, apostrophes)
export const isValidName = (name: string): boolean => {
  const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿĀ-žḀ-ỿ\s\-']{2,30}$/;
  return nameRegex.test(name.trim());
};

// Mot de passe: critères individuels (8+ caractères, majuscule, chiffre, spécial)
export const passwordChecks = {
  minLength: (password: string) => password.length >= 8,
  hasUppercase: (password: string) => /[A-Z]/.test(password),
  hasDigit: (password: string) => /[0-9]/.test(password),
  hasSpecialChar: (password: string) => /[!@#$%^&*()_\-+={}[\]|\\:;"'<>,.?/~`]/.test(password),
};

export const isValidPassword = (password: string): boolean => {
  return (
    passwordChecks.minLength(password) &&
    passwordChecks.hasUppercase(password) &&
    passwordChecks.hasDigit(password) &&
    passwordChecks.hasSpecialChar(password)
  );
};

// Validation complète des données utilisateur (nom, email, mot de passe)
export const isValidUser = (
  name: string,
  email: string,
  password: string,
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!isValidName(name)) {
    errors.push('Nom invalide (1-30 caractères, lettres uniquement)');
  }
  if (!isValidEmail(email)) {
    errors.push('Email invalide');
  }
  if (!isValidPassword(password)) {
    errors.push('Mot de passe invalide (8+ caractères, majuscule, chiffre, caractère spécial)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

// Vérifie que les deux mots de passe correspondent
export const comparePasswords = (password: string, verifPasswords: string): boolean => {
  return password === verifPasswords;
}
