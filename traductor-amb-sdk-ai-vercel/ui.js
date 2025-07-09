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
    const formalToneCheck = document.getElementById('formalTone');
    const contextAwareCheck = document.getElementById('contextAware');
    const preserveFormattingCheck = document.getElementById('preserveFormatting');
    const translateBtn = document.getElementById('translateBtn');
    const btnText = document.querySelector('.btn-text');
    const loading = document.querySelector('.loading');
    const additionalInfoSection = document.getElementById('additionalInfo');
    const translationInfo = document.getElementById('translationInfo');
    const errorSection = document.getElementById('error');
    const errorMessage = document.getElementById('errorMessage');
    const retryBtn = document.getElementById('retryBtn');

    // Cargar configuración guardada
    loadSavedSettings();

    // Event listeners
    apiKeyInput.addEventListener('change', saveApiKey);
    sourceTextArea.addEventListener('input', updateCharCount);
    sourceTextArea.addEventListener('input', saveText);
    swapBtn.addEventListener('click', swapLanguages);
    clearBtn.addEventListener('click', clearText);
    pasteBtn.addEventListener('click', pasteText);
    copyBtn.addEventListener('click', copyTranslation);
    speakBtn.addEventListener('click', speakTranslation);
    translateBtn.addEventListener('click', translateText);
    retryBtn.addEventListener('click', translateText);

    // Guardar configuración en localStorage
    [sourceLanguageSelect, targetLanguageSelect, formalToneCheck, contextAwareCheck, preserveFormattingCheck].forEach(element => {
        element.addEventListener('change', saveSettings);
    });

    function loadSavedSettings() {
        // Cargar API key
        const savedApiKey = localStorage.getItem('traductor_vercel_openai_api_key');
        if (savedApiKey) {
            apiKeyInput.value = savedApiKey;
        }

        // Cargar configuración de idiomas
        const savedSourceLang = localStorage.getItem('traductor_vercel_source_lang');
        const savedTargetLang = localStorage.getItem('traductor_vercel_target_lang');
        if (savedSourceLang) sourceLanguageSelect.value = savedSourceLang;
        if (savedTargetLang) targetLanguageSelect.value = savedTargetLang;

        // Cargar opciones
        const savedFormalTone = localStorage.getItem('traductor_vercel_formal_tone');
        const savedContextAware = localStorage.getItem('traductor_vercel_context_aware');
        const savedPreserveFormatting = localStorage.getItem('traductor_vercel_preserve_formatting');
        
        if (savedFormalTone !== null) formalToneCheck.checked = savedFormalTone === 'true';
        if (savedContextAware !== null) contextAwareCheck.checked = savedContextAware === 'true';
        if (savedPreserveFormatting !== null) preserveFormattingCheck.checked = savedPreserveFormatting === 'true';

        // Cargar texto guardado
        const savedText = localStorage.getItem('traductor_vercel_source_text');
        if (savedText) {
            sourceTextArea.value = savedText;
            updateCharCount();
        }
    }

    function saveApiKey() {
        if (apiKeyInput.value.trim()) {
            localStorage.setItem('traductor_vercel_openai_api_key', apiKeyInput.value.trim());
        }
    }

    function saveSettings() {
        localStorage.setItem('traductor_vercel_source_lang', sourceLanguageSelect.value);
        localStorage.setItem('traductor_vercel_target_lang', targetLanguageSelect.value);
        localStorage.setItem('traductor_vercel_formal_tone', formalToneCheck.checked);
        localStorage.setItem('traductor_vercel_context_aware', contextAwareCheck.checked);
        localStorage.setItem('traductor_vercel_preserve_formatting', preserveFormattingCheck.checked);
    }

    function saveText() {
        localStorage.setItem('traductor_vercel_source_text', sourceTextArea.value);
    }

    function updateCharCount() {
        const count = sourceTextArea.value.length;
        const max = sourceTextArea.maxLength;
        charCount.textContent = `${count} / ${max}`;
        
        if (count > max * 0.9) {
            charCount.style.color = '#dc2626';
        } else if (count > max * 0.7) {
            charCount.style.color = '#f59e0b';
        } else {
            charCount.style.color = '#6b7280';
        }
    }

    function swapLanguages() {
        const sourceValue = sourceLanguageSelect.value;
        const targetValue = targetLanguageSelect.value;
        
        if (sourceValue !== 'auto') {
            sourceLanguageSelect.value = targetValue;
            targetLanguageSelect.value = sourceValue;
            
            // Intercambiar textos también
            const sourceText = sourceTextArea.value;
            const translatedText = translatedTextArea.value;
            
            if (translatedText) {
                sourceTextArea.value = translatedText;
                translatedTextArea.value = sourceText;
                updateCharCount();
            }
            
            saveSettings();
            saveText();
        }
    }

    function clearText() {
        sourceTextArea.value = '';
        translatedTextArea.value = '';
        updateCharCount();
        hideMessages();
        localStorage.removeItem('traductor_vercel_source_text');
        sourceTextArea.focus();
    }

    async function pasteText() {
        try {
            const text = await navigator.clipboard.readText();
            sourceTextArea.value = text;
            updateCharCount();
            saveText();
            sourceTextArea.focus();
        } catch (error) {
            showError('No se pudo acceder al portapapeles. Usa Ctrl+V para pegar.');
        }
    }

    async function copyTranslation() {
        try {
            await navigator.clipboard.writeText(translatedTextArea.value);
            // Mostrar feedback visual
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '✅';
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 1000);
        } catch (error) {
            showError('No se pudo copiar al portapapeles. Usa Ctrl+C para copiar.');
        }
    }

    function speakTranslation() {
        if (!translatedTextArea.value) {
            showError('No hay texto traducido para reproducir');
            return;
        }

        if ('speechSynthesis' in window) {
            // Cancelar cualquier síntesis en curso
            speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(translatedTextArea.value);
            
            // Configurar idioma basado en el idioma de destino
            const langMap = {
                'inglés': 'en-US',
                'español': 'es-ES',
                'francés': 'fr-FR',
                'alemán': 'de-DE',
                'italiano': 'it-IT',
                'portugués': 'pt-PT',
                'chino': 'zh-CN',
                'japonés': 'ja-JP',
                'coreano': 'ko-KR',
                'ruso': 'ru-RU',
                'árabe': 'ar-SA'
            };
            
            utterance.lang = langMap[targetLanguageSelect.value] || 'en-US';
            utterance.rate = 0.8;
            utterance.pitch = 1;
            
            speechSynthesis.speak(utterance);
        } else {
            showError('Tu navegador no soporta síntesis de voz');
        }
    }

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
            showError('Por favor, introduce tu API Key de OpenAI');
            return;
        }

        if (!text) {
            showError('Por favor, introduce el texto que quieres traducir');
            return;
        }

        if (sourceLang === targetLang && sourceLang !== 'auto') {
            showError('El idioma de origen y destino no pueden ser el mismo');
            return;
        }

        // Mostrar estado de carga
        setLoadingState(true);
        hideMessages();

        try {
            const prompt = generateTranslationPrompt(text, sourceLang, targetLang, options);
            const translation = await callOpenAIAPI(apiKey, prompt);
            
            // Mostrar traducción
            translatedTextArea.value = translation;
            
            // Mostrar información adicional
            showAdditionalInfo(text, translation, sourceLang, targetLang, options);
            
        } catch (error) {
            console.error('Error durante la traducción:', error);
            showError(error.message || 'Error durante la traducción');
        } finally {
            setLoadingState(false);
        }
    }

    function generateTranslationPrompt(text, sourceLang, targetLang, options) {
        let prompt = `Traduce el siguiente texto `;
        
        if (sourceLang === 'auto') {
            prompt += `(detecta automáticamente el idioma) `;
        } else {
            prompt += `del ${sourceLang} `;
        }
        
        prompt += `al ${targetLang}:\n\n"${text}"\n\n`;
        
        prompt += `Instrucciones específicas:\n`;
        
        if (options.formalTone) {
            prompt += `- Usa un tono formal y profesional\n`;
        } else {
            prompt += `- Mantén un tono natural y conversacional\n`;
        }
        
        if (options.contextAware) {
            prompt += `- Considera el contexto y las implicaciones culturales\n`;
            prompt += `- Adapta expresiones idiomáticas apropiadamente\n`;
        }
        
        if (options.preserveFormatting) {
            prompt += `- Preserva el formato original (saltos de línea, espacios, etc.)\n`;
        }
        
        prompt += `- Proporciona solo la traducción, sin explicaciones adicionales\n`;
        prompt += `- Mantén la precisión y fluidez del texto original`;
        
        return prompt;
    }

    async function callOpenAIAPI(apiKey, prompt) {
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 2000,
                    temperature: 0.3
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || `Error HTTP: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content.trim();

        } catch (error) {
            console.error('Error llamando a la API de OpenAI:', error);
            throw new Error(`Error de traducción: ${error.message}`);
        }
    }

    function showAdditionalInfo(originalText, translation, sourceLang, targetLang, options) {
        const wordCountOriginal = originalText.split(/\s+/).length;
        const wordCountTranslation = translation.split(/\s+/).length;
        const charCountOriginal = originalText.length;
        const charCountTranslation = translation.length;
        
        let infoHTML = `
            <h4>📊 Estadísticas de traducción</h4>
            <p><strong>Idioma detectado/origen:</strong> ${sourceLang === 'auto' ? 'Detectado automáticamente' : sourceLang}</p>
            <p><strong>Idioma de destino:</strong> ${targetLang}</p>
            <p><strong>Palabras originales:</strong> ${wordCountOriginal}</p>
            <p><strong>Palabras traducidas:</strong> ${wordCountTranslation}</p>
            <p><strong>Caracteres originales:</strong> ${charCountOriginal}</p>
            <p><strong>Caracteres traducidos:</strong> ${charCountTranslation}</p>
            
            <h4>⚙️ Opciones aplicadas</h4>
            <ul>
                <li>Tono: ${options.formalTone ? 'Formal' : 'Natural'}</li>
                <li>Traducción contextual: ${options.contextAware ? 'Activada' : 'Desactivada'}</li>
                <li>Preservar formato: ${options.preserveFormatting ? 'Activado' : 'Desactivado'}</li>
            </ul>
        `;
        
        translationInfo.innerHTML = infoHTML;
        additionalInfoSection.style.display = 'block';
    }

    function setLoadingState(isLoading) {
        translateBtn.disabled = isLoading;
        if (isLoading) {
            btnText.style.display = 'none';
            loading.style.display = 'flex';
        } else {
            btnText.style.display = 'block';
            loading.style.display = 'none';
        }
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorSection.style.display = 'block';
        additionalInfoSection.style.display = 'none';
        
        // Scroll to error
        errorSection.scrollIntoView({ behavior: 'smooth' });
    }

    function hideMessages() {
        errorSection.style.display = 'none';
        additionalInfoSection.style.display = 'none';
    }

    // Inicializar contador de caracteres
    updateCharCount();

    // Auto-traducir si hay texto y configuración guardada (opcional)
    // Descomenta las siguientes líneas si quieres auto-traducción
    /*
    if (sourceTextArea.value.trim() && apiKeyInput.value.trim()) {
        setTimeout(() => {
            translateText();
        }, 1000);
    }
    */
});