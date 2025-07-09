document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const apiKeyInput = document.getElementById('apiKey');
    const ipAddressInput = document.getElementById('ipAddress');
    const detectBtn = document.getElementById('detectBtn');
    const customPromptInput = document.getElementById('customPrompt');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const btnText = document.querySelector('.btn-text');
    const loading = document.querySelector('.loading');
    const resultSection = document.getElementById('result');
    const errorSection = document.getElementById('error');
    const toolInfo = document.getElementById('toolInfo');
    const aiAnalysis = document.getElementById('aiAnalysis');
    const errorMessage = document.getElementById('errorMessage');
    const exportBtn = document.getElementById('exportBtn');
    const newAnalysisBtn = document.getElementById('newAnalysisBtn');
    const retryBtn = document.getElementById('retryBtn');

    let currentAnalysisData = null;

    // Cargar API key guardada
    const savedApiKey = localStorage.getItem('toolcalling_openai_api_key');
    if (savedApiKey) {
        apiKeyInput.value = savedApiKey;
    }

    // Guardar API key
    apiKeyInput.addEventListener('change', function() {
        if (this.value.trim()) {
            localStorage.setItem('toolcalling_openai_api_key', this.value.trim());
        }
    });

    // Validación de IP en tiempo real
    ipAddressInput.addEventListener('input', function() {
        const ip = this.value.trim();
        if (ip) {
            if (isValidIP(ip)) {
                this.classList.remove('ip-invalid');
                this.classList.add('ip-valid');
            } else {
                this.classList.remove('ip-valid');
                this.classList.add('ip-invalid');
            }
        } else {
            this.classList.remove('ip-valid', 'ip-invalid');
        }
    });

    function isValidIP(ip) {
        const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;
        return ipv4Regex.test(ip) || ipv6Regex.test(ip);
    }

    // Detectar IP del usuario
    detectBtn.addEventListener('click', detectUserIP);

    async function detectUserIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            ipAddressInput.value = data.ip;
            ipAddressInput.dispatchEvent(new Event('input'));
        } catch (error) {
            showError('No se pudo detectar tu IP automáticamente');
        }
    }

    // Función principal de análisis
    analyzeBtn.addEventListener('click', analyzeIP);
    retryBtn.addEventListener('click', analyzeIP);

    async function analyzeIP() {
        const apiKey = apiKeyInput.value.trim();
        const ip = ipAddressInput.value.trim();
        const customPrompt = customPromptInput.value.trim();

        // Validaciones
        if (!apiKey) {
            showError('Por favor, introduce tu API Key de OpenAI');
            return;
        }

        if (!ip) {
            showError('Por favor, introduce una dirección IP');
            return;
        }

        if (!isValidIP(ip)) {
            showError('Por favor, introduce una dirección IP válida');
            return;
        }

        // Mostrar estado de carga
        setLoadingState(true);
        hideMessages();

        try {
            // Simular el comportamiento del tool calling
            const toolResult = await getIPInfo(ip);
            
            if (toolResult.error) {
                throw new Error(toolResult.error);
            }

            // Generar análisis con IA
            const aiAnalysisResult = await generateAIAnalysis(apiKey, toolResult, customPrompt);

            // Mostrar resultados
            currentAnalysisData = {
                ip: ip,
                toolResult: toolResult,
                aiAnalysis: aiAnalysisResult,
                timestamp: new Date().toISOString(),
                customPrompt: customPrompt
            };

            showResult(toolResult, aiAnalysisResult);

        } catch (error) {
            console.error('Error durante el análisis:', error);
            showError(error.message || 'Error durante el análisis de la IP');
        } finally {
            setLoadingState(false);
        }
    }

    // Simular la función de tool calling para obtener información de IP
    async function getIPInfo(ip) {
        try {
            const response = await fetch(`https://ip.guide/${ip}`);
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error obteniendo información de IP:', error);
            // Fallback a otra API si ip.guide falla
            try {
                const fallbackResponse = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`);
                const fallbackData = await fallbackResponse.json();
                
                if (fallbackData.status === 'success') {
                    return {
                        ip: fallbackData.query,
                        country: fallbackData.country,
                        region: fallbackData.regionName,
                        city: fallbackData.city,
                        isp: fallbackData.isp,
                        organization: fallbackData.org,
                        timezone: fallbackData.timezone,
                        coordinates: {
                            lat: fallbackData.lat,
                            lon: fallbackData.lon
                        }
                    };
                } else {
                    throw new Error(fallbackData.message || 'Error al obtener información de IP');
                }
            } catch (fallbackError) {
                return {
                    error: 'No se pudo obtener información de la IP desde ninguna fuente',
                    ip: ip
                };
            }
        }
    }

    // Generar análisis con IA usando la API de OpenAI
    async function generateAIAnalysis(apiKey, toolResult, customPrompt) {
        const basePrompt = `Explica de forma natural la información de este objeto: ${JSON.stringify(toolResult)}. Directamente explica, no me digas nada más.`;
        
        const prompt = customPrompt 
            ? `${customPrompt}\n\nInformación de la IP: ${JSON.stringify(toolResult)}`
            : basePrompt;

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4',
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 1000,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || `Error HTTP: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;

        } catch (error) {
            console.error('Error generando análisis de IA:', error);
            throw new Error(`Error al generar análisis: ${error.message}`);
        }
    }

    function setLoadingState(isLoading) {
        analyzeBtn.disabled = isLoading;
        if (isLoading) {
            btnText.style.display = 'none';
            loading.style.display = 'flex';
        } else {
            btnText.style.display = 'block';
            loading.style.display = 'none';
        }
    }

    function showResult(toolData, aiAnalysisData) {
        toolInfo.innerHTML = `<pre>${JSON.stringify(toolData, null, 2)}</pre>`;
        aiAnalysis.innerHTML = formatAIAnalysis(aiAnalysisData);
        
        resultSection.style.display = 'block';
        errorSection.style.display = 'none';
        
        // Scroll to results
        resultSection.scrollIntoView({ behavior: 'smooth' });
    }

    function formatAIAnalysis(text) {
        // Convertir texto plano en HTML con formato básico
        return text
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/^/, '<p>')
            .replace(/$/, '</p>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorSection.style.display = 'block';
        resultSection.style.display = 'none';
        
        // Scroll to error
        errorSection.scrollIntoView({ behavior: 'smooth' });
    }

    function hideMessages() {
        errorSection.style.display = 'none';
        resultSection.style.display = 'none';
    }

    // Exportar resultados
    exportBtn.addEventListener('click', exportResults);

    function exportResults() {
        if (!currentAnalysisData) return;
        
        const exportData = {
            ...currentAnalysisData,
            exportedAt: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tool-calling-ip-analysis-${currentAnalysisData.ip}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Nuevo análisis
    newAnalysisBtn.addEventListener('click', newAnalysis);

    function newAnalysis() {
        hideMessages();
        currentAnalysisData = null;
        ipAddressInput.value = '104.28.223.105';
        customPromptInput.value = '';
        ipAddressInput.classList.remove('ip-valid', 'ip-invalid');
        ipAddressInput.focus();
    }

    // Inicializar validación de IP por defecto
    ipAddressInput.dispatchEvent(new Event('input'));
});