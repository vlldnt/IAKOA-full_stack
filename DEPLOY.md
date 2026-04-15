# Déploiement de l'application IAKOA

## 1. Connexion au VPS

``` bash
docker context use vps
ssh vps
```

------------------------------------------------------------------------

## 2. Stack Docker sur le VPS

Nom de la stack : **iakoa-webapp**

### Conteneurs :

-   frontend-iakoa
-   backend-iakoa
-   postgresql-iakoa

⚠️ Vérifier les ports : S'assurer qu'il n'y a **aucun conflit** avec
d'autres conteneurs Docker déjà présents sur le VPS.

------------------------------------------------------------------------

## 3. Configuration Nginx

Fichier à modifier :

    /etc/nginx/sites-available/vieilledent.eu

### À vérifier :

-   La route `/iakoa-web`
-   Elle doit pointer vers le frontend

### Objectif :

Permettre l'accès via : 👉 https://vieilledent.eu

------------------------------------------------------------------------

## 4. Base de données

-   La base de données est actuellement **réinitialisée (vide)**

------------------------------------------------------------------------

## 5. Déploiement

1.  Build des images
2.  Lancer les conteneurs
3.  Vérifier le bon fonctionnement

------------------------------------------------------------------------

## 6. Étape future

-   Exporter la base de données locale
-   Copier sur le VPS
-   Importer dans le conteneur PostgreSQL
