# Effortless Observability In Your NodeJS Apps

## Use this repo to learn how NodeJS apps can be easily instrumented with OpenTelemetry

### Project Flow

client.js <--> store.js <--> inventory.js <--> SQLite DB

## Running

1. `npm i`
2. `node -r ./src/otel/otel-util.js ./src/index.js`

## Learning

- View OTel instrumentation configuration file at `./src/otel/otel-util.js`
- Look for any mention of `@opentelemetry/api` in the app source files
