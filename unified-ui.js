// Unified UI JavaScript - Integración de todas las herramientas AI

class UnifiedAI {
    constructor() {
        this.apiKeys = {
            openai: '',
            replicate: '',
            gemini: ''
        };
        this.currentTool = 'dalle';
        this.init();
    }

    init() {
        this.loadApiKeys();
        this.setupEventListeners();
        this.setupMobileMenu();
        this.showTool('dalle'); // Mostrar DALL-E por defecto
    }

    // Gestión de claves API
    loadApiKeys() {
        Object.keys(this.apiKeys).forEach(key => {
            const stored = localStorage.getItem(`${key}_api_key`);
            if (stored) {
                this.apiKeys[key] = stored;
                const input = document.getElementById(`${key}-api-key`);
                if (input) {
                    input.value = stored;
                    input.type = 'password';
                }
            }
        });
    }

    saveApiKey(provider, key) {
        this.apiKeys[provider] = key;
        localStorage.setItem(`${provider}_api_key`, key);
    }

    toggleApiKeyVisibility(provider) {
        const input = document.getElementById(`${provider}-api-key`);
        const btn = input.nextElementSibling;
        
        if (input.type === 'password') {
            input.type = 'text';
            btn.textContent = '🙈';
        } else {
            input.type = 'password';
            btn.textContent = '👁️';
        }
    }

