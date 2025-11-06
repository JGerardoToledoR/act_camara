// app.js - Compatible con tu HTML actual
const video = document.getElementById('video');
const photo = document.getElementById('photo');
const captureBtn = document.getElementById('capture-btn');
const restartBtn = document.getElementById('restart-btn');

let stream = null;
let currentFacingMode = "environment";

// ✅ Abrir cámara automáticamente
async function openCamera() {
    try {
        stopCamera();

        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: currentFacingMode,
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });

        video.srcObject = stream;
        await video.play();
        
        console.log("✅ Cámara activada");

    } catch (error) {
        console.error("Error cámara:", error);

        if (error.name === "NotAllowedError") {
            alert("Debes permitir el uso de la cámara");
        } else {
            alert("No se pudo acceder a la cámara");
        }
    }
}

// ✅ Tomar foto
function takePhoto() {
    // Crear canvas temporal
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Mostrar la foto capturada
    photo.src = canvas.toDataURL("image/png");
    photo.style.display = 'block';
    video.style.display = 'none';
    
    // Mostrar botón de reinicio y ocultar botón de captura
    restartBtn.style.display = 'block';
    captureBtn.style.display = 'none';

    // Guardar en localStorage
    localStorage.setItem("fotoPWA", photo.src);
    console.log("✅ Foto guardada en localStorage");
}

// ✅ Reiniciar cámara
function restartCamera() {
    photo.style.display = 'none';
    video.style.display = 'block';
    restartBtn.style.display = 'none';
    captureBtn.style.display = 'block';
}

// ✅ Cambiar cámara con doble tap
function switchCamera() {
    currentFacingMode = currentFacingMode === "environment" ? "user" : "environment";
    openCamera();
}

// ✅ Detener cámara
function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
}

// ✅ Event Listeners
captureBtn.addEventListener('click', takePhoto);
restartBtn.addEventListener('click', restartCamera);

// Cambiar cámara con doble tap en el video
video.addEventListener('dblclick', switchCamera);

// Inicializar cámara automáticamente al cargar
window.addEventListener('load', openCamera);

// Detener cámara al cerrar
window.addEventListener('beforeunload', stopCamera);