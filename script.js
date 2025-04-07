/**********************************************
 * 1) CLT DEMO (Coin Flips)
 **********************************************/
let sampleMeansCLT = [];

// Grab references for CLT section
const chartCLT = document.getElementById("chart-clt");
const sampleSizeCLT = document.getElementById("sample-size-clt");
const numSamplesCLT = document.getElementById("num-samples-clt");
const addSamplesBtnCLT = document.getElementById("add-samples-btn-clt");
const resetBtnCLT = document.getElementById("reset-btn-clt");

// Coin flip function: returns fraction of heads
function simulateCoinFlipMean(n) {
  let headsCount = 0;
  for (let i = 0; i < n; i++) {
    // 50% chance for heads
    if (Math.random() < 0.5) headsCount++;
  }
  return headsCount / n;
}

// Add multiple samples and replot
function addSamplesCLT() {
  const n = parseInt(sampleSizeCLT.value, 10);
  const count = parseInt(numSamplesCLT.value, 10);

  for (let i = 0; i < count; i++) {
    sampleMeansCLT.push(simulateCoinFlipMean(n));
  }
  plotCLT();
}

// Plot histogram + normal curve
function plotCLT() {
  const n = parseInt(sampleSizeCLT.value, 10);

  // 1) histogram of sample means
  const histTrace = {
    x: sampleMeansCLT,
    type: 'histogram',
    name: 'Sample Means',
    opacity: 0.7,
    histnorm: 'probability density',
    marker: { line: { width: 1, color: 'black' } }
  };

  // 2) theoretical normal
  const mean = 0.5;
  const stdev = 0.5 / Math.sqrt(n);
  const xVals = [];
  const yVals = [];
  const xMin = 0, xMax = 1, steps = 100;
  for (let i = 0; i < steps; i++) {
    const x = xMin + i * (xMax - xMin) / (steps - 1);
    xVals.push(x);
    // Normal PDF
    const pdf = (1 / (stdev * Math.sqrt(2 * Math.PI))) *
      Math.exp(-Math.pow(x - mean, 2) / (2 * stdev * stdev));
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
    title: `CLT Demo (n=${n}, samples=${sampleMeansCLT.length})`,
    xaxis: { title: 'Mean #Heads / n' },
    yaxis: { title: 'Probability Density' },
    bargap: 0.02
  };

  Plotly.newPlot(chartCLT, [histTrace, normalTrace], layout);
}

// Reset the data
function resetCLT() {
  sampleMeansCLT = [];
  plotCLT();
}

// Wire up buttons
addSamplesBtnCLT.addEventListener('click', addSamplesCLT);
resetBtnCLT.addEventListener('click', resetCLT);

// Initial empty plot
plotCLT();

/**********************************************
 * 2) Interactive Linear Regression
 **********************************************/
let xDataReg = [];
let yDataReg = [];

// Grab references for regression
const chartReg = document.getElementById("chart-regression");
const xInputReg = document.getElementById("x-input-reg");
const yInputReg = document.getElementById("y-input-reg");
const addPointBtnReg = document.getElementById("add-point-btn-reg");
const resetBtnReg = document.getElementById("reset-btn-reg");
const statsReg = document.getElementById("stats-regression");

// Add a point from input fields
function addPointRegression() {
  const xVal = parseFloat(xInputReg.value);
  const yVal = parseFloat(yInputReg.value);
  if (!isNaN(xVal) && !isNaN(yVal)) {
    xDataReg.push(xVal);
    yDataReg.push(yVal);
    plotRegression();
  }
}

// Compute linear regression (slope, intercept, MSE, R²)
function computeRegression(xArr, yArr) {
  const n = xArr.length;
  if (n < 2) return null; // need at least 2 points

  // means
  const meanX = xArr.reduce((a, b) => a + b, 0) / n;
  const meanY = yArr.reduce((a, b) => a + b, 0) / n;

  // slope = Cov(x,y) / Var(x)
  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < n; i++) {
    const dx = xArr[i] - meanX;
    const dy = yArr[i] - meanY;
    numerator += dx * dy;
    denominator += dx * dx;
  }
  const slope = denominator === 0 ? 0 : numerator / denominator;
  const intercept = meanY - slope * meanX;

  // MSE and R²
  let ssRes = 0; // sum of squares of residuals
  let ssTot = 0; // total sum of squares
  for (let i = 0; i < n; i++) {
    const yPred = slope * xArr[i] + intercept;
    ssRes += Math.pow(yArr[i] - yPred, 2);
    ssTot += Math.pow(yArr[i] - meanY, 2);
  }
  const mse = ssRes / n;
  const r2 = (ssTot === 0) ? 1 : (1 - ssRes / ssTot);

  return { slope, intercept, mse, r2 };
}

