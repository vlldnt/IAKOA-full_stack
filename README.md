# IAKOA

IAKOA est une application web qui permet de découvrir, créer et gérer des événements locaux de manière simple, visuelle et communautaire. Ce dépôt contient une API **NestJS** (Node.js) et un frontend **React** stylé avec **TailwindCSS**, connectés à une base de données **PostgreSQL**.

---

## Fonctionnalités

- Découverte d’événements locaux par carte ou liste (sorties, rencontres, événements communautaires).
- Création et gestion d’événements (titre, description, lieu, date, capacité, visibilité).
- Système de comptes utilisateurs (authentification, profil, événements créés/participés).
- Filtrage et recherche (par ville, date, catégorie).
- Interface responsive avec TailwindCSS, pensée pour desktop et mobile.

---

## Stack technique

- Backend : NestJS (Node.js, TypeScript), architecture modulaire, REST API.
- Frontend : React (TypeScript), gestion d’état via hooks/custom hooks.
- UI : TailwindCSS pour le style utilitaire et la mise en page responsive.
- Base de données : PostgreSQL pour le stockage persistant des utilisateurs et événements.
- Outils : ESLint, Prettier, scripts npm pour le développement et la production.

---

## Prérequis

- Node.js 18+ installé sur la machine.
- PostgreSQL 13+ ou instance managée (local ou cloud).
- npm  pour la gestion des dépendances.
- Optionnel : Docker si vous utilisez une stack conteneurisée.

---

## Installation

Cloner le dépôt :

```bash
git clone https://github.com/ton-compte/IAKOA-full_stack.git
cd IAKOA-full_stack
```
