const openCameraBtn = document.getElementById('openCamera');
const cameraContainer = document.getElementById('cameraContainer');
const video = document.getElementById('video');
const takePhotoBtn = document.getElementById('takePhoto');
const switchCameraBtn = document.getElementById('switchCamera');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let stream = null;
let currentFacingMode = "environment"; // Trasera por defecto ✅

// ✅ Abrir cámara con la cámara actual
async function openCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: currentFacingMode,
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });

        video.srcObject = stream;
        video.play();
        cameraContainer.style.display = "block";
        openCameraBtn.disabled = true;
    } catch (e) {
        alert("No se pudo acceder a la cámara");
        console.error(e);
    }
}

// ✅ Captura de foto con buena calidad
function takePhoto() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageDataURL = canvas.toDataURL("image/png");
    canvas.style.display = "block";

    localStorage.setItem("fotoCamarapwa", imageDataURL);
    console.log("Foto guardada");
}

// ✅ Cambiar frontal ↔ trasera
async function switchCamera() {
    currentFacingMode =
        currentFacingMode === "environment" ? "user" : "environment";

    stopCamera();
    await openCamera();
}

// ✅ Detener la camara
function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
}

// ✅ Listeners
openCameraBtn.addEventListener("click", openCamera);
takePhotoBtn.addEventListener("click", takePhoto);
switchCameraBtn.addEventListener("click", switchCamera);
