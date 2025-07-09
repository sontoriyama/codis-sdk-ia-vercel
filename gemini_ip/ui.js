document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const apiKeyInput = document.getElementById('apiKey');
    const ipAddressInput = document.getElementById('ipAddress');
    const detectBtn = document.getElementById('detectBtn');
    const geoLocationCheck = document.getElementById('geoLocation');
    const securityCheck = document.getElementById('security');
    const networkCheck = document.getElementById('network');
    const reputationCheck = document.getElementById('reputation');
    const customPromptInput = document.getElementById('customPrompt');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const btnText = document.querySelector('.btn-text');
    const loading = document.querySelector('.loading');
    const resultSection = document.getElementById('result');
    const errorSection = document.getElementById('error');
    const basicInfo = document.getElementById('basicInfo');
    const aiAnalysis = document.getElementById('aiAnalysis');
    const errorMessage = document.getElementById('errorMessage');
    const exportBtn = document.getElementById('exportBtn');
    const newAnalysisBtn = document.getElementById('newAnalysisBtn');

    let currentAnalysisData = null;

    // Cargar API key guardada
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (savedApiKey) {
        apiKeyInput.value = savedApiKey;
    }

    // Guardar API key cuando cambie
    apiKeyInput.addEventListener('change', function() {
        if (this.value.trim()) {
            localStorage.setItem('gemini_api_key', this.value.trim());
        }
    });

    // Función para validar IP
    function isValidIP(ip) {
        const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;
        return ipv4Regex.test(ip) || ipv6Regex.test(ip);
    }

    // Validación en tiempo real de IP
    ipAddressInput.addEventListener('input', function() {
        const ip = this.value.trim();
        if (ip.length > 0) {
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

    // Función para detectar IP del usuario
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
    function showResult(basicInfoData, aiAnalysisData) {
        basicInfo.innerHTML = basicInfoData;
        aiAnalysis.innerHTML = aiAnalysisData;
        resultSection.style.display = 'block';
        errorSection.style.display = 'none';
    }

    // Función para cambiar estado del botón
    function setButtonLoading(isLoading) {
        analyzeBtn.disabled = isLoading;
        if (isLoading) {
            btnText.style.display = 'none';
            loading.style.display = 'inline';
        } else {
            btnText.style.display = 'inline';
            loading.style.display = 'none';
        }
    }

    // Función para obtener información básica de IP
    async function getBasicIPInfo(ip) {
        try {
            const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`);
            const data = await response.json();
            
            if (data.status === 'success') {
                return {
                    ip: data.query,
                    country: data.country,
                    region: data.regionName,
                    city: data.city,
                    isp: data.isp,
                    org: data.org,
                    timezone: data.timezone,
                    coordinates: `${data.lat}, ${data.lon}`
                };
            } else {
                throw new Error(data.message || 'Error al obtener información de IP');
            }
        } catch (error) {
            console.warn('Error obteniendo info básica:', error);
            return {
                ip: ip,
                country: 'No disponible',
                region: 'No disponible',
                city: 'No disponible',
                isp: 'No disponible',
                org: 'No disponible',
                timezone: 'No disponible',
                coordinates: 'No disponible'
            };
        }
    }

    // Función para generar prompt para Gemini
    function generatePrompt(ip, options, customPrompt, basicInfo) {
        let prompt = `Analiza la siguiente dirección IP: ${ip}\n\n`;
        
        prompt += `Información básica disponible:\n`;
        prompt += `- País: ${basicInfo.country}\n`;
        prompt += `- Región: ${basicInfo.region}\n`;
        prompt += `- Ciudad: ${basicInfo.city}\n`;
        prompt += `- ISP: ${basicInfo.isp}\n`;
        prompt += `- Organización: ${basicInfo.org}\n`;
        prompt += `- Zona horaria: ${basicInfo.timezone}\n\n`;
        
        prompt += `Por favor, proporciona un análisis detallado que incluya:\n\n`;
        
        if (options.geoLocation) {
            prompt += `1. **Geolocalización**: Análisis detallado de la ubicación geográfica y su precisión\n`;
        }
        
        if (options.security) {
            prompt += `2. **Seguridad**: Evaluación de riesgos potenciales, si es una IP conocida por actividades maliciosas\n`;
        }
        
        if (options.network) {
            prompt += `3. **Red**: Información sobre la infraestructura de red, tipo de conexión, posibles servicios\n`;
        }
        
        if (options.reputation) {
            prompt += `4. **Reputación**: Evaluación de la reputación de la IP y su historial conocido\n`;
        }
        
        if (customPrompt) {
            prompt += `\n**Pregunta específica**: ${customPrompt}\n`;
        }
        
        prompt += `\nPor favor, estructura tu respuesta de manera clara y profesional, destacando cualquier información importante sobre seguridad o riesgos potenciales.`;
        
        return prompt;
    }

    // Función principal para analizar IP
    async function analyzeIP() {
        const apiKey = apiKeyInput.value.trim();
        const ip = ipAddressInput.value.trim();
        const customPrompt = customPromptInput.value.trim();
        
        const options = {
            geoLocation: geoLocationCheck.checked,
            security: securityCheck.checked,
            network: networkCheck.checked,
            reputation: reputationCheck.checked
        };

        // Validaciones
        if (!apiKey) {
            showError('Por favor, introduce tu API Key de Google Gemini');
            return;
        }

        if (!ip) {
            showError('Por favor, introduce una dirección IP para analizar');
            return;
        }

        if (!isValidIP(ip)) {
            showError('Por favor, introduce una dirección IP válida');
            return;
        }

        if (!Object.values(options).some(option => option) && !customPrompt) {
            showError('Por favor, selecciona al menos una opción de análisis o añade una pregunta personalizada');
            return;
        }

        hideMessages();
        setButtonLoading(true);

        try {
            // Obtener información básica de IP
            const basicIPInfo = await getBasicIPInfo(ip);
            
            // Generar prompt para Gemini
            const prompt = generatePrompt(ip, options, customPrompt, basicIPInfo);
            
            // Llamar a la API de Gemini
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
                const aiAnalysisText = data.candidates[0].content.parts[0].text;
                
                // Formatear información básica
                const basicInfoHTML = `
                    <p><strong>🌐 IP:</strong> ${basicIPInfo.ip}</p>
                    <p><strong>🏳️ País:</strong> ${basicIPInfo.country}</p>
                    <p><strong>📍 Región:</strong> ${basicIPInfo.region}</p>
                    <p><strong>🏙️ Ciudad:</strong> ${basicIPInfo.city}</p>
                    <p><strong>🌐 ISP:</strong> ${basicIPInfo.isp}</p>
                    <p><strong>🏢 Organización:</strong> ${basicIPInfo.org}</p>
                    <p><strong>🕐 Zona horaria:</strong> ${basicIPInfo.timezone}</p>
                    <p><strong>📍 Coordenadas:</strong> ${basicIPInfo.coordinates}</p>
                `;
                
                // Formatear análisis de IA (convertir markdown básico a HTML)
                const aiAnalysisHTML = aiAnalysisText
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/\n\n/g, '</p><p>')
                    .replace(/\n/g, '<br>')
                    .replace(/^/, '<p>')
                    .replace(/$/, '</p>');
                
                currentAnalysisData = {
                    ip: ip,
                    basicInfo: basicIPInfo,
                    aiAnalysis: aiAnalysisText,
                    timestamp: new Date().toISOString()
                };
                
                showResult(basicInfoHTML, aiAnalysisHTML);
            } else {
                throw new Error('No se pudo obtener un análisis válido de Gemini');
            }

        } catch (error) {
            console.error('Error al analizar IP:', error);
            
            let errorMsg = 'Error al analizar la IP: ';
            
            if (error.message.includes('401') || error.message.includes('403')) {
                errorMsg += 'API Key inválida. Verifica tu clave de Google Gemini.';
            } else if (error.message.includes('429')) {
                errorMsg += 'Has excedido el límite de solicitudes. Espera un momento e intenta de nuevo.';
            } else if (error.message.includes('400')) {
                errorMsg += 'La solicitud no es válida. Revisa la IP y configuración.';
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

    // Función para exportar resultados
    function exportResults() {
        if (!currentAnalysisData) return;
        
        const exportData = {
            ...currentAnalysisData,
            exportedAt: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ip-analysis-${currentAnalysisData.ip}-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // Función para nuevo análisis
    function newAnalysis() {
        hideMessages();
        currentAnalysisData = null;
        ipAddressInput.value = '';
        customPromptInput.value = '';
        ipAddressInput.classList.remove('ip-valid', 'ip-invalid');
        ipAddressInput.focus();
    }

    // Event listeners
    detectBtn.addEventListener('click', detectUserIP);
    analyzeBtn.addEventListener('click', analyzeIP);
    exportBtn.addEventListener('click', exportResults);
    newAnalysisBtn.addEventListener('click', newAnalysis);

    // Permitir analizar con Enter en el campo de IP
    ipAddressInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            analyzeIP();
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
    console.log('🔍 Gemini IP Analyzer cargado correctamente!');
    console.log('💡 Tip: Presiona Enter en el campo de IP para analizar rápidamente');
});