    // Navegación entre herramientas
    setupEventListeners() {
        // Botones de herramientas
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tool = e.target.dataset.tool;
                this.showTool(tool);
            });
        });

        // Inputs de API keys
        document.querySelectorAll('[id$="-api-key"]').forEach(input => {
            const provider = input.id.replace('-api-key', '');
            input.addEventListener('input', (e) => {
                this.saveApiKey(provider, e.target.value);
            });
        });

        // Botones de toggle para API keys
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const provider = e.target.dataset.provider;
                this.toggleApiKeyVisibility(provider);
            });
        });

        // Botones de acción específicos de cada herramienta
        this.setupToolSpecificListeners();
    }

    setupToolSpecificListeners() {
        // DALL-E
        const dalleBtn = document.getElementById('generate-dalle');
        if (dalleBtn) {
            dalleBtn.addEventListener('click', () => this.generateDalleImage());
        }

        // Flux
        const fluxBtn = document.getElementById('generate-flux');
        if (fluxBtn) {
            fluxBtn.addEventListener('click', () => this.generateFluxImage());
        }

        // Gemini IP
        const geminiBtn = document.getElementById('analyze-gemini-ip');
        if (geminiBtn) {
            geminiBtn.addEventListener('click', () => this.analyzeGeminiIP());
        }

        // SST Gemini
        const sstBtn = document.getElementById('analyze-sst');
        if (sstBtn) {
            sstBtn.addEventListener('click', () => this.analyzeSSTGemini());
        }

        // Tool Calling
        const toolBtn = document.getElementById('analyze-tool-calling');
        if (toolBtn) {
            toolBtn.addEventListener('click', () => this.analyzeToolCalling());
        }

        // Translator
        const translateBtn = document.getElementById('translate-text');
        if (translateBtn) {
            translateBtn.addEventListener('click', () => this.translateText());
        }

        // Botones de detectar IP
        document.querySelectorAll('[id$="-detect-ip"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const toolName = e.target.id.replace('-detect-ip', '');
                this.detectUserIP(toolName);
            });
        });

        // Botón de intercambio de idiomas
        const swapBtn = document.getElementById('swap-languages');
        if (swapBtn) {
            swapBtn.addEventListener('click', () => this.swapLanguages());
        }
    }

    setupMobileMenu() {
        const mobileBtn = document.querySelector('.mobile-menu-btn');
        const navLinks = document.querySelector('.nav-links');
        
        if (mobileBtn && navLinks) {
            mobileBtn.addEventListener('click', () => {
                mobileBtn.classList.toggle('active');
                navLinks.classList.toggle('active');
            });
        }
    }

    showTool(toolName) {
        // Ocultar todos los paneles
        document.querySelectorAll('.tool-panel').forEach(panel => {
            panel.classList.remove('active');
        });

        // Desactivar todos los botones
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Mostrar panel seleccionado
        const panel = document.getElementById(`${toolName}-panel`);
        const btn = document.querySelector(`[data-tool="${toolName}"]`);
        
        if (panel && btn) {
            panel.classList.add('active');
            btn.classList.add('active');
            this.currentTool = toolName;
        }
    }

    // Funciones de utilidad
    showLoading(buttonId) {
        const btn = document.getElementById(buttonId);
        if (btn) {
            btn.classList.add('loading');
            btn.disabled = true;
        }
    }

    hideLoading(buttonId) {
        const btn = document.getElementById(buttonId);
        if (btn) {
            btn.classList.remove('loading');
            btn.disabled = false;
        }
    }

    showResult(resultId, content, type = 'text') {
        const resultArea = document.getElementById(resultId);
        if (resultArea) {
            if (type === 'image') {
                resultArea.innerHTML = `<img src="${content}" alt="Generated image" />`;
            } else if (type === 'json') {
                resultArea.innerHTML = `<pre>${JSON.stringify(content, null, 2)}</pre>`;
            } else {
                resultArea.innerHTML = content;
            }
            resultArea.classList.add('show');
        }
    }

    showError(message) {
        const errorOverlay = document.getElementById('error-overlay');
        const errorMessage = document.getElementById('error-message');
        
        if (errorOverlay && errorMessage) {
            errorMessage.textContent = message;
            errorOverlay.classList.add('show');
            
            // Auto-cerrar después de 5 segundos
            setTimeout(() => {
                errorOverlay.classList.remove('show');
            }, 5000);
        }
    }

    validateIP(ip) {
        const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        return ipRegex.test(ip);
    }

    async detectUserIP(toolPrefix) {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            const ipInput = document.getElementById(`${toolPrefix}-ip`);
            if (ipInput) {
                ipInput.value = data.ip;
                this.validateIPInput(toolPrefix, data.ip);
            }
        } catch (error) {
            this.showError('Error al detectar la IP: ' + error.message);
        }
    }

    validateIPInput(toolPrefix, ip) {
        const validationMsg = document.getElementById(`${toolPrefix}-ip-validation`);
        if (validationMsg) {
            if (this.validateIP(ip)) {
                validationMsg.textContent = '✓ IP válida';
                validationMsg.className = 'validation-message valid';
            } else {
                validationMsg.textContent = '✗ Formato de IP inválido';
                validationMsg.className = 'validation-message invalid';
            }
        }
    }

    // Funciones específicas de cada herramienta
    async generateDalleImage() {
        if (!this.apiKeys.openai) {
            this.showError('Por favor, configura tu clave API de OpenAI');
            return;
        }

        const prompt = document.getElementById('dalle-prompt').value;
        const size = document.getElementById('dalle-size').value;
        const quality = document.getElementById('dalle-quality').value;
        const style = document.getElementById('dalle-style').value;

        if (!prompt.trim()) {
            this.showError('Por favor, ingresa una descripción para la imagen');
            return;
        }

        this.showLoading('generate-dalle');

        try {
            const response = await fetch('https://api.openai.com/v1/images/generations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKeys.openai}`
                },
                body: JSON.stringify({
                    model: 'dall-e-3',
                    prompt: prompt,
                    size: size,
                    quality: quality,
                    style: style,
                    n: 1
                })
            });

            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error.message);
            }

            this.showResult('dalle-result', data.data[0].url, 'image');
        } catch (error) {
            this.showError('Error al generar imagen: ' + error.message);
        } finally {
            this.hideLoading('generate-dalle');
        }
    }

    async generateFluxImage() {
        if (!this.apiKeys.replicate) {
            this.showError('Por favor, configura tu clave API de Replicate');
            return;
        }

        const prompt = document.getElementById('flux-prompt').value;
        const aspectRatio = document.getElementById('flux-aspect-ratio').value;
        const outputFormat = document.getElementById('flux-output-format').value;
        const outputQuality = document.getElementById('flux-output-quality').value;

        if (!prompt.trim()) {
            this.showError('Por favor, ingresa una descripción para la imagen');
            return;
        }

        this.showLoading('generate-flux');

        try {
            const response = await fetch('https://api.replicate.com/v1/predictions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${this.apiKeys.replicate}`
                },
                body: JSON.stringify({
                    version: 'black-forest-labs/flux-schnell',
                    input: {
                        prompt: prompt,
                        aspect_ratio: aspectRatio,
                        output_format: outputFormat,
                        output_quality: parseInt(outputQuality)
                    }
                })
            });

            const prediction = await response.json();
            
            if (prediction.error) {
                throw new Error(prediction.error);
            }

            // Polling para obtener el resultado
            await this.pollFluxResult(prediction.id);
        } catch (error) {
            this.showError('Error al generar imagen: ' + error.message);
        } finally {
            this.hideLoading('generate-flux');
        }
    }

    async pollFluxResult(predictionId) {
        const maxAttempts = 30;
        let attempts = 0;

        const poll = async () => {
            try {
                const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
                    headers: {
                        'Authorization': `Token ${this.apiKeys.replicate}`
                    }
                });

                const prediction = await response.json();

                if (prediction.status === 'succeeded') {
                    this.showResult('flux-result', prediction.output[0], 'image');
                    return;
                } else if (prediction.status === 'failed') {
                    throw new Error('La generación de imagen falló');
                } else if (attempts < maxAttempts) {
                    attempts++;
                    setTimeout(poll, 2000);
                } else {
                    throw new Error('Tiempo de espera agotado');
                }
            } catch (error) {
                this.showError('Error al obtener resultado: ' + error.message);
            }
        };

        poll();
    }

    async analyzeGeminiIP() {
        if (!this.apiKeys.openai) {
            this.showError('Por favor, configura tu clave API de OpenAI');
            return;
        }

        const ip = document.getElementById('gemini-ip').value;
        const customPrompt = document.getElementById('gemini-custom-prompt').value;

        if (!ip.trim()) {
            this.showError('Por favor, ingresa una dirección IP');
            return;
        }

        if (!this.validateIP(ip)) {
            this.showError('Por favor, ingresa una dirección IP válida');
            return;
        }

        this.showLoading('analyze-gemini-ip');

        try {
            // Primero obtener información de la IP
            const ipResponse = await fetch(`http://ip-api.com/json/${ip}`);
            const ipData = await ipResponse.json();

            // Luego analizar con OpenAI
            const prompt = customPrompt || `Analiza esta información de IP y proporciona insights sobre geolocalización, seguridad, red y reputación: ${JSON.stringify(ipData)}`;

            const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKeys.openai}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: 1000
                })
            });

            const aiData = await aiResponse.json();
            
            if (aiData.error) {
                throw new Error(aiData.error.message);
            }

            const result = `
                <h3>Información Técnica:</h3>
                <pre>${JSON.stringify(ipData, null, 2)}</pre>
                <h3>Análisis AI:</h3>
                <p>${aiData.choices[0].message.content}</p>
            `;

            this.showResult('gemini-result', result);
        } catch (error) {
            this.showError('Error al analizar IP: ' + error.message);
        } finally {
            this.hideLoading('analyze-gemini-ip');
        }
    }

    async analyzeSSTGemini() {
        if (!this.apiKeys.openai) {
            this.showError('Por favor, configura tu clave API de OpenAI');
            return;
        }

        const ip = document.getElementById('sst-ip').value;
        const customPrompt = document.getElementById('sst-custom-prompt').value;
        const analysisOptions = [];
        
        document.querySelectorAll('#sst-panel input[type="checkbox"]:checked').forEach(checkbox => {
            analysisOptions.push(checkbox.value);
        });

        if (!ip.trim()) {
            this.showError('Por favor, ingresa una dirección IP');
            return;
        }

        if (!this.validateIP(ip)) {
            this.showError('Por favor, ingresa una dirección IP válida');
            return;
        }

        this.showLoading('analyze-sst');

        try {
            // Obtener información de la IP desde ip.guide
            const ipResponse = await fetch(`https://ip.guide/${ip}`);
            const ipData = await ipResponse.json();

            // Crear prompt basado en opciones seleccionadas
            let prompt = customPrompt;
            if (!prompt) {
                prompt = `Analiza esta información de IP enfocándote en: ${analysisOptions.join(', ')}. Datos: ${JSON.stringify(ipData)}`;
            }

            const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKeys.openai}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: 1000
                })
            });

            const aiData = await aiResponse.json();
            
            if (aiData.error) {
                throw new Error(aiData.error.message);
            }

            const result = `
                <h3>Información Técnica:</h3>
                <pre>${JSON.stringify(ipData, null, 2)}</pre>
                <h3>Análisis AI:</h3>
                <p>${aiData.choices[0].message.content}</p>
            `;

            this.showResult('sst-result', result);
        } catch (error) {
            this.showError('Error al analizar IP: ' + error.message);
        } finally {
            this.hideLoading('analyze-sst');
        }
    }

    async analyzeToolCalling() {
        if (!this.apiKeys.openai) {
            this.showError('Por favor, configura tu clave API de OpenAI');
            return;
        }

        const ip = document.getElementById('tool-calling-ip').value;
        const customPrompt = document.getElementById('tool-calling-custom-prompt').value;

        if (!ip.trim()) {
            this.showError('Por favor, ingresa una dirección IP');
            return;
        }

        if (!this.validateIP(ip)) {
            this.showError('Por favor, ingresa una dirección IP válida');
            return;
        }

        this.showLoading('analyze-tool-calling');

        try {
            // Simular tool calling con información de IP
            const ipResponse = await fetch(`https://ip.guide/${ip}`);
            const ipData = await ipResponse.json();

            const prompt = customPrompt || `Analiza esta información de IP y proporciona un análisis detallado: ${JSON.stringify(ipData)}`;

            const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKeys.openai}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: 1000
                })
            });

            const aiData = await aiResponse.json();
            
            if (aiData.error) {
                throw new Error(aiData.error.message);
            }

            const result = `
                <h3>Tool Information:</h3>
                <pre>${JSON.stringify(ipData, null, 2)}</pre>
                <h3>AI Analysis:</h3>
                <p>${aiData.choices[0].message.content}</p>
            `;

            this.showResult('tool-calling-result', result);
        } catch (error) {
            this.showError('Error al analizar IP: ' + error.message);
        } finally {
            this.hideLoading('analyze-tool-calling');
        }
    }

    async translateText() {
        if (!this.apiKeys.openai) {
            this.showError('Por favor, configura tu clave API de OpenAI');
            return;
        }

        const sourceText = document.getElementById('source-text').value;
        const sourceLang = document.getElementById('source-language').value;
        const targetLang = document.getElementById('target-language').value;
        
        const formalTone = document.getElementById('formal-tone').checked;
        const contextual = document.getElementById('contextual-translation').checked;
        const preserveFormat = document.getElementById('preserve-formatting').checked;

        if (!sourceText.trim()) {
            this.showError('Por favor, ingresa el texto a traducir');
            return;
        }

        this.showLoading('translate-text');

        try {
            let prompt = `Traduce el siguiente texto de ${sourceLang} a ${targetLang}: "${sourceText}"`;
            
            if (formalTone) prompt += ' Usa un tono formal.';
            if (contextual) prompt += ' Considera el contexto cultural.';
            if (preserveFormat) prompt += ' Preserva el formato original.';

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKeys.openai}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: 1000
                })
            });

            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error.message);
            }

            const translatedText = data.choices[0].message.content;
            document.getElementById('target-text').value = translatedText;
            this.updateCharCount('target-text', 'target-char-count');
        } catch (error) {
            this.showError('Error al traducir: ' + error.message);
        } finally {
            this.hideLoading('translate-text');
        }
    }

    swapLanguages() {
        const sourceLang = document.getElementById('source-language');
        const targetLang = document.getElementById('target-language');
        const sourceText = document.getElementById('source-text');
        const targetText = document.getElementById('target-text');

        // Intercambiar idiomas
        const tempLang = sourceLang.value;
        sourceLang.value = targetLang.value;
        targetLang.value = tempLang;

        // Intercambiar textos
        const tempText = sourceText.value;
        sourceText.value = targetText.value;
        targetText.value = tempText;

        // Actualizar contadores
        this.updateCharCount('source-text', 'source-char-count');
        this.updateCharCount('target-text', 'target-char-count');
    }

    updateCharCount(textareaId, counterId) {
        const textarea = document.getElementById(textareaId);
        const counter = document.getElementById(counterId);
        if (textarea && counter) {
            counter.textContent = `${textarea.value.length} caracteres`;
        }
    }

    // Funciones de utilidad para el traductor
    copyText(textareaId) {
        const textarea = document.getElementById(textareaId);
        if (textarea) {
            navigator.clipboard.writeText(textarea.value);
            this.showSuccess('Texto copiado al portapapeles');
        }
    }

    pasteText(textareaId) {
        navigator.clipboard.readText().then(text => {
            const textarea = document.getElementById(textareaId);
            if (textarea) {
                textarea.value = text;
                this.updateCharCount(textareaId, textareaId.replace('-text', '-char-count'));
            }
        });
    }

    clearText(textareaId) {
        const textarea = document.getElementById(textareaId);
        if (textarea) {
            textarea.value = '';
            this.updateCharCount(textareaId, textareaId.replace('-text', '-char-count'));
        }
    }

    speakText(textareaId) {
        const textarea = document.getElementById(textareaId);
        if (textarea && textarea.value) {
            const utterance = new SpeechSynthesisUtterance(textarea.value);
            speechSynthesis.speak(utterance);
        }
    }

    showSuccess(message) {
        // Crear y mostrar mensaje de éxito temporal
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.unifiedAI = new UnifiedAI();
    
    // Cerrar overlay de error al hacer clic
    document.getElementById('error-overlay')?.addEventListener('click', (e) => {
        if (e.target.id === 'error-overlay') {
            e.target.classList.remove('show');
        }
    });
    
    // Configurar contadores de caracteres para el traductor
    ['source-text', 'target-text'].forEach(id => {
        const textarea = document.getElementById(id);
        if (textarea) {
            textarea.addEventListener('input', () => {
                window.unifiedAI.updateCharCount(id, id.replace('-text', '-char-count'));
            });
        }
    });
    
    // Configurar validación de IP en tiempo real
    ['gemini-ip', 'sst-ip', 'tool-calling-ip'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', (e) => {
                const toolPrefix = id.replace('-ip', '');
                window.unifiedAI.validateIPInput(toolPrefix, e.target.value);
            });
        }
    });
});