// Plot the points and regression line
function plotRegression() {
  // Points
  const scatterTrace = {
    x: xDataReg,
    y: yDataReg,
    mode: 'markers',
    type: 'scatter',
    name: 'Data Points'
  };

  // Compute regression
  const result = computeRegression(xDataReg, yDataReg);
  let lineTrace = {};
  if (result) {
    const { slope, intercept, mse, r2 } = result;
    
    // Create a line from min(x) to max(x)
    const minX = Math.min(...xDataReg);
    const maxX = Math.max(...xDataReg);
    const lineX = [minX, maxX];
    const lineY = [slope * minX + intercept, slope * maxX + intercept];

    lineTrace = {
      x: lineX,
      y: lineY,
      mode: 'lines',
      type: 'scatter',
      name: 'Regression Line',
      line: { color: 'red' }
    };

    // Display stats
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
    title: 'Linear Regression Demo',
    xaxis: { title: 'X' },
    yaxis: { title: 'Y' }
  };

  Plotly.newPlot(chartReg, [scatterTrace, lineTrace], layout);
}

// Reset regression data
function resetRegression() {
  xDataReg = [];
  yDataReg = [];
  statsReg.innerHTML = "";
  plotRegression();
}

// Wire up
addPointBtnReg.addEventListener('click', addPointRegression);
resetBtnReg.addEventListener('click', resetRegression);

// Initial empty plot
plotRegression();

/**********************************************
 * 3) Binomial -> Poisson
 **********************************************/
// Grab references
const chartBinomPois = document.getElementById("chart-binom-poisson");
const nBinomPois = document.getElementById("n-binom-pois");
const pBinomPois = document.getElementById("p-binom-pois");
const plotBtnBinomPois = document.getElementById("plot-binom-pois-btn");

// Basic factorial & choose for binomial pmf
function factorial(num) {
  if (num < 0) return NaN;
  if (num === 0) return 1;
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

// Plot binomial PMF vs. Poisson PMF
function plotBinomPoisson() {
  const nVal = parseInt(nBinomPois.value, 10);
  const pVal = parseFloat(pBinomPois.value);
  if (isNaN(nVal) || isNaN(pVal) || nVal < 1 || pVal < 0 || pVal > 1) return;

  const lambda = nVal * pVal;

  // We'll define k from 0 up to a max that covers ~most of the distribution
  // For binomial, the max is nVal, but let's not always go that far if lambda is small
  const maxK = Math.min(nVal, Math.floor(lambda + 4 * Math.sqrt(lambda) + 10));
  const kValues = [];
  const binomVals = [];
  const poisVals = [];

  for (let k = 0; k <= maxK; k++) {
    kValues.push(k);
    binomVals.push(binomPMF(k, nVal, pVal));
    poisVals.push(poissonPMF(k, lambda));
  }

  // 1) binomial trace (bars)
  const binomTrace = {
    x: kValues,
    y: binomVals,
    type: 'bar',
    name: 'Binomial PMF',
    opacity: 0.7,
    marker: { line: { width: 1, color: 'black' } }
  };

  // 2) Poisson trace (line)
  const poisTrace = {
    x: kValues,
    y: poisVals,
    mode: 'lines+markers',
    type: 'scatter',
    name: `Poisson(λ=${lambda.toFixed(2)})`,
    line: { color: 'red' }
  };

  const layout = {
    title: `Binomial(n=${nVal}, p=${pVal}) vs Poisson(λ=${lambda.toFixed(2)})`,
    xaxis: { title: 'k' },
    yaxis: { title: 'Probability' },
    barmode: 'overlay'
  };

  Plotly.newPlot(chartBinomPois, [binomTrace, poisTrace], layout);
}

// Wire up
plotBtnBinomPois.addEventListener('click', plotBinomPoisson);

// Initial plot
plotBinomPoisson();

