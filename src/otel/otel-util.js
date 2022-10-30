// const opentelemetry = require('@opentelemetry/api'); // API with noops (SDK has implementation)
// const { Resource, envDetector, processDetector } = require('@opentelemetry/resources'); // attaches Resource attributes to telemetry
// const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions'); // use standard attribute names in telemetry

// Auto instrumentation. See @opentelemetry/auto-instrumentations-node for easier setup
// const { registerInstrumentations } = require('@opentelemetry/instrumentation'); // adds (auto)instrumentation libs
// const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http'); // HTTP instr, required by express instrumentation
// const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express'); // express instrumentation

// Trace dependencies
/*const {
  NodeTracerProvider,
  BatchSpanProcessor,
  SimpleSpanProcessor,
  ConsoleSpanExporter,
} = require('@opentelemetry/sdk-trace-node'); // enables (auto)trace instrumentation
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-grpc'); // exports traces over OTLP protocol (eg: to OTEL collector)
*/

// Metric dependencies
const { metrics } = require('@opentelemetry/api-metrics'); // metrics API, use until stable/merged into @opentelemetrry/api
const {
  MeterProvider,
  ConsoleMetricExporter,
  PeriodicExportingMetricReader,
} = require('@opentelemetry/sdk-metrics'); // SDK for working with metrics
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-grpc'); // exports metrics over OTLP protocol (eg: to OTEL collector)

// Locally log otel-related issues (eg: issue sending to collector)
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR);

// DEV or PROD? If production, don't write telemetry to console
const exportOtelCollector = false;
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

// Logs -- currently not supported? In development phase
