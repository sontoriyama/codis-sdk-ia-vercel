// SST Gemini - UI JavaScript
// Análisis inteligente de direcciones IP con herramientas de IA

class SSTGeminiUI {
    constructor() {
        this.apiKey = '';
        this.isAnalyzing = false;
        this.currentResults = null;
        this.speechSynthesis = window.speechSynthesis;
        
        this.init();
    }

    init() {
        this.loadApiKey();
        this.setupEventListeners();
        this.setupValidation();
        console.log('SST Gemini UI initialized');
    }

    setupEventListeners() {
        // API Key toggle
        document.getElementById('toggleApiKey').addEventListener('click', () => {
            this.toggleApiKeyVisibility();
        });

        // API Key input
        document.getElementById('apiKey').addEventListener('input', (e) => {
            this.handleApiKeyChange(e.target.value);
        });

        // Detect IP button
        document.getElementById('detectIpBtn').addEventListener('click', () => {
            this.detectUserIP();
        });

        // IP input validation
        document.getElementById('ipAddress').addEventListener('input', (e) => {
            this.validateIP(e.target.value);
        });

        // Analyze button
        document.getElementById('analyzeBtn').addEventListener('click', () => {
            this.analyzeIP();
        });

        // Result actions
        document.getElementById('copyToolResults').addEventListener('click', () => {
            this.copyToClipboard('toolResults');
        });

        document.getElementById('copyAiAnalysis').addEventListener('click', () => {
            this.copyToClipboard('aiAnalysis');
        });

        document.getElementById('speakAnalysis').addEventListener('click', () => {
            this.speakText('aiAnalysis');
        });

        document.getElementById('exportResults').addEventListener('click', () => {
            this.exportResults();
        });

        document.getElementById('newAnalysis').addEventListener('click', () => {
            this.resetAnalysis();
        });

        // Error dismiss
        document.getElementById('dismissError').addEventListener('click', () => {
            this.hideError();
        });
    }

    setupValidation() {
        // Real-time IP validation
        const ipInput = document.getElementById('ipAddress');
        ipInput.addEventListener('blur', () => {
            this.validateIP(ipInput.value);
        });
    }

    loadApiKey() {
        const savedApiKey = localStorage.getItem('sst_gemini_api_key');
        if (savedApiKey) {
            this.apiKey = savedApiKey;
            document.getElementById('apiKey').value = savedApiKey;
        }
    }

    handleApiKeyChange(apiKey) {
        this.apiKey = apiKey.trim();
        if (this.apiKey) {
            localStorage.setItem('sst_gemini_api_key', this.apiKey);
        } else {
            localStorage.removeItem('sst_gemini_api_key');
        }
    }

    toggleApiKeyVisibility() {
        const apiKeyInput = document.getElementById('apiKey');
        const toggleBtn = document.getElementById('toggleApiKey');
        
        if (apiKeyInput.type === 'password') {
            apiKeyInput.type = 'text';
            toggleBtn.textContent = '🙈';
        } else {
            apiKeyInput.type = 'password';
            toggleBtn.textContent = '👁️';
        }
    }

    async detectUserIP() {
        const detectBtn = document.getElementById('detectIpBtn');
        const originalText = detectBtn.innerHTML;
        
        try {
            detectBtn.innerHTML = '⏳ Detectando...';
            detectBtn.disabled = true;
            
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            
            document.getElementById('ipAddress').value = data.ip;
            this.validateIP(data.ip);
            
        } catch (error) {
            console.error('Error detecting IP:', error);
            this.showError('No se pudo detectar tu dirección IP. Por favor, ingrésala manualmente.');
        } finally {
            detectBtn.innerHTML = originalText;
            detectBtn.disabled = false;
        }
    }

    validateIP(ip) {
        const validationDiv = document.getElementById('ipValidation');
        
        if (!ip) {
            validationDiv.textContent = '';
            validationDiv.className = 'validation-message';
            return false;
        }

        // IPv4 regex
        const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        
        // IPv6 regex (simplified)
        const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;
        
        if (ipv4Regex.test(ip) || ipv6Regex.test(ip)) {
            validationDiv.textContent = '✅ Dirección IP válida';
            validationDiv.className = 'validation-message valid';
            return true;
        } else {
            validationDiv.textContent = '❌ Formato de IP inválido';
            validationDiv.className = 'validation-message invalid';
            return false;
        }
    }

