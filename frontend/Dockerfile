FROM node:18-alpine

WORKDIR /app

ARG VITE_BACKEND_URL
ARG VITE_RECEIVER_ADDRESS

ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_RECEIVER_ADDRESS=$VITE_RECEIVER_ADDRESS

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 4173

#CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173"]
CMD ["sh", "-c", "while :; do sleep 10; done"]