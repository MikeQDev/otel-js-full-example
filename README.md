# Effortless Observability In Your NodeJS Apps

## Use this repo to learn how NodeJS apps can be easily instrumented with OpenTelemetry

### Project Flow

client.js <--> store.js <--> inventory.js <--> SQLite DB

## Running locally, sending telemetry to console

1. `npm i`
2. `OTEL_SERVICE_NAME="myService" OTEL_SERVICE_VERSION="0.1.0" node -r ./src/otel/otel-util.js ./src/index.js`

## Running locally, sending telemetry through OTel collector to backends

1. `npm i`
2. `cd docker/ && docker-compose up -d && cd ..` # to start OTelCollector + backends
3. `docker logs -f otel-collector` # to watch collector logs
4. `USE_COLLECTOR=Y OTEL_SERVICE_NAME="myService" OTEL_SERVICE_VERSION="0.1.0" node -r ./src/otel/otel-util.js ./src/index.js`
5. Visit below URLs to view metrics and traces

URLs:

- OTel GRPC reciever @ localhost:4317 (apps/other collectors send telemetry here)
- OTel Prometheus endpoint @ [localhost:8889/metrics](http://localhost:8889/metrics) (prom scrapes metrics from this endpoint)
- Zipkin Tracing @ [localhost:9411](http://localhost:9411)
- Jaegar Tracing @ [localhost:16686](http://localhost:16686)
- Prometheus Metrics UI @ [localhost:9090](http://localhost:9090)
- Future: Grafana for logs, metrics, and traces?

## Learning

- View OTel instrumentation configuration file at `./src/otel/otel-util.js`
- Look for any mention of `@opentelemetry/api` in the app source files

## Calculating SLIs

Prometheus can be used to calculate SLIs from metrics

https://sre.google/workbook/implementing-slos/#calculations-for-slis

e.g.: "99% of individual work requests should complete within \<slo goal\> milliseconds, measured from the client": `histogram_quantile(0.99, rate(workLatency_bucket[7d]))`
