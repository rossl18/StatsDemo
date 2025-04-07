/********************************************************
 * DEMO #1: CLT (Coin Flips)
 ********************************************************/
let sampleMeansCLT = [];

const sampleSizeCLT   = document.getElementById("sample-size-clt");
const numSamplesCLT   = document.getElementById("num-samples-clt");
const addSamplesBtnCLT = document.getElementById("add-samples-btn-clt");
const resetBtnCLT     = document.getElementById("reset-btn-clt");
const chartCLT        = document.getElementById("chart-clt");

// Flip n coins, return fraction of heads
function simulateCoinFlipMean(n) {
  let headsCount = 0;
  for (let i = 0; i < n; i++) {
    if (Math.random() < 0.5) headsCount++;
  }
  return headsCount / n;
}

// Add multiple samples
function addSamplesCLT() {
  const n = parseInt(sampleSizeCLT.value, 10);
  const numSamples = parseInt(numSamplesCLT.value, 10);

  for (let i = 0; i < numSamples; i++) {
    sampleMeansCLT.push(simulateCoinFlipMean(n));
  }
  plotCLT();
}

// Plot the histogram + normal
function plotCLT() {
  const n = parseInt(sampleSizeCLT.value, 10);

  // Histogram trace
  const histTrace = {
    x: sampleMeansCLT,
    type: 'histogram',
    name: 'Sample Means',
    histnorm: 'probability density',
    marker: { line: { width: 1, color: 'black' } },
    opacity: 0.7
  };

  // Normal curve
  const mean = 0.5;
  const stdev = 0.5 / Math.sqrt(n);
  const xVals = [];
  const yVals = [];
  const steps = 100;
  for (let i = 0; i < steps; i++) {
    const x = 0 + i * (1 - 0) / (steps - 1); // from 0 to 1
    xVals.push(x);
    const pdf = (1 / (stdev * Math.sqrt(2 * Math.PI))) *
                Math.exp(-((x - mean)**2) / (2 * stdev * stdev));
    yVals.push(pdf);
  }
  const normalTrace = {
    x: xVals,
    y: yVals,
    mode: 'lines',
    type: 'scatter',
    name: 'Normal Approx',
    line: { color: 'red' }
  };

  const layout = {
    title: `CLT Demo: n=${n}, samples=${sampleMeansCLT.length}`,
    xaxis: { title: 'Sample Mean (#Heads / n)' },
    yaxis: { title: 'Probability Density' },
    bargap: 0.02
  };

  Plotly.newPlot(chartCLT, [histTrace, normalTrace], layout);
}

// Reset
function resetCLT() {
  sampleMeansCLT = [];
  plotCLT();
}

// Hook up
addSamplesBtnCLT.addEventListener("click", addSamplesCLT);
resetBtnCLT.addEventListener("click", resetCLT);
plotCLT();  // initial empty plot

/********************************************************
 * DEMO #2: Interactive Linear Regression
 ********************************************************/
let xDataReg = [];
let yDataReg = [];

const xInputReg      = document.getElementById("x-input-reg");
const yInputReg      = document.getElementById("y-input-reg");
const addPointBtnReg = document.getElementById("add-point-btn-reg");
const resetBtnReg    = document.getElementById("reset-btn-reg");
const chartReg       = document.getElementById("chart-regression");
const statsReg       = document.getElementById("stats-regression");

// Add (x, y) point from inputs
function addPointRegression() {
  const xVal = parseFloat(xInputReg.value);
  const yVal = parseFloat(yInputReg.value);
  if (!isNaN(xVal) && !isNaN(yVal)) {
    xDataReg.push(xVal);
    yDataReg.push(yVal);
    plotRegression();
  }
}

// Compute slope, intercept, MSE, R²
function computeRegression(xArr, yArr) {
  const n = xArr.length;
  if (n < 2) return null; // need 2+ points

  const meanX = xArr.reduce((a, b) => a + b, 0) / n;
  const meanY = yArr.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < n; i++) {
    const dx = xArr[i] - meanX;
    const dy = yArr[i] - meanY;
    numerator   += dx * dy;
    denominator += dx * dx;
  }
  const slope = (denominator === 0) ? 0 : numerator / denominator;
  const intercept = meanY - slope * meanX;

  // MSE, R²
  let ssRes = 0, ssTot = 0;
  for (let i = 0; i < n; i++) {
    const yPred = slope * xArr[i] + intercept;
    ssRes += (yArr[i] - yPred) ** 2;
    ssTot += (yArr[i] - meanY) ** 2;
  }
  const mse = ssRes / n;
  const r2  = (ssTot === 0) ? 1 : 1 - (ssRes / ssTot);

  return { slope, intercept, mse, r2 };
}

