const delayAsync = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default delayAsync;
