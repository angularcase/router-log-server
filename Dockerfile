# Etap 1: Budowanie aplikacji
FROM node:18 AS builder

# Ustawienie katalogu roboczego
WORKDIR /app

# Kopiowanie plików package.json oraz package-lock.json (jeśli istnieje)
COPY package*.json ./

# Instalacja zależności
RUN npm install

# Kopiowanie pozostałych plików projektu (w tym folder assets)
COPY . .

# Budowanie aplikacji (domyślnie buduje do katalogu dist)
RUN npm run build

# Etap 2: Obraz produkcyjny
FROM node:18-alpine

# Ustawienie katalogu roboczego
WORKDIR /app

# Kopiowanie plików package.json i package-lock.json
COPY package*.json ./

# Instalacja tylko zależności produkcyjnych
RUN npm install --production

# Kopiowanie zbudowanej aplikacji z etapu buildera
COPY --from=builder /app/dist ./dist

# Deklaracja folderu assets jako volume
VOLUME ["/app/assets"]

# Eksponowanie portów
EXPOSE 3535
EXPOSE 1514/udp

# Komenda startowa
CMD ["node", "dist/main"]