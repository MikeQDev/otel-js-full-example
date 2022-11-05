// Synthetic async service
exports.doWork = async ({ errorRate = 0.2, variableSleepTime = 1000, minSleepTime = 0 } = {}) => {
  if (Math.random() < errorRate) {
    // errorRate% of time, requests should encounter this (i.e.: .2 = 20% errors)
    throw Error('Unexpected failure');
  }
  await new Promise((res) =>
    //e.g.: will sleep for minSleepTime , plus up to an additional variableSleepTime in ms
    setTimeout(res, minSleepTime + Math.random() * variableSleepTime)
  );
};
