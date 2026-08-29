# =========================================================
#  Étape commune : dépendances
# =========================================================

FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./
RUN npm ci


# =========================================================
#  Développement : serveur Vite + rechargement à chaud
#
#  Utilisé via docker-compose.dev.yml (target: dev).
# =========================================================

FROM base AS dev

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]


# =========================================================
#  Construction du site
#
#  VITE_BACKEND_URL est figée ICI, au moment du build :
#  si l'URL du backend change, il faut reconstruire l'image
#  (docker compose build / up --build).
# =========================================================

FROM base AS build

COPY . .

ARG VITE_BACKEND_URL=http://localhost:5000
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}

RUN npm run build


# =========================================================
#  Production : fichiers statiques servis par nginx
#
#  Vite nomme les fichiers avec une empreinte de leur
#  contenu (index-DD_ZxyMl.css) : une nouvelle version
#  porte un nouveau nom, donc aucun cache ne peut servir
#  une ancienne feuille de style.
# =========================================================

FROM nginx:1.27-alpine AS production

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]
