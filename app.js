// app.js - Con compresión de imágenes y almacenamiento optimizado
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

// ✅ Comprimir imagen para ahorrar espacio
function compressImage(dataUrl, quality = 0.7) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Reducir tamaño para ahorrar espacio
            const maxWidth = 800;
            const maxHeight = 600;
            
            let width = img.width;
            let height = img.height;
            
            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round((width * maxHeight) / height);
                    height = maxHeight;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = dataUrl;
    });
}

// ✅ Tomar foto y guardarla
async function takePhoto() {
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Comprimir imagen antes de guardar
        const originalDataUrl = canvas.toDataURL("image/png");
        const compressedDataUrl = await compressImage(originalDataUrl, 0.7);
        
        // Verificar tamaño de almacenamiento disponible
        if (!checkStorageAvailable()) {
            showStorageWarning();
            return;
        }
        
        // Crear objeto de foto con metadata
        const photoData = {
            id: Date.now() + Math.random(), // ID único
            dataUrl: compressedDataUrl,
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
        
    } catch (error) {
        console.error("Error al tomar foto:", error);
        alert("Error al guardar la foto. Puede que el almacenamiento esté lleno.");
    }
}

// ✅ Verificar almacenamiento disponible
function checkStorageAvailable() {
    try {
        const testKey = 'storage_test';
        const photos = JSON.parse(localStorage.getItem("pwaPhotos")) || [];
        
        // Si tenemos más de 20 fotos, empezar a mostrar advertencia
        if (photos.length >= 20) {
            return false;
        }
        
        return true;
    } catch (e) {
        return false;
    }
}

// ✅ Mostrar advertencia de almacenamiento
function showStorageWarning() {
    // Remover advertencia anterior si existe
    const existingWarning = document.querySelector('.storage-warning');
    if (existingWarning) {
        existingWarning.remove();
    }
    
    const warning = document.createElement('div');
    warning.className = 'storage-warning';
    warning.textContent = '⚠️ Límite de almacenamiento alcanzado. Elimina algunas fotos para tomar más.';
    warning.innerHTML = '⚠️ Límite de almacenamiento alcanzado. Elimina algunas fotos para tomar más. <button onclick="clearAllPhotos()" style="margin-left: 10px; background: #fff; color: #ff9500; border: none; padding: 2px 8px; border-radius: 4px; cursor: pointer;">Limpiar todo</button>';
    
    photosContainer.appendChild(warning);
}

// ✅ Limpiar todas las fotos
function clearAllPhotos() {
    if (confirm('¿Estás seguro de que quieres eliminar todas las fotos?')) {
        localStorage.removeItem("pwaPhotos");
        loadPhotosFromStorage();
    }
}

// ✅ Guardar foto en localStorage
function savePhotoToStorage(photoData) {
    try {
        let photos = JSON.parse(localStorage.getItem("pwaPhotos")) || [];
        photos.unshift(photoData);
        
        // Limitar a 25 fotos máximo (más conservador)
        if (photos.length > 25) {
            photos = photos.slice(0, 25);
        }
        
        localStorage.setItem("pwaPhotos", JSON.stringify(photos));
        updatePhotoCount();
        
        // Ocultar advertencia si ahora tenemos espacio
        if (photos.length < 20) {
            const warning = document.querySelector('.storage-warning');
            if (warning) {
                warning.remove();
            }
        }
        
    } catch (error) {
        console.error("Error guardando foto:", error);
        throw new Error("No se pudo guardar la foto");
    }
}

// ✅ Cargar fotos desde localStorage
function loadPhotosFromStorage() {
    try {
        const photos = JSON.parse(localStorage.getItem("pwaPhotos")) || [];
        
        // Limpiar contenedor
        photosContainer.innerHTML = '';
        
        // Agregar cada foto a la galería
        photos.forEach(photo => {
            addPhotoToGallery(photo);
        });
        
        updatePhotoCount();
        
        // Mostrar advertencia si estamos cerca del límite
        if (photos.length >= 20) {
            showStorageWarning();
        }
        
    } catch (error) {
        console.error("Error cargando fotos:", error);
        photosContainer.innerHTML = '<div class="empty-gallery">Error cargando fotos</div>';
    }
}

// ✅ Agregar foto a la galería visual
function addPhotoToGallery(photoData) {
    const photoItem = document.createElement('div');
    photoItem.className = 'photo-item';
    photoItem.innerHTML = `
        <img src="${photoData.dataUrl}" alt="Foto ${photoData.id}" loading="lazy">
        <button class="delete-btn" onclick="deletePhoto(${photoData.id})">×</button>
        <div class="photo-date">${photoData.date}</div>
    `;
    
    // Insertar al inicio del contenedor
    photosContainer.insertBefore(photoItem, photosContainer.firstChild);
    
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

// Hacer funciones disponibles globalmente para los botones
window.deletePhoto = deletePhoto;
window.clearAllPhotos = clearAllPhotos;