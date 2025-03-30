document.addEventListener('DOMContentLoaded', () => {
    // Load simplified patients for top-half table
    function loadSimplifiedPatients() {
      fetch('/api/patients')
        .then(res => res.json())
        .then(data => {
          const tbody = document.querySelector('#patients-table tbody');
          tbody.innerHTML = '';
          data.forEach(patient => {
            const fullName = `${patient.FirstName} ${patient.LastName}`;
            const tr = document.createElement('tr');
            tr.innerHTML = `
              <td>${fullName}</td>
              <td>${(patient.DiabetesRisk * 100).toFixed(0)}%</td>
              <td>${(patient.HypertensionRisk * 100).toFixed(0)}%</td>
            `;
            tbody.appendChild(tr);
          });
        });
    }
  
    // Load full patient data for bottom-half table
    function loadFullPatients() {
      fetch('/api/fullPatients')
        .then(res => res.json())
        .then(data => {
          const tbody = document.querySelector('#full-patients-table tbody');
          tbody.innerHTML = '';
          data.forEach(patient => {
            const fullName = `${patient.FirstName} ${patient.LastName}`;
            tbody.innerHTML += `
              <tr>
                <td>${fullName}</td>
                <td>${(patient.DiabetesRisk * 100).toFixed(0)}%</td>
                <td>${(patient.HypertensionRisk * 100).toFixed(0)}%</td>
                <td>$${patient.IncentivePayout}</td>
                <td>${patient.PayoutStatus}</td>
              </tr>
            `;
          });
        });
    }
  
    // Set up prediction form
    function setupPredictionForm() {
      document.getElementById('predict-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const diabetesRisk = parseFloat(document.getElementById('diabetesRisk').value);
        const hypertensionRisk = parseFloat(document.getElementById('hypertensionRisk').value);
  
        fetch('/api/predict', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ DiabetesRisk: diabetesRisk, HypertensionRisk: hypertensionRisk })
        })
          .then(res => res.json())
          .then(result => {
            document.getElementById('prediction-result').innerHTML = `
              <p>Predicted Annual Incentive Payout: $${result.predictedPayout.toFixed(2)}</p>
              <p>Annual Savings for the Insurance Company: $${result.annualSavings.toFixed(2)}</p>
            `;
          });
      });
    }
  
    // Search for a patient by name in the simplified table
    document.getElementById('search-btn').addEventListener('click', () => {
      const searchTerm = document.getElementById('search-input').value.toLowerCase();
      fetch('/api/patients')
        .then(res => res.json())
        .then(data => {
          const filtered = data.filter(patient => {
            const fullName = `${patient.FirstName} ${patient.LastName}`.toLowerCase();
            return fullName.includes(searchTerm);
          });
          const tbody = document.querySelector('#patients-table tbody');
          tbody.innerHTML = '';
          filtered.forEach(patient => {
            const fullName = `${patient.FirstName} ${patient.LastName}`;
            const tr = document.createElement('tr');
            tr.innerHTML = `
              <td>${fullName}</td>
              <td>${(patient.DiabetesRisk * 100).toFixed(0)}%</td>
              <td>${(patient.HypertensionRisk * 100).toFixed(0)}%</td>
            `;
            tbody.appendChild(tr);
          });
        });
    });
  
    // Initial load
    loadSimplifiedPatients();
    loadFullPatients();
    setupPredictionForm();
  });
  