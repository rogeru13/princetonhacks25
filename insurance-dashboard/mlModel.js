// mlModel.js
// Advanced linear regression using gradient descent

function trainLinearRegression(data, learningRate = 0.01, iterations = 10000) {
    const m = data.length;
    let w0 = 0, w1 = 0, w2 = 0;
  
    for (let iter = 0; iter < iterations; iter++) {
      let dw0 = 0, dw1 = 0, dw2 = 0;
      data.forEach((d) => {
        const x1 = d.DiabetesRisk;
        const x2 = d.HypertensionRisk;
        const y = d.IncentivePayout;
        const y_pred = w0 + w1 * x1 + w2 * x2;
        const error = y_pred - y;
        dw0 += error;
        dw1 += error * x1;
        dw2 += error * x2;
      });
      // Update weights
      w0 = w0 - (learningRate / m) * dw0;
      w1 = w1 - (learningRate / m) * dw1;
      w2 = w2 - (learningRate / m) * dw2;
    }
    return { w0, w1, w2 };
  }
  
  // Assume the original cost for a major surgery is $30,000 per year.
  const ORIGINAL_SURGERY_COST = 30000;
  
  function predict(model, diabetesRisk, hypertensionRisk) {
    // Calculate predicted annual incentive payout
    const predictedPayout = model.w0 + model.w1 * diabetesRisk + model.w2 * hypertensionRisk;
    // Calculate annual savings as the difference between the surgery cost and the payout
    const annualSavings = ORIGINAL_SURGERY_COST - predictedPayout;
    return { predictedPayout, annualSavings };
  }
  
  module.exports = { trainLinearRegression, predict };
  