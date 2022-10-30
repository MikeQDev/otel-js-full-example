// Synthetic async service
exports.doWork = async () => {
  if (Math.random() < 0.2) {
    // ~20% of requests should encounter this
    throw Error('Unexpected failure');
  }
  await new Promise((res) => setTimeout(res, Math.random() * 1000));
};
