const openCameraBtn = document.getElementById('openCamera');
const cameraContainer = document.getElementById('cameraContainer');
const video = document.getElementById('video');
const takePhotoBtn = document.getElementById('takePhoto');
const switchCameraBtn = document.getElementById('switchCamera');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let stream = null;
let currentFacingMode = "environment"; // Trasera por defecto

// ✅ Abrir cámara
async function openCamera() {
    try {
        stopCamera(); // Detener cámara si ya está activa

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
        openCameraBtn.disabled = true;

    } catch (error) {
        console.error("Error cámara:", error);

        if (error.name === "NotAllowedError") {
            alert("Debes permitir el uso de la cámara.\nConfigura: Safari > Cámara > Permitir");
        } else {
            alert("No se pudo acceder a la cámara");
        }
    }
}

// ✅ Tomar foto con buena calidad
function takePhoto() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.style.display = "block";

    const img = canvas.toDataURL("image/png");
    localStorage.setItem("fotoPWA", img);

    console.log("✅ Foto guardada en localStorage");
}

// ✅ Cambiar cámara (si iPhone tiene más de una)
async function switchCamera() {
    currentFacingMode = currentFacingMode === "environment" ? "user" : "environment";
    await openCamera();
}

// ✅ Detener cámara activa
function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
}

// ✅ Listeners
openCameraBtn.addEventListener("click", openCamera);
takePhotoBtn.addEventListener("click", takePhoto);
switchCameraBtn.addEventListener("click", switchCamera);
