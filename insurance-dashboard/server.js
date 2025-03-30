// server.js
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const { trainLinearRegression, predict } = require('./mlModel');
const axios = require('axios'); // For Knot API calls

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Load sample patient data from patients.json
let patients = JSON.parse(fs.readFileSync('patients.json', 'utf8'));

// Train our ML model on the sample data
const model = trainLinearRegression(patients);
console.log('Trained model weights:', model);

// API endpoint to get simplified patients data (first three columns)
app.get('/api/patients', (req, res) => {
  const simplifiedPatients = patients.map(p => ({
    FirstName: p.FirstName,
    LastName: p.LastName,
    DiabetesRisk: p.DiabetesRisk,
    HypertensionRisk: p.HypertensionRisk
  }));
  res.json(simplifiedPatients);
});

// API endpoint to get full patient data
app.get('/api/fullPatients', (req, res) => {
  res.json(patients);
});

// API endpoint to predict incentive payout and annual savings
app.post('/api/predict', (req, res) => {
  const { DiabetesRisk, HypertensionRisk } = req.body;
  if (DiabetesRisk === undefined || HypertensionRisk === undefined) {
    return res.status(400).json({ error: 'Missing risk values.' });
  }
  const result = predict(model, DiabetesRisk, HypertensionRisk);
  res.json(result);
});

// (Optional) API endpoint to trigger payout via Knot API
app.post('/api/triggerPayout', async (req, res) => {
  const { patientId, payoutAmount } = req.body;
  try {
    // Example request to Knot API (replace URL and details as needed)
    const response = await axios.post(
      'https://api.knotapi.com/v1/payouts',
      {
        patientId,
        amount: payoutAmount,
        currency: 'USD'
      },
      {
        headers: {
          'Authorization': `Bearer YOUR_KNOT_API_KEY`
        }
      }
    );
    res.status(200).json({ status: response.data.status, message: 'Payout triggered successfully' });
  } catch (error) {
    console.error('Knot API error:', error.message);
    res.status(500).json({ error: 'Payout failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
