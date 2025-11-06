// app.js - Con almacenamiento múltiple de fotos
const video = document.getElementById('video');
const captureBtn = document.getElementById('capture-btn');
const photosContainer = document.getElementById('photos-container');
const photoCount = document.getElementById('photo-count');

let stream = null;
let currentFacingMode = "environment";

// ✅ Inicializar la aplicación
function initApp() {
    openCamera();
    loadPhotosFromStorage();
}

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

// ✅ Tomar foto y guardarla
function takePhoto() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Crear objeto de foto con metadata
    const photoData = {
        id: Date.now(), // ID único basado en timestamp
        dataUrl: canvas.toDataURL("image/png"),
        date: new Date().toLocaleString('es-MX', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }),
        timestamp: Date.now()
    };

    // Guardar en localStorage
    savePhotoToStorage(photoData);
    
    // Actualizar la galería
    addPhotoToGallery(photoData);
    
    console.log("✅ Foto guardada:", photoData.id);
}

// ✅ Guardar foto en localStorage
function savePhotoToStorage(photoData) {
    let photos = JSON.parse(localStorage.getItem("pwaPhotos")) || [];
    photos.unshift(photoData); // Agregar al inicio para mostrar la más reciente primero
    
    // Limitar a 50 fotos máximo para no llenar el storage
    if (photos.length > 50) {
        photos = photos.slice(0, 50);
    }
    
    localStorage.setItem("pwaPhotos", JSON.stringify(photos));
    updatePhotoCount();
}

// ✅ Cargar fotos desde localStorage
function loadPhotosFromStorage() {
    const photos = JSON.parse(localStorage.getItem("pwaPhotos")) || [];
    
    // Limpiar contenedor
    photosContainer.innerHTML = '';
    
    // Agregar cada foto a la galería
    photos.forEach(photo => {
        addPhotoToGallery(photo);
    });
    
    updatePhotoCount();
}

// ✅ Agregar foto a la galería visual
function addPhotoToGallery(photoData) {
    const photoItem = document.createElement('div');
    photoItem.className = 'photo-item';
    photoItem.innerHTML = `
        <img src="${photoData.dataUrl}" alt="Foto ${photoData.id}">
        <button class="delete-btn" onclick="deletePhoto(${photoData.id})">×</button>
        <div class="photo-date">${photoData.date}</div>
    `;
    
    // Insertar al inicio del contenedor
    if (photosContainer.firstChild) {
        photosContainer.insertBefore(photoItem, photosContainer.firstChild);
    } else {
        photosContainer.appendChild(photoItem);
    }
    
    // Mostrar mensaje si no hay fotos
    updateEmptyMessage();
}

// ✅ Eliminar foto
function deletePhoto(photoId) {
    let photos = JSON.parse(localStorage.getItem("pwaPhotos")) || [];
    photos = photos.filter(photo => photo.id !== photoId);
    localStorage.setItem("pwaPhotos", JSON.stringify(photos));
    
    // Recargar galería
    loadPhotosFromStorage();
}

// ✅ Actualizar contador de fotos
function updatePhotoCount() {
    const photos = JSON.parse(localStorage.getItem("pwaPhotos")) || [];
    photoCount.textContent = photos.length;
}

// ✅ Mostrar/ocultar mensaje de galería vacía
function updateEmptyMessage() {
    const photos = JSON.parse(localStorage.getItem("pwaPhotos")) || [];
    
    if (photos.length === 0) {
        if (!document.querySelector('.empty-gallery')) {
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'empty-gallery';
            emptyMsg.textContent = 'Todavía no hay fotos. ¡Toma la primera!';
            photosContainer.appendChild(emptyMsg);
        }
    } else {
        const emptyMsg = document.querySelector('.empty-gallery');
        if (emptyMsg) {
            emptyMsg.remove();
        }
    }
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

// Cambiar cámara con doble tap en el video
video.addEventListener('dblclick', switchCamera);

// Inicializar aplicación al cargar
window.addEventListener('load', initApp);

// Detener cámara al cerrar
window.addEventListener('beforeunload', stopCamera);

// Hacer deletePhoto disponible globalmente para los botones
window.deletePhoto = deletePhoto;