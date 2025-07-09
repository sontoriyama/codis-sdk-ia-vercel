document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const apiKeyInput = document.getElementById('apiKey');
    const sourceLanguageSelect = document.getElementById('sourceLanguage');
    const targetLanguageSelect = document.getElementById('targetLanguage');
    const swapBtn = document.getElementById('swapBtn');
    const sourceTextArea = document.getElementById('sourceText');
    const translatedTextArea = document.getElementById('translatedText');
    const clearBtn = document.getElementById('clearBtn');
    const pasteBtn = document.getElementById('pasteBtn');
    const copyBtn = document.getElementById('copyBtn');
    const speakBtn = document.getElementById('speakBtn');
    const charCount = document.querySelector('.char-count');
    const translationInfo = document.querySelector('.translation-info');
    const formalToneCheck = document.getElementById('formalTone');
    const contextAwareCheck = document.getElementById('contextAware');
    const preserveFormattingCheck = document.getElementById('preserveFormatting');
    const translateBtn = document.getElementById('translateBtn');
    const btnText = document.querySelector('.btn-text');
    const loading = document.querySelector('.loading');
    const resultSection = document.getElementById('result');
    const errorSection = document.getElementById('error');
    const detectedLanguage = document.getElementById('detectedLanguage');
    const confidence = document.getElementById('confidence');
    const alternativeTranslations = document.getElementById('alternativeTranslations');
    const errorMessage = document.getElementById('errorMessage');

    const MAX_CHARS = 5000;
    let currentTranslation = null;

    // Mapeo de códigos de idioma a nombres
    const languageNames = {
        'auto': 'Detección automática',
        'es': 'Español',
        'en': 'Inglés',
        'fr': 'Francés',
        'de': 'Alemán',
        'it': 'Italiano',
        'pt': 'Portugués',
        'ru': 'Ruso',
        'ja': 'Japonés',
        'ko': 'Coreano',
        'zh': 'Chino',
        'ar': 'Árabe',
        'hi': 'Hindi'
    };

    // Cargar API key guardada
    const savedApiKey = localStorage.getItem('translator_api_key');
    if (savedApiKey) {
        apiKeyInput.value = savedApiKey;
    }

    // Guardar API key cuando cambie
    apiKeyInput.addEventListener('change', function() {
        if (this.value.trim()) {
            localStorage.setItem('translator_api_key', this.value.trim());
        }
    });

    // Actualizar contador de caracteres
    function updateCharCount() {
        const length = sourceTextArea.value.length;
        charCount.textContent = `${length} caracteres`;
        
        if (length > MAX_CHARS) {
            charCount.classList.add('char-limit-exceeded');
            charCount.classList.remove('char-limit-warning');
        } else if (length > MAX_CHARS * 0.9) {
            charCount.classList.add('char-limit-warning');
            charCount.classList.remove('char-limit-exceeded');
        } else {
            charCount.classList.remove('char-limit-warning', 'char-limit-exceeded');
        }
    }

    // Event listener para contador de caracteres
    sourceTextArea.addEventListener('input', updateCharCount);

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
    function showResult(translationData) {
        if (translationData.detectedLanguage) {
            detectedLanguage.innerHTML = `
                <h4>🔍 Idioma detectado:</h4>
                <p>${languageNames[translationData.detectedLanguage] || translationData.detectedLanguage}</p>
            `;
        }
        
        if (translationData.confidence) {
            confidence.innerHTML = `
                <h4>📊 Confianza de la traducción:</h4>
                <p>${Math.round(translationData.confidence * 100)}%</p>
            `;
        }
        
        if (translationData.alternatives && translationData.alternatives.length > 0) {
            alternativeTranslations.innerHTML = `
                <h4>🔄 Traducciones alternativas:</h4>
                <p>${translationData.alternatives.join(', ')}</p>
            `;
        }
        
        resultSection.style.display = 'block';
        errorSection.style.display = 'none';
    }

    // Función para cambiar estado del botón
    function setButtonLoading(isLoading) {
        translateBtn.disabled = isLoading;
        if (isLoading) {
            btnText.style.display = 'none';
            loading.style.display = 'inline';
            translateBtn.classList.add('translating');
        } else {
            btnText.style.display = 'inline';
            loading.style.display = 'none';
            translateBtn.classList.remove('translating');
        }
    }

    // Función para intercambiar idiomas
    function swapLanguages() {
        const sourceValue = sourceLanguageSelect.value;
        const targetValue = targetLanguageSelect.value;
        
        if (sourceValue !== 'auto') {
            sourceLanguageSelect.value = targetValue;
            targetLanguageSelect.value = sourceValue;
            
            // Intercambiar textos si hay traducción
            if (translatedTextArea.value.trim()) {
                const tempText = sourceTextArea.value;
                sourceTextArea.value = translatedTextArea.value;
                translatedTextArea.value = tempText;
                updateCharCount();
            }
        }
    }

    // Función para limpiar texto
    function clearText() {
        sourceTextArea.value = '';
        translatedTextArea.value = '';
        updateCharCount();
        hideMessages();
        copyBtn.disabled = true;
        speakBtn.disabled = true;
        translationInfo.textContent = '';
    }

    // Función para pegar texto
    async function pasteText() {
        try {
            const text = await navigator.clipboard.readText();
            sourceTextArea.value = text;
            updateCharCount();
            sourceTextArea.focus();
        } catch (error) {
            showError('No se pudo acceder al portapapeles. Usa Ctrl+V para pegar.');
        }
    }

    // Función para copiar traducción
    async function copyTranslation() {
        try {
            await navigator.clipboard.writeText(translatedTextArea.value);
            copyBtn.textContent = '✅ Copiado';
            setTimeout(() => {
                copyBtn.textContent = '📄 Copiar';
            }, 2000);
        } catch (error) {
            showError('No se pudo copiar al portapapeles. Usa Ctrl+C para copiar.');
        }
    }

    // Función para reproducir audio
    function speakTranslation() {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(translatedTextArea.value);
            const targetLang = targetLanguageSelect.value;
            
            // Mapear códigos de idioma a códigos de voz
            const voiceLangMap = {
                'es': 'es-ES',
                'en': 'en-US',
                'fr': 'fr-FR',
                'de': 'de-DE',
                'it': 'it-IT',
                'pt': 'pt-PT',
                'ru': 'ru-RU',
                'ja': 'ja-JP',
                'ko': 'ko-KR',
                'zh': 'zh-CN',
                'ar': 'ar-SA',
                'hi': 'hi-IN'
            };
            
            utterance.lang = voiceLangMap[targetLang] || targetLang;
            utterance.rate = 0.8;
            utterance.pitch = 1;
            
            speechSynthesis.speak(utterance);
        } else {
            showError('Tu navegador no soporta síntesis de voz.');
        }
    }

    // Función para generar prompt para Gemini
    function generateTranslationPrompt(text, sourceLang, targetLang, options) {
        let prompt = `Traduce el siguiente texto `;
        
        if (sourceLang === 'auto') {
            prompt += `(detecta automáticamente el idioma) `;
        } else {
            prompt += `del ${languageNames[sourceLang]} `;
        }
        
        prompt += `al ${languageNames[targetLang]}:\n\n"${text}"\n\n`;
        
        prompt += `Instrucciones específicas:\n`;
        
        if (options.formalTone) {
            prompt += `- Usa un tono formal y profesional\n`;
        } else {
            prompt += `- Mantén un tono natural y conversacional\n`;
        }
        
        if (options.contextAware) {
            prompt += `- Considera el contexto y las expresiones idiomáticas\n`;
        }
        
        if (options.preserveFormatting) {
            prompt += `- Preserva el formato original (saltos de línea, espacios, etc.)\n`;
        }
        
        prompt += `\nPor favor, proporciona:\n`;
        prompt += `1. La traducción principal\n`;
        prompt += `2. Si detectaste automáticamente el idioma, indica cuál es\n`;
        prompt += `3. Si hay traducciones alternativas válidas, menciónalas\n\n`;
        prompt += `Responde en el siguiente formato:\n`;
        prompt += `TRADUCCIÓN: [tu traducción aquí]\n`;
        
        if (sourceLang === 'auto') {
            prompt += `IDIOMA_DETECTADO: [código del idioma detectado]\n`;
        }
        
        prompt += `ALTERNATIVAS: [traducciones alternativas separadas por comas, si las hay]`;
        
        return prompt;
    }

    // Función para parsear respuesta de Gemini
    function parseGeminiResponse(response) {
        const lines = response.split('\n');
        const result = {
            translation: '',
            detectedLanguage: null,
            alternatives: []
        };
        
        for (const line of lines) {
            if (line.startsWith('TRADUCCIÓN:')) {
                result.translation = line.replace('TRADUCCIÓN:', '').trim();
            } else if (line.startsWith('IDIOMA_DETECTADO:')) {
                result.detectedLanguage = line.replace('IDIOMA_DETECTADO:', '').trim();
            } else if (line.startsWith('ALTERNATIVAS:')) {
                const alts = line.replace('ALTERNATIVAS:', '').trim();
                if (alts && alts !== 'N/A' && alts !== 'Ninguna') {
                    result.alternatives = alts.split(',').map(alt => alt.trim()).filter(alt => alt);
                }
            }
        }
        
        // Si no se encontró el formato esperado, usar toda la respuesta como traducción
        if (!result.translation) {
            result.translation = response.trim();
        }
        
        return result;
    }

    // Función principal para traducir
    async function translateText() {
        const apiKey = apiKeyInput.value.trim();
        const text = sourceTextArea.value.trim();
        const sourceLang = sourceLanguageSelect.value;
        const targetLang = targetLanguageSelect.value;
        
        const options = {
            formalTone: formalToneCheck.checked,
            contextAware: contextAwareCheck.checked,
            preserveFormatting: preserveFormattingCheck.checked
        };

        // Validaciones
        if (!apiKey) {
            showError('Por favor, introduce tu API Key de Google Gemini');
            return;
        }

        if (!text) {
            showError('Por favor, introduce el texto que quieres traducir');
            return;
        }

        if (text.length > MAX_CHARS) {
            showError(`El texto es demasiado largo. Máximo ${MAX_CHARS} caracteres.`);
            return;
        }

        if (sourceLang === targetLang && sourceLang !== 'auto') {
            showError('El idioma origen y destino no pueden ser el mismo');
            return;
        }

        hideMessages();
        setButtonLoading(true);
        translatedTextArea.value = '';
        copyBtn.disabled = true;
        speakBtn.disabled = true;

        try {
            const prompt = generateTranslationPrompt(text, sourceLang, targetLang, options);
            
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }]
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || `Error ${response.status}: ${response.statusText}`);
            }

            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                const geminiResponse = data.candidates[0].content.parts[0].text;
                const parsedResult = parseGeminiResponse(geminiResponse);
                
                translatedTextArea.value = parsedResult.translation;
                copyBtn.disabled = false;
                speakBtn.disabled = false;
                
                // Mostrar información de la traducción
                const sourceLanguageName = languageNames[sourceLang] || sourceLang;
                const targetLanguageName = languageNames[targetLang] || targetLang;
                translationInfo.textContent = `${sourceLanguageName} → ${targetLanguageName}`;
                
                currentTranslation = {
                    ...parsedResult,
                    sourceLanguage: sourceLang,
                    targetLanguage: targetLang,
                    originalText: text,
                    timestamp: new Date().toISOString()
                };
                
                // Mostrar información adicional si está disponible
                if (parsedResult.detectedLanguage || parsedResult.alternatives.length > 0) {
                    showResult(parsedResult);
                }
                
            } else {
                throw new Error('No se pudo obtener una traducción válida de Gemini');
            }

        } catch (error) {
            console.error('Error al traducir:', error);
            
            let errorMsg = 'Error al traducir el texto: ';
            
            if (error.message.includes('401') || error.message.includes('403')) {
                errorMsg += 'API Key inválida. Verifica tu clave de Google Gemini.';
            } else if (error.message.includes('429')) {
                errorMsg += 'Has excedido el límite de solicitudes. Espera un momento e intenta de nuevo.';
            } else if (error.message.includes('400')) {
                errorMsg += 'La solicitud no es válida. Revisa el texto y configuración.';
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

    // Event listeners
    swapBtn.addEventListener('click', swapLanguages);
    clearBtn.addEventListener('click', clearText);
    pasteBtn.addEventListener('click', pasteText);
    copyBtn.addEventListener('click', copyTranslation);
    speakBtn.addEventListener('click', speakTranslation);
    translateBtn.addEventListener('click', translateText);

    // Permitir traducir con Ctrl+Enter
    sourceTextArea.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            translateText();
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

    // Inicializar contador de caracteres
    updateCharCount();

    // Mensaje de ayuda
    console.log('🌍 AI Translator cargado correctamente!');
    console.log('💡 Tip: Usa Ctrl+Enter en el área de texto para traducir rápidamente');
});