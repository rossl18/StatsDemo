/*****************************************************
 * DEMO #1: CLT (Coin Flips)
 *****************************************************/
// We'll store the sample means in an array
let sampleMeans = [];

// Grab references to the CLT controls
const sampleSizeInput  = document.getElementById("sample-size");
const numSamplesInput  = document.getElementById("num-samples");
const addSamplesBtn    = document.getElementById("add-samples-btn");
const resetBtn         = document.getElementById("reset-btn");
const chartDiv         = document.getElementById("chart");

// 1) Simulate flipping n coins and return fraction of heads
function simulateCoinFlipMean(n) {
  let headsCount = 0;
  for (let i = 0; i < n; i++) {
    if (Math.random() < 0.5) headsCount++;
  }
  return headsCount / n;
}

// 2) Add multiple samples
function addSamples() {
  const n = parseInt(sampleSizeInput.value, 10);
  const howMany = parseInt(numSamplesInput.value, 10);

  for (let i = 0; i < howMany; i++) {
    sampleMeans.push(simulateCoinFlipMean(n));
  }
  plotCLT();
}

// 3) Plot histogram + normal curve
function plotCLT() {
  const n = parseInt(sampleSizeInput.value, 10);

  // HISTOGRAM trace
  const histTrace = {
    x: sampleMeans,
    type: 'histogram',
    name: 'Sample Means',
    histnorm: 'probability density',
    opacity: 0.7,
    marker: {
      line: { width: 1, color: 'black' }
    }
  };

  // Theoretical normal curve: mean=0.5, std=0.5/sqrt(n)
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
    type: 'scatter',
    mode: 'lines',
    name: 'Normal Approx',
    line: { color: 'red' }
  };

  const layout = {
    title: `CLT Demo (n=${n}, samples=${sampleMeans.length})`,
    xaxis: { title: 'Sample Mean (#Heads / n)' },
    yaxis: { title: 'Probability Density' },
    bargap: 0.02
  };

  Plotly.newPlot(chartDiv, [histTrace, normalTrace], layout);
}

// 4) Reset
function resetData() {
  sampleMeans = [];
  plotCLT();
}

// Wire up the CLT buttons
addSamplesBtn.addEventListener('click', addSamples);
resetBtn.addEventListener('click', resetData);

// Initial empty plot
plotCLT();


/*****************************************************
 * DEMO #2: Interactive Linear Regression
 *****************************************************/
let xDataReg = [];
let yDataReg = [];

// Grab references
const xInputReg       = document.getElementById("x-input-reg");
const yInputReg       = document.getElementById("y-input-reg");
const addPointBtnReg  = document.getElementById("add-point-btn-reg");
const resetBtnReg     = document.getElementById("reset-btn-reg");
const chartRegression = document.getElementById("chart-regression");
const statsReg        = document.getElementById("stats-regression");

// Add a new (x, y) point
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
  if (n < 2) return null;

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

  // MSE & R²
  let ssRes = 0, ssTot = 0;
  for (let i = 0; i < n; i++) {
    const yPred = slope * xArr[i] + intercept;
    ssRes += (yArr[i] - yPred) ** 2;
    ssTot += (yArr[i] - meanY) ** 2;
  }
  const mse = ssRes / n;
  const r2 = (ssTot === 0) ? 1 : 1 - (ssRes / ssTot);

  return { slope, intercept, mse, r2 };
}

// Plot the scatter + best-fit line
function plotRegression() {
  // Data points
  const scatterTrace = {
    x: xDataReg,
    y: yDataReg,
    mode: 'markers',
    type: 'scatter',
    name: 'Data'
  };

  const result = computeRegression(xDataReg, yDataReg);
  let lineTrace = {};
  if (result) {
    const { slope, intercept, mse, r2 } = result;
    // line from minX to maxX
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
    statsReg.innerHTML = "Need at least 2 points for regression.";
  }

  const layout = {
    title: 'Linear Regression',
    xaxis: { title: 'X' },
    yaxis: { title: 'Y' }
  };

  Plotly.newPlot(chartRegression, [scatterTrace, lineTrace], layout);
}

// Reset
function resetRegression() {
  xDataReg = [];
  yDataReg = [];
  statsReg.innerHTML = "";
  plotRegression();
}

// Wire up
addPointBtnReg.addEventListener('click', addPointRegression);
resetBtnReg.addEventListener('click', resetRegression);
plotRegression();


/*****************************************************
 * DEMO #3: Binomial -> Poisson
 *****************************************************/
const nBinomPois       = document.getElementById("n-binom-pois");
const pBinomPois       = document.getElementById("p-binom-pois");
const plotBinomPoisBtn = document.getElementById("plot-binom-pois-btn");
const chartBinomPois   = document.getElementById("chart-binom-poisson");

// Factorial & choose for binomial
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
  return choose(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
}
function poissonPMF(k, lambda) {
  return Math.pow(lambda, k) * Math.exp(-lambda) / factorial(k);
}

function plotBinomPoisson() {
  const nVal = parseInt(nBinomPois.value, 10);
  const pVal = parseFloat(pBinomPois.value);
  if (isNaN(nVal) || isNaN(pVal) || nVal < 1 || pVal < 0 || pVal > 1) return;

  const lambda = nVal * pVal;
  // We'll define k up to nVal, but let's also limit
  const maxK = Math.min(nVal, Math.floor(lambda + 4 * Math.sqrt(lambda) + 10));
  const kVals = [];
  const binVals = [];
  const poiVals = [];

  for (let k = 0; k <= maxK; k++) {
    kVals.push(k);
    binVals.push(binomialPMF(k, nVal, pVal));
    poiVals.push(poissonPMF(k, lambda));
  }

  const binTrace = {
    x: kVals,
    y: binVals,
    type: 'bar',
    name: `Binomial(n=${nVal}, p=${pVal})`,
    opacity: 0.6,
    marker: { line: { width: 1, color: 'black' } }
  };

  const poisTrace = {
    x: kVals,
    y: poiVals,
    mode: 'lines+markers',
    type: 'scatter',
    name: `Poisson(λ=${lambda.toFixed(2)})`,
    line: { color: 'red' }
  };

  const layout = {
    title: `Binomial vs. Poisson (λ=${lambda.toFixed(2)})`,
    xaxis: { title: 'k' },
    yaxis: { title: 'Probability' },
    barmode: 'overlay'
  };

  Plotly.newPlot(chartBinomPois, [binTrace, poisTrace], layout);
}

// Wire up
plotBinomPoisBtn.addEventListener('click', plotBinomPoisson);
plotBinomPoisson(); // initial draw

