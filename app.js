const openCameraBtn = document.getElementById('openCamera');
const cameraContainer = document.getElementById('cameraContainer');
const video = document.getElementById('video');
const takePhotoBtn = document.getElementById('takePhoto');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let stream = null;

async function openCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" }
        });

        video.srcObject = stream;
        cameraContainer.style.display = "block";
        openCameraBtn.disabled = true;
    } catch (e) {
        alert("No se pudo acceder a la cámara");
    }
}

function takePhoto() {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageDataURL = canvas.toDataURL("image/png");
    canvas.style.display = "block";

    // Guardar en localStorage para ver en Application
    localStorage.setItem("fotoCamarapwa", imageDataURL);

    console.log("URL de la imagen:", imageDataURL);
}

openCameraBtn.addEventListener("click", openCamera);
takePhotoBtn.addEventListener("click", takePhoto);
