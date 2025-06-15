# DuckDB WASM App Demo

A web-based interface for interacting with DuckDB using WebAssembly, compatible with Databricks Apps

## ⚠️ Important Note
This application was primarily developed through vibecoding. While functional, care should be taken when using.

## Unity Catalog

Unity Catalog connection is not currently supported, as the extensions (`delta` and `uc_catalog`) don't have WASM compilations.

An alternative approach could be to utilise warehouse compute for initial loading from UC into DuckDB.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Build for deployment:
```bash
npm run build
npm start
```

## Databricks Apps

Databricks Apps automatically detects the presence of `package.json` and runs `npm run build` then `npm run start`
