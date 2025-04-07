// === Global array to store the sample means (fraction of heads) ===
let sampleMeans = [];

// Grabbing DOM elements
const chartDiv = document.getElementById("chart");
const sampleSizeInput = document.getElementById("sample-size");
const numSamplesInput = document.getElementById("num-samples");
const addSamplesBtn = document.getElementById("add-samples-btn");
const resetBtn = document.getElementById("reset-btn");

// === Utility: Simulate flipping n fair coins and return the fraction of heads ===
function simulateCoinFlipMean(n) {
  let headsCount = 0;
  for (let i = 0; i < n; i++) {
    // each coin has a 50% chance of being heads (1) or tails (0)
    const flip = Math.random() < 0.5 ? 1 : 0;
    headsCount += flip;
  }
  // return the fraction (mean) of heads in this sample
  return headsCount / n;
}

// === Add multiple samples based on user input ===
function addSamples() {
  const n = parseInt(sampleSizeInput.value, 10);
  const numSamples = parseInt(numSamplesInput.value, 10);

  for (let i = 0; i < numSamples; i++) {
    sampleMeans.push(simulateCoinFlipMean(n));
  }

  plotData();
}

// === Plot the histogram of sampleMeans and overlay the normal curve ===
function plotData() {
  const n = parseInt(sampleSizeInput.value, 10);

  // 1) Create histogram trace of the sample means
  const histogramTrace = {
    x: sampleMeans,
    type: 'histogram',
    name: 'Sample Means',
    opacity: 0.7,
    histnorm: 'probability density', 
    marker: {line: {width: 1, color: 'black'}}
  };

  // 2) Theoretical normal curve
  // Mean = p = 0.5
  // Stdev of sample mean = sqrt(p*(1-p)/n) = 0.5 / sqrt(n)
  const mean = 0.5;
  const stdev = 0.5 / Math.sqrt(n);

  // x-values for the curve from 0 to 1, with some margin
  const xMin = 0;
  const xMax = 1;
  const numPoints = 100;
  const xValues = [];
  const yValues = [];

  for (let i = 0; i < numPoints; i++) {
    const x = xMin + (xMax - xMin) * (i / (numPoints - 1));
    xValues.push(x);
    // Normal pdf formula:
    // pdf(x) = (1 / (stdev * sqrt(2π))) * exp( -((x - mean)^2) / (2*stdev^2) )
    const pdf = (1 / (stdev * Math.sqrt(2 * Math.PI))) * 
                Math.exp( -Math.pow(x - mean, 2) / (2 * stdev * stdev) );
    yValues.push(pdf);
  }

  // The curve trace
  const normalTrace = {
    x: xValues,
    y: yValues,
    type: 'scatter',
    mode: 'lines',
    name: 'Normal Approx'
  };

  // 3) Plot layout
  const layout = {
    title: `Histogram of Sample Means (n=${n}, total samples=${sampleMeans.length})`,
    xaxis: { title: 'Sample Mean (#Heads / n)' },
    yaxis: { title: 'Probability Density' },
    bargap: 0.02
  };

  // 4) Render the plot
  Plotly.newPlot(chartDiv, [histogramTrace, normalTrace], layout);
}

// === Reset the simulation ===
function resetData() {
  sampleMeans = [];
  plotData(); // Clears the plot (now no data in histogram)
}

// Wire up the buttons
addSamplesBtn.addEventListener('click', addSamples);
resetBtn.addEventListener('click', resetData);

// Initial empty plot
plotData();
