document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const apiKeyInput = document.getElementById('apiKey');
    const promptInput = document.getElementById('prompt');
    const sizeSelect = document.getElementById('size');
    const qualitySelect = document.getElementById('quality');
    const modelSelect = document.getElementById('model');
    const contextImageInput = document.getElementById('contextImage');
    const contextImagePreview = document.getElementById('contextImagePreview');
    const removeContextBtn = document.getElementById('removeContextBtn');
    const generateBtn = document.getElementById('generateBtn');
    const btnText = document.querySelector('.btn-text');
    const loading = document.querySelector('.loading');
    const resultSection = document.getElementById('result');
    const errorSection = document.getElementById('error');
    const generatedImage = document.getElementById('generatedImage');
    const errorMessage = document.getElementById('errorMessage');
    const downloadBtn = document.getElementById('downloadBtn');
    const newImageBtn = document.getElementById('newImageBtn');
    const useAsContextBtn = document.getElementById('useAsContextBtn');

    // Cargar API key guardada
    const savedApiKey = localStorage.getItem('gptimage1_api_key');
    if (savedApiKey) {
        apiKeyInput.value = savedApiKey;
    }

    // Guardar API key cuando cambie
    apiKeyInput.addEventListener('change', function() {
        if (this.value.trim()) {
            localStorage.setItem('gptimage1_api_key', this.value.trim());
        }
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
    function showResult(imageUrl) {
        generatedImage.src = imageUrl;
        resultSection.style.display = 'block';
        errorSection.style.display = 'none';
    }

    // Función para cambiar estado del botón
    function setButtonLoading(isLoading) {
        generateBtn.disabled = isLoading;
        if (isLoading) {
            btnText.style.display = 'none';
            loading.style.display = 'inline';
        } else {
            btnText.style.display = 'inline';
            loading.style.display = 'none';
        }
    }

    // Función principal para generar imagen
    async function generateImage() {
        const apiKey = apiKeyInput.value.trim();
        const prompt = promptInput.value.trim();
        const size = sizeSelect.value;
        const quality = qualitySelect.value;
        const model = modelSelect.value;
        const contextImage = contextImagePreview.src && contextImagePreview.src.startsWith('data:') ? 
            contextImagePreview.src : null;

        // Validaciones
        if (!apiKey) {
            showError('Por favor, introduce tu API Key de OpenAI');
            return;
        }

        if (!prompt) {
            showError('Por favor, describe la imagen que quieres generar');
            return;
        }

        if (prompt.length < 10) {
            showError('La descripción debe tener al menos 10 caracteres');
            return;
        }

        hideMessages();
        setButtonLoading(true);

        try {
            const response = await fetch('https://api.openai.com/v1/images/generations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: model,
                    prompt: prompt,
                    n: 1,
                    size: size,
                    quality: quality,
                    response_format: 'url'
                    // Note: context_image is not yet supported in the OpenAI API
                    // This is prepared for future implementation
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || `Error ${response.status}: ${response.statusText}`);
            }

            if (data.data && data.data[0] && data.data[0].url) {
                showResult(data.data[0].url);
            } else {
                throw new Error('No se pudo generar la imagen. Respuesta inesperada del servidor.');
            }

        } catch (error) {
            console.error('Error al generar imagen:', error);
            
            let errorMsg = 'Error al generar la imagen: ';
            
            if (error.message.includes('401')) {
                errorMsg += 'API Key inválida. Verifica tu clave de OpenAI.';
            } else if (error.message.includes('429')) {
                errorMsg += 'Has excedido el límite de solicitudes. Espera un momento e intenta de nuevo.';
            } else if (error.message.includes('400')) {
                errorMsg += 'La solicitud no es válida. Revisa tu prompt y configuración.';
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
        const imageUrl = generatedImage.src;
        if (!imageUrl) return;

        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `gpt-image-1-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Función para generar nueva imagen
    function generateNewImage() {
        hideMessages();
        promptInput.focus();
    }

    // Función para manejar la carga de imagen de contexto
    function handleContextImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    contextImagePreview.src = e.target.result;
                    contextImagePreview.style.display = 'block';
                    removeContextBtn.style.display = 'inline-block';
                    document.getElementById('contextImageSection').style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                showError('Por favor selecciona un archivo de imagen válido');
            }
        }
    }

    // Función para remover imagen de contexto
    function removeContextImage() {
        contextImagePreview.src = '';
        contextImagePreview.style.display = 'none';
        removeContextBtn.style.display = 'none';
        contextImageInput.value = '';
        document.getElementById('contextImageSection').style.display = 'none';
    }

    // Función para usar imagen generada como contexto
    function useGeneratedAsContext() {
        if (generatedImage.src) {
            contextImagePreview.src = generatedImage.src;
            contextImagePreview.style.display = 'block';
            removeContextBtn.style.display = 'inline-block';
            document.getElementById('contextImageSection').style.display = 'block';
        }
    }

    // Función para convertir imagen a Base64
    async function imageToBase64(imageUrl) {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error('Error converting image to base64:', error);
            return null;
        }
    }

    // Event listeners
    generateBtn.addEventListener('click', generateImage);
    downloadBtn.addEventListener('click', downloadImage);
    newImageBtn.addEventListener('click', generateNewImage);
    contextImageInput.addEventListener('change', handleContextImageUpload);
    removeContextBtn.addEventListener('click', removeContextImage);
    useAsContextBtn.addEventListener('click', useGeneratedAsContext);

    // Permitir generar con Enter en el prompt
    promptInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            generateImage();
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
        if (value.length > 0 && !value.startsWith('sk-')) {
            this.style.borderColor = '#e17055';
        } else {
            this.style.borderColor = '#e1e5e9';
        }
    });

    // Mensaje de ayuda
    console.log('🎨 GPT-IMAGE-1 UI cargada correctamente!');
    console.log('💡 Tip: Usa Ctrl+Enter en el campo de prompt para generar rápidamente');
});