# Menggunakan image Node.js sebagai base image
FROM node:18-alpine

# Set working directory di dalam container
WORKDIR /app

# Menyalin package.json dan package-lock.json (jika ada)
COPY package*.json ./

# Install dependencies (jika ada)
RUN npm install

# Menyalin semua file frontend ke dalam container
COPY . .

# Mengatur perintah untuk menjalankan server (misalnya menggunakan http-server)
RUN npm install -g http-server

# Menyediakan port untuk diakses
EXPOSE 8080

# Perintah untuk menjalankan server (gunakan script "start" dari package.json jika ada)
CMD ["http-server", ".", "-p", "8080"]
