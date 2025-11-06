const openCameraBtn = document.getElementById('openCamera');
const cameraContainer = document.getElementById('cameraContainer');
const video = document.getElementById('video');
const takePhotoBtn = document.getElementById('takePhoto');
const switchCameraBtn = document.getElementById('switchCamera');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let stream = null;
let currentFacingMode = "environment"; // 📌 Trasera por defecto en iOS

// ✅ Abrir cámara
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

        cameraContainer.style.display = "block";
    } catch (error) {
        console.error(error);
        if (error.name === "NotAllowedError") {
            alert("Permiso de cámara denegado. Habilítalo en Configuración → Safari → Cámara");
        } else {
            alert("No se pudo acceder a la cámara");
        }
    }
}

// ✅ Tomar foto clara
function takePhoto() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.style.display = "block";

    const imgData = canvas.toDataURL("image/png");
    localStorage.setItem("fotoCamarapwa_iOS", imgData);

    console.log("✅ Foto guardada");
}

// ✅ Cambiar cámara (solo iPhones con doble lente o más)
async function switchCamera() {
    currentFacingMode =
        currentFacingMode === "environment" ? "user" : "environment";

    await openCamera();
}

// ✅ Detener cámara
function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
}

// ✅ Eventos
openCameraBtn.addEventListener("click", openCamera);
takePhotoBtn.addEventListener("click", takePhoto);
switchCameraBtn.addEventListener("click", switchCamera);
