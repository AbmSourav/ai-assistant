FROM node:22.21

# install ollama CLI
RUN curl -fsSL https://ollama.com/install.sh | sh
RUN ollama 

RUN mkdir -p /app

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

CMD ["ollama", "pull", "embeddinggemma:300m"]
