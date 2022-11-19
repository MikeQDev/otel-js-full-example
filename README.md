# Effortless Observability In Your NodeJS Apps

## Use this repo to learn how NodeJS apps can be easily instrumented with OpenTelemetry

## Basic Example

### Running locally, sending telemetry to console

1. `npm i`
2. `OTEL_SERVICE_NAME="myService" OTEL_SERVICE_VERSION="0.1.0" node -r ./src/otel/otel-util.js ./src/index.js`

### Running locally, sending telemetry through OTel collector to backends

1. `npm i`
2. `npm run start:docker:containers` # to start OTelCollector + backends
3. `docker logs -f otel-collector` # to watch collector logs
4. `USE_COLLECTOR=Y OTEL_SERVICE_NAME="myService" OTEL_SERVICE_VERSION="0.1.0" node -r ./src/otel/otel-util.js ./src/index.js`
5. Visit below URLs to view metrics and traces
6. When done experimenting, shut down containers with `npm run stop:docker:containers`

URLs:

- OTel GRPC reciever @ localhost:4317 (apps/other collectors send telemetry here)
- OTel Prometheus endpoint @ [localhost:8889/metrics](http://localhost:8889/metrics) (prom scrapes metrics from this endpoint)
- Zipkin Tracing @ [localhost:9411](http://localhost:9411)
- Jaegar Tracing @ [localhost:16686](http://localhost:16686)
- Prometheus Metrics UI @ [localhost:9090](http://localhost:9090)
- Future: Grafana for logs, metrics, and traces?

## Real-World Example

### Project Flow

client.js <--> store.js <--> inventory.js <s><--> SQLite DB</s>

### Setup instructions

Pre-reqs: docker + docker-compose, npm

_Note: if you cannot run docker containers for any reason, you can append :nocollector to the end of below NPM scripts to write to use console exporter instead_

1. `npm i`
2. `npm run start:docker:containers` # starts docker containers (OTel collector + backends)
3. `npm run start:inventory` # starts inventory service on port [21470](http://localhost:21470/products)
4. `npm run start:store` # starts store service on port [21469](http://localhost:21469/)
5. `npm run start:client` # runs only-auto-instrumented client.js to send requests to store

- 5a. `npm run start:instrumentedClient` # runs instrumentedClient.js, which does same as client, but groups entire invocation into a single trace AND captures logs as events in main span (instead of `console.log`s)

6. When done, stop docker containers with `npm run stop:docker:containers` and close terminal sessions running services

## Learning

- View OTel instrumentation configuration file at `./src/otel/otel-util.js`
- Look for any mention of `@opentelemetry/api` in the app source files
- Review collector config file at `docker/config/collector/config.yml`
- Explore autoinstrumentation libraries @ https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node and https://opentelemetry.io/registry/?language=js&component=instrumentation

## Traces

### Propagation

HTTP autoinstumentation uses the w3c `traceparent` header to propagate trace context (e.g.: `traceparent: 00-f9a18b1af2ef4e5528a94447dc14c40c-94cb165768e69f30-01`)

## Metrics

### Thoughts

If you're using serverless technologies from a single cloud provider (e.g.: API GW + Lambda), and need metrics unrelated to your business logic (e.g. status codes), check if your cloud provider offers these metrics for you out out-of-the-box. This can save you some time getting up and running with OTel, so you can focus more of your efforts on implementing reliable tracing

### Calculating SLIs

Prometheus can be used to calculate SLIs from metrics

https://sre.google/workbook/implementing-slos/#calculations-for-slis

e.g.: "99% of individual work requests should complete within \<slo goal\> milliseconds, measured from the client": `histogram_quantile(0.99, rate(workLatency_bucket[7d]))`