    getSelectedOptions() {
        const options = [];
        
        if (document.getElementById('includeGeolocation').checked) {
            options.push('geolocalización');
        }
        if (document.getElementById('includeSecurity').checked) {
            options.push('análisis de seguridad');
        }
        if (document.getElementById('includeNetwork').checked) {
            options.push('información de red');
        }
        if (document.getElementById('includeReputation').checked) {
            options.push('reputación');
        }
        
        return options;
    }

    generatePrompt(ip, customPrompt, options) {
        if (customPrompt && customPrompt.trim()) {
            return `${customPrompt.trim()} para la IP ${ip}`;
        }
        
        const optionsText = options.length > 0 
            ? ` enfocándote en: ${options.join(', ')}` 
            : '';
            
        return `Dime la información de la IP ${ip}${optionsText}`;
    }

    async analyzeIP() {
        if (this.isAnalyzing) return;
        
        // Validations
        if (!this.apiKey) {
            this.showError('Por favor, ingresa tu API Key de OpenAI.');
            return;
        }
        
        const ip = document.getElementById('ipAddress').value.trim();
        if (!ip) {
            this.showError('Por favor, ingresa una dirección IP.');
            return;
        }
        
        if (!this.validateIP(ip)) {
            this.showError('Por favor, ingresa una dirección IP válida.');
            return;
        }
        
        this.isAnalyzing = true;
        this.setLoadingState(true);
        this.hideError();
        this.hideResults();
        
        try {
            const customPrompt = document.getElementById('customPrompt').value.trim();
            const options = this.getSelectedOptions();
            const prompt = this.generatePrompt(ip, customPrompt, options);
            
            console.log('Analyzing IP:', ip, 'with prompt:', prompt);
            
            // First API call - Tool execution
            const toolResponse = await this.callOpenAIWithTool(prompt, ip);
            
            if (!toolResponse.toolResults || toolResponse.toolResults.length === 0) {
                throw new Error('No se obtuvieron resultados de la herramienta de análisis de IP');
            }
            
            const toolData = toolResponse.toolResults[0].result;
            
            // Second API call - AI interpretation
            const interpretationPrompt = `Explica de forma natural la información de este objeto: ${JSON.stringify(toolData)}. Directamente explica, no me digas nada más.`;
            const aiResponse = await this.callOpenAIForInterpretation(interpretationPrompt);
            
            // Store and display results
            this.currentResults = {
                ip: ip,
                toolData: toolData,
                aiAnalysis: aiResponse.text,
                timestamp: new Date().toISOString(),
                options: options,
                customPrompt: customPrompt
            };
            
            this.displayResults();
            
        } catch (error) {
            console.error('Analysis error:', error);
            this.showError(`Error durante el análisis: ${error.message}`);
        } finally {
            this.isAnalyzing = false;
            this.setLoadingState(false);
        }
    }

    async callOpenAIWithTool(prompt, ip) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [{
                    role: 'user',
                    content: prompt
                }],
                tools: [{
                    type: 'function',
                    function: {
                        name: 'ipInfo',
                        description: 'Get the info from an IP',
                        parameters: {
                            type: 'object',
                            properties: {
                                ip: {
                                    type: 'string',
                                    description: 'The IP to get info from'
                                }
                            },
                            required: ['ip']
                        }
                    }
                }],
                tool_choice: 'auto'
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        // Execute the tool if requested
        const toolResults = [];
        if (data.choices[0].message.tool_calls) {
            for (const toolCall of data.choices[0].message.tool_calls) {
                if (toolCall.function.name === 'ipInfo') {
                    const args = JSON.parse(toolCall.function.arguments);
                    const toolResult = await this.executeIPTool(args.ip);
                    toolResults.push({
                        id: toolCall.id,
                        result: toolResult
                    });
                }
            }
        }
        
