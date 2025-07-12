document.addEventListener('DOMContentLoaded', function () {
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

    const savedApiKey = localStorage.getItem('gptimage1_api_key');
    if (savedApiKey) apiKeyInput.value = savedApiKey;

    apiKeyInput.addEventListener('change', function () {
        if (this.value.trim()) {
            localStorage.setItem('gptimage1_api_key', this.value.trim());
        }
    });

    function showError(message) {
        errorMessage.textContent = message;
        errorSection.style.display = 'block';
        resultSection.style.display = 'none';
    }

    function hideMessages() {
        errorSection.style.display = 'none';
        resultSection.style.display = 'none';
    }

    function showResult(imageUrl) {
        generatedImage.src = imageUrl;
        resultSection.style.display = 'block';
        errorSection.style.display = 'none';
    }

    function setButtonLoading(isLoading) {
        generateBtn.disabled = isLoading;
        btnText.style.display = isLoading ? 'none' : 'inline';
        loading.style.display = isLoading ? 'inline' : 'none';
    }

    async function generateImage() {
        const apiKey = apiKeyInput.value.trim();
        const prompt = promptInput.value.trim();
        const size = sizeSelect.value;
        const quality = qualitySelect.value;
        const model = modelSelect.value;
        const contextImage = contextImagePreview.src && contextImagePreview.src.startsWith('data:') ? contextImagePreview.src : null;

        if (!apiKey) return showError('Por favor, introduce tu API Key de OpenAI');
        if (!prompt) return showError('Por favor, describe la imagen que quieres generar');
        if (prompt.length < 10) return showError('La descripción debe tener al menos 10 caracteres');
        if (contextImage && model !== 'dall-e-2' && model !== 'gpt-image-1') {
            return showError('La edición de imágenes solo está disponible con DALL-E 2 y GPT-Image-1.');
        }

        hideMessages();
        setButtonLoading(true);

        try {
            const response = contextImage
                ? await editImageWithContext(apiKey, prompt, contextImage, size, quality, model)
                : await generateNewImage(apiKey, prompt, size, quality, model);

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error?.message || `Error ${response.status}: ${response.statusText}`);
            }

            if (model === 'gpt-image-1') {
                const content = data.choices?.[0]?.message?.content || '';
                const imageUrlMatch = content.match(/https:\/\/[^\s]+\.(png|jpg|jpeg|gif|webp)/i);
                if (imageUrlMatch) {
                    showResult(imageUrlMatch[0]);
                } else {
                    throw new Error('No se encontró una URL de imagen válida en la respuesta de GPT-Image-1.');
                }
            } else {
                if (data.data?.[0]?.url) {
                    showResult(data.data[0].url);
                } else {
                    throw new Error('No se pudo generar la imagen. Respuesta inesperada del servidor.');
                }
            }
        } catch (error) {
            console.error('Error al generar imagen:', error);
            let errorMsg = 'Error al generar la imagen: ';
            if (error.message.includes('401')) errorMsg += 'API Key inválida.';
            else if (error.message.includes('429')) errorMsg += 'Límite de solicitudes superado.';
            else if (error.message.includes('400')) errorMsg += 'Solicitud no válida.';
            else if (error.message.includes('network')) errorMsg += 'Error de red.';
            else errorMsg += error.message;
            showError(errorMsg);
        } finally {
            setButtonLoading(false);
        }
    }

    async function generateNewImage(apiKey, prompt, size, quality, model) {
        if (model === 'gpt-image-1') {
            return await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: model,
                    messages: [{
                        role: 'user',
                        content: [
                            { type: 'text', text: `Generate an image: ${prompt}` }
                        ]
                    }],
                    max_tokens: 300
                })
            });
        } else {
            return await fetch('https://api.openai.com/v1/images/generations', {
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
                })
            });
        }
    }

    async function editImageWithContext(apiKey, prompt, contextImage, size, quality, model) {
        if (model === 'gpt-image-1') {
            return await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: model,
                    messages: [{
                        role: 'user',
                        content: [
                            { type: 'text', text: `Edit this image: ${prompt}` },
                            { type: 'image_url', image_url: { url: contextImage } }
                        ]
                    }],
                    max_tokens: 300
                })
            });
        } else {
            const base64Data = contextImage.split(',')[1];
            const mimeType = contextImage.split(',')[0].split(':')[1].split(';')[0];
            const byteCharacters = atob(base64Data);
            const byteArray = new Uint8Array([...byteCharacters].map(c => c.charCodeAt(0)));
            const imageBlob = new Blob([byteArray], { type: mimeType });

            const formData = new FormData();
            formData.append('image', imageBlob, 'context-image.png');
            formData.append('prompt', prompt);
            formData.append('n', '1');
            formData.append('size', size);
            formData.append('response_format', 'url');
            if (model === 'dall-e-2') formData.append('model', model);

            return await fetch('https://api.openai.com/v1/images/edits', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${apiKey}` },
                body: formData
            });
        }
    }

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

    function generateNewPrompt() {
        hideMessages();
        promptInput.focus();
    }

    function handleContextImageUpload(event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function (e) {
                contextImagePreview.src = e.target.result;
                contextImagePreview.style.display = 'block';
                removeContextBtn.style.display = 'inline-block';
                document.getElementById('contextImageSection').style.display = 'block';
                updateButtonText();
            };
            reader.readAsDataURL(file);
        } else {
            showError('Por favor selecciona un archivo de imagen válido');
        }
    }

    function removeContextImage() {
        contextImagePreview.src = '';
        contextImagePreview.style.display = 'none';
        removeContextBtn.style.display = 'none';
        contextImageInput.value = '';
        document.getElementById('contextImageSection').style.display = 'none';
        updateButtonText();
    }

    function useGeneratedAsContext() {
        if (generatedImage.src) {
            contextImagePreview.src = generatedImage.src;
            contextImagePreview.style.display = 'block';
            removeContextBtn.style.display = 'inline-block';
            document.getElementById('contextImageSection').style.display = 'block';
            updateButtonText();
        }
    }

    function updateButtonText() {
        const hasContextImage = contextImagePreview.src && contextImagePreview.src.startsWith('data:');
        const currentModel = modelSelect.value;
        if (hasContextImage) {
            btnText.textContent = currentModel === 'dall-e-2' ? '🎨 Editar Imagen' : '🚀 Generar con Referencia';
        } else {
            btnText.textContent = '🚀 Generar Imagen';
        }
    }

    generateBtn.addEventListener('click', generateImage);
    downloadBtn.addEventListener('click', downloadImage);
    newImageBtn.addEventListener('click', generateNewPrompt);
    contextImageInput.addEventListener('change', handleContextImageUpload);
    removeContextBtn.addEventListener('click', removeContextImage);
    useAsContextBtn.addEventListener('click', useGeneratedAsContext);
    modelSelect.addEventListener('change', updateButtonText);

    promptInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            generateImage();
        }
    });

    promptInput.addEventListener('input', function () {
        const length = this.value.trim().length;
        this.style.borderColor = (length > 0 && length < 10) ? '#e17055' : '#e1e5e9';
    });

    apiKeyInput.addEventListener('input', function () {
        const value = this.value.trim();
        this.style.borderColor = (value.length > 0 && !value.startsWith('sk-')) ? '#e17055' : '#e1e5e9';
    });

    console.log('🎨 GPT-IMAGE-1 UI cargada correctamente!');
    console.log('💡 Tip: Usa Ctrl+Enter para generar rápidamente');
});
