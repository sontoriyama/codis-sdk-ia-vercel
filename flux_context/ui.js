document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const apiKeyInput = document.getElementById('apiKey');
    const imageUpload = document.getElementById('imageUpload');
    const uploadArea = document.getElementById('uploadArea');
    const previewImage = document.getElementById('previewImage');
    const uploadPlaceholder = document.querySelector('.upload-placeholder');
    const promptInput = document.getElementById('prompt');
    const strengthSlider = document.getElementById('strength');
    const stepsSlider = document.getElementById('steps');
    const strengthValue = document.getElementById('strengthValue');
    const stepsValue = document.getElementById('stepsValue');
    const editBtn = document.getElementById('editBtn');
    const btnText = document.querySelector('.btn-text');
    const loading = document.querySelector('.loading');
    const resultSection = document.getElementById('result');
    const errorSection = document.getElementById('error');
    const beforeImage = document.getElementById('beforeImage');
    const afterImage = document.getElementById('afterImage');
    const errorMessage = document.getElementById('errorMessage');
    const downloadBtn = document.getElementById('downloadBtn');
    const newEditBtn = document.getElementById('newEditBtn');

    let selectedImageFile = null;
    let selectedImageDataUrl = null;

    // Cargar API key guardada
    const savedApiKey = localStorage.getItem('flux_api_key');
    if (savedApiKey) {
        apiKeyInput.value = savedApiKey;
    }

    // Guardar API key cuando cambie
    apiKeyInput.addEventListener('change', function() {
        if (this.value.trim()) {
            localStorage.setItem('flux_api_key', this.value.trim());
        }
    });

    // Actualizar valores de los sliders
    strengthSlider.addEventListener('input', function() {
        strengthValue.textContent = this.value;
    });

    stepsSlider.addEventListener('input', function() {
        stepsValue.textContent = this.value;
    });

    // Función para mostrar error
    function showError(message) {
        errorMessage.textContent = message;
        errorSection.style.display = 'block';
        resultSection.style.display = 'none';
    }

    // Función para ocultar mensajes
    function hideMessages() {
        errorSection.style.display = 'none';
        resultSection.style.display = 'none';
    }

    // Función para mostrar resultado
    function showResult(originalImageUrl, editedImageUrl) {
        beforeImage.src = originalImageUrl;
        afterImage.src = editedImageUrl;
        resultSection.style.display = 'block';
        errorSection.style.display = 'none';
    }

    // Función para cambiar estado del botón
    function setButtonLoading(isLoading) {
        editBtn.disabled = isLoading;
        if (isLoading) {
            btnText.style.display = 'none';
            loading.style.display = 'inline';
        } else {
            btnText.style.display = 'inline';
            loading.style.display = 'none';
        }
    }

    // Función para convertir archivo a base64
    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Función para manejar la selección de imagen
    async function handleImageSelection(file) {
        if (!file || !file.type.startsWith('image/')) {
            showError('Por favor, selecciona un archivo de imagen válido');
            return;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB
            showError('La imagen es demasiado grande. El tamaño máximo es 10MB');
            return;
        }

        try {
            selectedImageFile = file;
            selectedImageDataUrl = await fileToBase64(file);
            
            previewImage.src = selectedImageDataUrl;
            previewImage.style.display = 'block';
            uploadPlaceholder.style.display = 'none';
            
            hideMessages();
        } catch (error) {
            showError('Error al procesar la imagen: ' + error.message);
        }
    }

    // Event listeners para upload de imagen
    uploadArea.addEventListener('click', () => imageUpload.click());
    
    imageUpload.addEventListener('change', function(e) {
        if (e.target.files[0]) {
            handleImageSelection(e.target.files[0]);
        }
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files[0]) {
            handleImageSelection(files[0]);
        }
    });

    // Función principal para editar imagen
    async function editImage() {
        const apiKey = apiKeyInput.value.trim();
        const prompt = promptInput.value.trim();
        const strength = parseFloat(strengthSlider.value);
        const steps = parseInt(stepsSlider.value);

        // Validaciones
        if (!apiKey) {
            showError('Por favor, introduce tu API Key de Replicate');
            return;
        }

        if (!selectedImageFile) {
            showError('Por favor, selecciona una imagen para editar');
            return;
        }

        if (!prompt) {
            showError('Por favor, describe los cambios que quieres hacer');
            return;
        }

        if (prompt.length < 10) {
            showError('La descripción debe tener al menos 10 caracteres');
            return;
        }

        hideMessages();
        setButtonLoading(true);

        try {
            // Crear FormData para enviar la imagen
            const formData = new FormData();
            formData.append('image', selectedImageFile);
            formData.append('prompt', prompt);
            formData.append('strength', strength.toString());
            formData.append('num_inference_steps', steps.toString());

            const response = await fetch('https://api.replicate.com/v1/predictions', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    version: "ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
                    input: {
                        image: selectedImageDataUrl,
                        prompt: prompt,
                        strength: strength,
                        num_inference_steps: steps
                    }
                })
            });

            const prediction = await response.json();

            if (!response.ok) {
                throw new Error(prediction.detail || `Error ${response.status}: ${response.statusText}`);
            }

            // Polling para obtener el resultado
            let result = prediction;
            while (result.status === 'starting' || result.status === 'processing') {
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
                    headers: {
                        'Authorization': `Token ${apiKey}`
                    }
                });
                
                result = await statusResponse.json();
            }

            if (result.status === 'succeeded' && result.output && result.output[0]) {
                showResult(selectedImageDataUrl, result.output[0]);
            } else if (result.status === 'failed') {
                throw new Error(result.error || 'La edición de imagen falló');
            } else {
                throw new Error('No se pudo completar la edición de la imagen');
            }

        } catch (error) {
            console.error('Error al editar imagen:', error);
            
            let errorMsg = 'Error al editar la imagen: ';
            
            if (error.message.includes('401')) {
                errorMsg += 'API Key inválida. Verifica tu clave de Replicate.';
            } else if (error.message.includes('429')) {
                errorMsg += 'Has excedido el límite de solicitudes. Espera un momento e intenta de nuevo.';
            } else if (error.message.includes('400')) {
                errorMsg += 'La solicitud no es válida. Revisa tu imagen y configuración.';
            } else if (error.message.includes('network') || error.message.includes('fetch')) {
                errorMsg += 'Error de conexión. Verifica tu conexión a internet.';
            } else {
                errorMsg += error.message;
            }
            
            showError(errorMsg);
        } finally {
            setButtonLoading(false);
        }
    }

    // Función para descargar imagen
    function downloadImage() {
        const imageUrl = afterImage.src;
        if (!imageUrl) return;

        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `flux-edited-image-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Función para nueva edición
    function newEdit() {
        hideMessages();
        selectedImageFile = null;
        selectedImageDataUrl = null;
        previewImage.style.display = 'none';
        uploadPlaceholder.style.display = 'flex';
        promptInput.value = '';
        promptInput.focus();
    }

    // Event listeners
    editBtn.addEventListener('click', editImage);
    downloadBtn.addEventListener('click', downloadImage);
    newEditBtn.addEventListener('click', newEdit);

    // Permitir editar con Enter en el prompt
    promptInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            editImage();
        }
    });

    // Validación en tiempo real del prompt
    promptInput.addEventListener('input', function() {
        const length = this.value.trim().length;
        if (length > 0 && length < 10) {
            this.style.borderColor = '#e17055';
        } else {
            this.style.borderColor = '#e1e5e9';
        }
    });

    // Validación en tiempo real de API key
    apiKeyInput.addEventListener('input', function() {
        const value = this.value.trim();
        if (value.length > 0 && value.length < 10) {
            this.style.borderColor = '#e17055';
        } else {
            this.style.borderColor = '#e1e5e9';
        }
    });

    // Mensaje de ayuda
    console.log('🌟 Flux UI cargada correctamente!');
    console.log('💡 Tip: Usa Ctrl+Enter en el campo de prompt para editar rápidamente');
});