        return { toolResults };
    }

    async executeIPTool(ip) {
        const response = await fetch(`https://ip.guide/${ip}`);
        if (!response.ok) {
            throw new Error(`Error al obtener información de IP: HTTP ${response.status}`);
        }
        return await response.json();
    }

    async callOpenAIForInterpretation(prompt) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [{
                    role: 'user',
                    content: prompt
                }],
                max_tokens: 1000,
                temperature: 0.7
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `HTTP ${response.status}`);
        }
        
        const data = await response.json();
        return {
            text: data.choices[0].message.content
        };
    }

    displayResults() {
        if (!this.currentResults) return;
        
        // Display tool results
        document.getElementById('toolResults').textContent = JSON.stringify(this.currentResults.toolData, null, 2);
        
        // Display AI analysis
        document.getElementById('aiAnalysis').textContent = this.currentResults.aiAnalysis;
        
        // Show results section
        document.getElementById('resultsSection').style.display = 'block';
        
        // Scroll to results
        document.getElementById('resultsSection').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }

    setLoadingState(loading) {
        const analyzeBtn = document.getElementById('analyzeBtn');
        
        if (loading) {
            analyzeBtn.classList.add('loading');
            analyzeBtn.disabled = true;
        } else {
            analyzeBtn.classList.remove('loading');
            analyzeBtn.disabled = false;
        }
    }

    async copyToClipboard(elementId) {
        const element = document.getElementById(elementId);
        let textToCopy = '';
        
        if (elementId === 'toolResults') {
            textToCopy = element.textContent;
        } else if (elementId === 'aiAnalysis') {
            textToCopy = element.textContent;
        }
        
        try {
            await navigator.clipboard.writeText(textToCopy);
            
            // Visual feedback
            const button = event.target;
            const originalText = button.innerHTML;
            button.innerHTML = '✅ Copiado';
            button.style.background = '#10b981';
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.style.background = '';
            }, 2000);
            
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            this.showError('No se pudo copiar al portapapeles');
        }
    }

    speakText(elementId) {
        if (!this.speechSynthesis) {
            this.showError('La síntesis de voz no está disponible en este navegador');
            return;
        }
        
        const element = document.getElementById(elementId);
        const text = element.textContent;
        
        if (!text) {
            this.showError('No hay texto para reproducir');
            return;
        }
        
        // Stop any ongoing speech
        this.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        
        // Visual feedback
        const button = event.target;
        const originalText = button.innerHTML;
        button.innerHTML = '🔊 Reproduciendo...';
        button.disabled = true;
        
        utterance.onend = () => {
            button.innerHTML = originalText;
            button.disabled = false;
        };
        
        utterance.onerror = () => {
            button.innerHTML = originalText;
            button.disabled = false;
            this.showError('Error al reproducir el audio');
        };
        
        this.speechSynthesis.speak(utterance);
    }

    exportResults() {
        if (!this.currentResults) {
            this.showError('No hay resultados para exportar');
            return;
        }
        
        const exportData = {
            ...this.currentResults,
            exportedAt: new Date().toISOString(),
            tool: 'SST Gemini',
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sst-gemini-analysis-${this.currentResults.ip}-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Visual feedback
        const button = event.target;
        const originalText = button.innerHTML;
        button.innerHTML = '✅ Exportado';
        
        setTimeout(() => {
            button.innerHTML = originalText;
        }, 2000);
    }

    resetAnalysis() {
        // Clear form
        document.getElementById('ipAddress').value = '';
        document.getElementById('customPrompt').value = '';
        
        // Reset validation
        const validationDiv = document.getElementById('ipValidation');
        validationDiv.textContent = '';
        validationDiv.className = 'validation-message';
        
        // Hide results and errors
        this.hideResults();
        this.hideError();
        
        // Clear current results
        this.currentResults = null;
        
        // Focus on IP input
        document.getElementById('ipAddress').focus();
    }

    showError(message) {
        document.getElementById('errorMessage').textContent = message;
        document.getElementById('errorSection').style.display = 'block';
        
        // Scroll to error
        document.getElementById('errorSection').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    }

    hideError() {
        document.getElementById('errorSection').style.display = 'none';
    }

    hideResults() {
        document.getElementById('resultsSection').style.display = 'none';
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SSTGeminiUI();
});