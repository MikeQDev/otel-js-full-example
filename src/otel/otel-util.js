// const opentelemetry = require('@opentelemetry/api'); // API with noops (SDK has implementation)
const { Resource /*, envDetector, processDetector */ } = require('@opentelemetry/resources'); // attaches Resource attributes to telemetry
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions'); // use standard attribute names in telemetry

// Auto instrumentation. See @opentelemetry/auto-instrumentations-node for easier setup
// View available instrumentation libraries @ https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node
// or https://opentelemetry.io/registry/?language=js&component=instrumentation
const { registerInstrumentations } = require('@opentelemetry/instrumentation'); // adds (auto)instrumentation libs
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http'); // HTTP instr, required by express instrumentation
const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express'); // express instrumentation
// sqlite3 instrumentation goes here, once it's available

// Trace dependencies
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node'); // enables (auto)trace instrumentation
const {
  // BatchSpanProcessor,
  SimpleSpanProcessor,
  ConsoleSpanExporter,
} = require('@opentelemetry/sdk-trace-base'); // Span processors from base trace package
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-grpc'); // exports traces over OTLP protocol (eg: to OTEL collector)

// Metric dependencies
const {
  MeterProvider,
  ConsoleMetricExporter,
  PeriodicExportingMetricReader,
} = require('@opentelemetry/sdk-metrics'); // SDK for working with metrics
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-grpc'); // exports metrics over OTLP protocol (eg: to OTEL collector)

// Locally log otel-related issues (eg: issue sending to collector)
const { diag, DiagConsoleLogger, DiagLogLevel, metrics } = require('@opentelemetry/api');
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR);

// DEV or PROD? If production, don't write telemetry to console
const exportOtelCollector = process.env.USE_COLLECTOR === 'Y' || false;
const metricExportIntervalMs = 3000;

// Metrics
const meterProvider = new MeterProvider();
if (exportOtelCollector) {
  meterProvider.addMetricReader(
    new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter(),
      exportIntervalMillis: metricExportIntervalMs,
    })
  );
} else {
  meterProvider.addMetricReader(
    new PeriodicExportingMetricReader({
      exporter: new ConsoleMetricExporter(),
      exportIntervalMillis: metricExportIntervalMs,
    })
  );
}
metrics.setGlobalMeterProvider(meterProvider);

// Traces
const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: process.env.OTEL_SERVICE_NAME,
  [SemanticResourceAttributes.SERVICE_VERSION]: process.env.OTEL_SERVICE_VERSION,
}); // TODO: figure out why OTEL_RESOURCE_ATTRIBUTES are not being honored https://opentelemetry.io/docs/reference/specification/resource/sdk/#specifying-resource-information-via-an-environment-variable
registerInstrumentations({
  instrumentations: [
    new ExpressInstrumentation(),
    new HttpInstrumentation(),
    // sqlite3 instrumentation goes here, once it's available
  ],
});
const traceProvider = new NodeTracerProvider({ resource });
if (exportOtelCollector) {
  traceProvider.addSpanProcessor(new SimpleSpanProcessor(new OTLPTraceExporter())); // Batch export for performance
} else {
  traceProvider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
}
traceProvider.register(); // Register SDK with API

// Logs -- currently not supported? In development phase
