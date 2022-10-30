const { metrics } = require('@opentelemetry/api-metrics');

const counter = metrics.getMeter('default').createCounter('reqCount');

console.log('Doing work and incrementing...');
counter.add(1, { someAttribute: 'someValue' });
counter.add(2, { someAttribute: 'someValue' });
console.log('Done doing work');

setTimeout(() => console.log('bye'), 4000); // 4000ms timeout to allow exporters to finish. Lifecycle hooks in FaaS should remove this concern
