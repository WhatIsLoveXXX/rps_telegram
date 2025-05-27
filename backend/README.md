# RPS Telegram Bot Backend

This is the backend server for the Rock Paper Scissors Telegram Bot, built with Express.js and TypeScript.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:

```
PORT=3000
```

## Running the Server

Development mode (with hot reload):

```bash
npm run dev
```

Build the project:

```bash
npm run build
```

Production mode:

```bash
npm start
```

The server will start on port 3000 by default (or the port specified in your .env file).

## Project Structure

- `src/` - TypeScript source files
- `dist/` - Compiled JavaScript files (generated after build)
- `tsconfig.json` - TypeScript configuration
- `nodemon.json` - Nodemon configuration for development

## API Endpoints

- `GET /`: Welcome message
