// Catch elements
const dropArea = document.getElementById('dropArea');
const predictForm = document.getElementById('predictForm');
const previewImg = document.getElementById('previewImg');

const waitingToPredicting = document.querySelector(
  '.result-container #waitingToPredicting',
);
const loadingPredict = document.querySelector('.result-container .loading');
const predictionError = document.querySelector('.result-container #predictionError');
const result = document.querySelector('.result-container #result');

// Form data
const predictFormData = new FormData();

// Prevent default drag behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach((eventName) => {
  dropArea.addEventListener(eventName, preventDefaults, false);
  document.body.addEventListener(eventName, preventDefaults, false);
});

// Prevent submitting form behaviors
['submit'].forEach((eventName) => {
  predictForm.addEventListener(eventName, preventDefaults, false);
});

// Highlight drop area when item is dragged over it
['dragenter', 'dragover'].forEach((eventName) => {
  dropArea.addEventListener(eventName, highlight, false);
});
// Remove highlight drop area when item is drag leave
['dragleave', 'drop'].forEach((eventName) => {
  dropArea.addEventListener(eventName, unhighlight, false);
});

function preventDefaults(event) {
  event.preventDefault();
  event.stopPropagation();
}

function highlight() {
  dropArea.classList.add('highlight');
}

function unhighlight() {
  dropArea.classList.remove('highlight');
}

// Handle dropped and submit files
dropArea.addEventListener('drop', dropHandler, false);
predictForm.elements.skinFile.addEventListener('change', skinFileInputHandler);
predictForm.addEventListener('submit', predictFormSubmitHandler);

function dropHandler(event) {
  const dataTransfer = event.dataTransfer;
  const files = dataTransfer.files;

  const skinImage = files[0];
  predictFormData.set('file', skinImage, skinImage.name);

  previewFile(skinImage);
}

// Handle file by input element
function skinFileInputHandler(event) {
  const files = Array.from(event.target.files);

  const skinImage = files[0];
  predictFormData.set('file', skinImage, skinImage.name);

  previewFile(skinImage);
}

// Handle submit form
function predictFormSubmitHandler() {
  if (!predictFormData.has('file')) {
    alert('Silakan pilih gambar Anda terlebih dahulu');
    return;
  }

  uploadFile(predictFormData);
}

// Show preview after choose image
function previewFile(file) {
  const reader = new FileReader();
  reader.readAsDataURL(file);

  reader.onloadend = () => {
    previewImg.innerHTML = '';

    const img = document.createElement('img');
    img.src = reader.result;
    previewImg.appendChild(img);
  };
}

// Send image to server
async function uploadFile(formData) {
  try {
    hideElement(waitingToPredicting);
    hideElement(result);
    showElement(loadingPredict);

    const response = await PredictAPI.predict(formData);
    console.log("API Response:", response); // Debugging response

    showPredictionResult(response);
    showElement(result);
  } catch (error) {
    console.error("Error during prediction:", error); // Debugging error
    predictionError.textContent = error.message;
  } finally {
    hideElement(loadingPredict);
  }
}

// Save prediction result in local
function savePredictionToHistory(predictionResult) {
    const history = JSON.parse(localStorage.getItem('predictionHistory')) || [];
    
    // Tambahkan hasil baru ke riwayat
    history.push(predictionResult);
    
    // Simpan kembali ke localStorage
    localStorage.setItem('predictionHistory', JSON.stringify(history));
    
    // Update UI riwayat
    displayHistory();
}
  
// Fungsi untuk menampilkan history
function displayHistory() {
    const historyContainer = document.getElementById('historyList');
    const history = JSON.parse(localStorage.getItem('predictionHistory')) || [];
    
    // Bersihkan riwayat sebelumnya
    historyContainer.innerHTML = '';
  
    // Jika ada riwayat
    if (history.length > 0) {
      history.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `Prediksi pada ${item.timestamp}: ${item.data.nama_penyakit}`;
        historyContainer.appendChild(li);
      });
    } else {
      // Jika tidak ada riwayat
      document.getElementById('noHistoryMessage').style.display = 'block';
    }
};
  
  // Panggil fungsi displayHistory saat halaman dimuat
  window.onload = function() {
    displayHistory();
    };
  

// Show result to user
function showPredictionResult(response) {
    const { message, data } = response;
    console.log('backend response:', response)
  
    // Simpan hasil prediksi ke riwayat
    const predictionResult = {
      timestamp: new Date().toLocaleString(),
      result: data.result,  // Hasil prediksi
    };
    savePredictionToHistory(predictionResult);
  
    result.innerHTML = `
      <div class="response-message">
        <i class="fas fa-check"></i>
        <span class="message">${message}</span>
      </div>
      <div class="prediction-result">
        <div>
          <div class="result-title">Nama Tanaman:</div>
          <div>${data.nama_tanaman}</div>
        </div>
        <div>
          <div class="result-title">Nama Penyakit:</div>
          <div>${data.nama_penyakit}</div>
        </div>
        <div>
          <div class="result-title">Hasil:</div>
          <div>${data.penanganan}</div>
        </div>
      </div>
    `;
}

async function fetchLatestPrediction() {
  try {
      const response = await PredictAPI.getLatestPrediction();
      if (response.status === 'success') {
          const { plant_name, disease_name, solution, image, date } = response.data;

          const latestResult = document.getElementById('latestResult');
          latestResult.innerHTML = `
              <div class="latest-prediction">
                  <h3>Prediksi Terakhir</h3>
                  <img src="${image}" alt="Predicted Image" class="latest-image">
                  <p><strong>Tanaman:</strong> ${plant_name}</p>
                  <p><strong>Penyakit:</strong> ${disease_name}</p>
                  <p><strong>Saran:</strong> ${solution}</p>
                  <p><strong>Tanggal:</strong> ${date}</p>
              </div>
          `;
      } else {
          console.error(response.message);
          alert('Gagal mengambil prediksi terakhir.');
      }
  } catch (error) {
      console.error('Error fetching latest prediction:', error);
  }
}

// Panggil fungsi fetchLatestPrediction saat halaman dimuat
window.onload = function() {
  fetchLatestPrediction();
  displayHistory();
};

const response = await fetch('/api/upload-image', {
    method: 'POST',
    body: formData
});
const data = await response.json();

if (data.status === 'success') {
    const result = data.data;
    document.getElementById('result').innerHTML = `
        <div>Nama Tanaman: ${result.nama_tanaman}</div>
        <div>Nama Penyakit: ${result.nama_penyakit}</div>
        <div>Penanganan: ${result.penanganan}</div>
    `;
} else {
    document.getElementById('result').innerHTML = `Error: ${data.message}`;
}