// Plot data + regression line
function plotRegression() {
  // Data points
  const scatterTrace = {
    x: xDataReg,
    y: yDataReg,
    mode: 'markers',
    type: 'scatter',
    name: 'Data Points'
  };

  const result = computeRegression(xDataReg, yDataReg);
  let lineTrace = {};
  if (result) {
    const { slope, intercept, mse, r2 } = result;
    const minX = Math.min(...xDataReg);
    const maxX = Math.max(...xDataReg);
    const lineX = [minX, maxX];
    const lineY = [slope * minX + intercept, slope * maxX + intercept];

    lineTrace = {
      x: lineX,
      y: lineY,
      mode: 'lines',
      type: 'scatter',
      name: 'Best Fit',
      line: { color: 'red' }
    };

    statsReg.innerHTML = `
      <b>Slope (m):</b> ${slope.toFixed(3)}<br/>
      <b>Intercept (b):</b> ${intercept.toFixed(3)}<br/>
      <b>MSE:</b> ${mse.toFixed(3)}<br/>
      <b>R²:</b> ${r2.toFixed(3)}
    `;
  } else {
    statsReg.innerHTML = "Need at least 2 points to compute regression.";
  }

  const layout = {
    title: 'Interactive Linear Regression',
    xaxis: { title: 'X' },
    yaxis: { title: 'Y' }
  };

  Plotly.newPlot(chartReg, [scatterTrace, lineTrace], layout);
}

// Reset regression
function resetRegression() {
  xDataReg = [];
  yDataReg = [];
  statsReg.innerHTML = "";
  plotRegression();
}

// Wire up
addPointBtnReg.addEventListener("click", addPointRegression);
resetBtnReg.addEventListener("click", resetRegression);
plotRegression();

/********************************************************
 * DEMO #3: Binomial -> Poisson Convergence
 ********************************************************/
const nBinomPois      = document.getElementById("n-binom-pois");
const pBinomPois      = document.getElementById("p-binom-pois");
const plotBinomPoisBtn= document.getElementById("plot-binom-pois-btn");
const chartBinomPois  = document.getElementById("chart-binom-poisson");

// Factorial & choose
function factorial(num) {
  if (num < 0) return NaN;
  let result = 1;
  for (let i = 1; i <= num; i++) {
    result *= i;
  }
  return result;
}
function choose(n, k) {
  return factorial(n) / (factorial(k) * factorial(n - k));
}
function binomialPMF(k, n, p) {
  return choose(n, k) * p**k * (1 - p)**(n - k);
}
function poissonPMF(k, lambda) {
  return (lambda**k * Math.exp(-lambda)) / factorial(k);
}

function plotBinomPoisson() {
  const n = parseInt(nBinomPois.value, 10);
  const p = parseFloat(pBinomPois.value);
  if (isNaN(n) || isNaN(p) || n < 1 || p < 0 || p > 1) return;

  const lambda = n * p;
  // We'll define k up to either n or ~some region around lambda
  const maxK = Math.min(n, Math.floor(lambda + 4 * Math.sqrt(lambda) + 10));
  const kVals = [];
  const binVals = [];
  const poiVals = [];

  for (let k = 0; k <= maxK; k++) {
    kVals.push(k);
    binVals.push(binomialPMF(k, n, p));
    poiVals.push(poissonPMF(k, lambda));
  }

  // binomial trace
  const binTrace = {
    x: kVals,
    y: binVals,
    type: 'bar',
    name: `Binomial(n=${n}, p=${p})`,
    marker: { line: { width: 1, color: 'black' } },
    opacity: 0.6
  };
  // poisson trace
  const poisTrace = {
    x: kVals,
    y: poiVals,
    mode: 'lines+markers',
    type: 'scatter',
    name: `Poisson(λ=${lambda.toFixed(2)})`,
    line: { color: 'red' }
  };

  const layout = {
    title: `Binomial vs Poisson (λ = ${lambda.toFixed(2)})`,
    xaxis: { title: 'k' },
    yaxis: { title: 'Probability' },
    barmode: 'overlay'
  };

  Plotly.newPlot(chartBinomPois, [binTrace, poisTrace], layout);
}

plotBinomPoisBtn.addEventListener("click", plotBinomPoisson);
plotBinomPoisson(); // initial plot


