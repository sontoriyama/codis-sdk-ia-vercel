// Function to toggle visibility of details sections
function toggleVisibility(elementId) {
    const element = document.getElementById(elementId);
    if (element.style.display === 'none' || element.style.display === '') {
        element.style.display = 'block';
    } else {
        element.style.display = 'none';
    }
}

// Function to fetch and display content
async function fetchAndDisplay(readmePath, codePath, readmeId, codeId) {
    try {
        // Fetch README content
        const readmeResponse = await fetch(readmePath);
        const readmeText = await readmeResponse.text();
        document.getElementById(readmeId).innerHTML = marked.parse(readmeText);

        // Fetch code content
        const codeResponse = await fetch(codePath);
        const codeText = await codeResponse.text();
        document.getElementById(codeId).textContent = codeText;
    } catch (error) {
        console.error("Error fetching content:", error);
        document.getElementById(readmeId).innerHTML = "Error loading content.";
        document.getElementById(codeId).textContent = "Error loading code.";
    }
}

// Run DALL-E
function runDalle() {
    // Crear un formulario para solicitar la API key y el prompt
    const apiKey = prompt('Introduce tu API Key de OpenAI:');
    if (!apiKey) {
        alert('Se requiere una API Key para continuar.');
        return;
    }
    
    const promptText = prompt('Introduce el prompt para generar la imagen:', 'A cat flying over a city, in the style of Studio Ghibli animation');
    if (!promptText) return;
    
    // Mostrar estado
    const statusElement = document.createElement('div');
    statusElement.className = 'status-message';
    statusElement.textContent = 'Generando imagen...';
    document.getElementById('dalle-content').appendChild(statusElement);
    
    // Llamar a la API de OpenAI (usando fetch del navegador)
    fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'dall-e-3',
            prompt: promptText,
            n: 1,
            size: '1024x1024'
        })
    })
    .then(response => {
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        return response.json();
    })
    .then(data => {
        // Mostrar la imagen generada
        statusElement.remove();
        const imgElement = document.createElement('img');
        imgElement.src = data.data[0].url;
        imgElement.alt = 'Imagen generada por DALL-E';
        imgElement.style.maxWidth = '100%';
        imgElement.style.marginTop = '20px';
        document.getElementById('dalle-content').appendChild(imgElement);
    })
    .catch(error => {
        statusElement.textContent = `Error: ${error.message}`;
        statusElement.style.color = 'red';
    });
}

// Run Flux
function runFlux() {
    // Crear un formulario para solicitar la API key y configuración
    const apiKey = prompt('Introduce tu API Key de Black Forest Labs:');
    if (!apiKey) {
        alert('Se requiere una API Key para continuar.');
        return;
    }
    
    // Solicitar URL de la imagen a editar
    const imageUrl = prompt('Introduce la URL de la imagen a editar:');
    if (!imageUrl) return;
    
    // Solicitar el prompt para la edición
    const promptText = prompt('Introduce el prompt para editar la imagen:', 'A small, fluffy cat sleeping on the sofa, cartoon style');
    if (!promptText) return;
    
    // Mostrar estado
    const statusElement = document.createElement('div');
    statusElement.className = 'status-message';
    statusElement.textContent = 'Procesando imagen...';
    document.getElementById('flux-content').appendChild(statusElement);
    
    // Primero descargamos la imagen
    fetch(imageUrl)
        .then(response => {
            if (!response.ok) throw new Error('No se pudo descargar la imagen');
            return response.blob();
        })
        .then(imageBlob => {
            // Crear FormData para enviar la imagen
            const formData = new FormData();
            formData.append('prompt', promptText);
            formData.append('image', imageBlob, 'image.png');
            
            // Llamar a la API de Black Forest Labs
            return fetch('https://api.blackforestlabs.ai/v1/images/edits/context', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                },
                body: formData
            });
        })
        .then(response => {
            if (!response.ok) throw new Error(`Error de la API: ${response.status}`);
            return response.blob();
        })
        .then(imageBlob => {
            // Mostrar la imagen editada
            statusElement.remove();
            const imgElement = document.createElement('img');
            imgElement.src = URL.createObjectURL(imageBlob);
            imgElement.alt = 'Imagen editada por Flux';
            imgElement.style.maxWidth = '100%';
            imgElement.style.marginTop = '20px';
            document.getElementById('flux-content').appendChild(imgElement);
        })
        .catch(error => {
            statusElement.textContent = `Error: ${error.message}`;
            statusElement.style.color = 'red';
        });
}

// Run Gemini
function runGemini() {
    // Crear un formulario para solicitar la API key y la IP
    const apiKey = prompt('Introduce tu API Key de OpenAI:');
    if (!apiKey) {
        alert('Se requiere una API Key para continuar.');
        return;
    }
    
    const ipAddress = prompt('Introduce la dirección IP a analizar:', '104.28.223.105');
    if (!ipAddress) return;
    
    // Validar formato de IP
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (!ipRegex.test(ipAddress)) {
        alert('Por favor, introduce una dirección IP válida.');
        return;
    }
    
    // Mostrar estado
    const statusElement = document.createElement('div');
    statusElement.className = 'status-message';
    statusElement.textContent = 'Analizando IP...';
    document.getElementById('gemini-content').appendChild(statusElement);
    
    // Primero obtenemos la información de la IP
    fetch(`https://ip.guide/${ipAddress}`)
        .then(response => {
            if (!response.ok) throw new Error('No se pudo obtener información de la IP');
            return response.json();
        })
        .then(ipData => {
            // Ahora usamos la API de OpenAI para interpretar los resultados
            return fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini', // Usamos un modelo disponible
                    messages: [
                        {
                            role: 'user',
                            content: `Explica de forma natural la información de este objeto: ${JSON.stringify(ipData)}. Directamente explica, no me digas nada más.`
                        }
                    ]
                })
            });
        })
        .then(response => {
            if (!response.ok) throw new Error(`Error de la API: ${response.status}`);
            return response.json();
        })
        .then(data => {
            // Mostrar la explicación
            statusElement.remove();
            const resultElement = document.createElement('div');
            resultElement.className = 'ip-result';
            resultElement.innerHTML = `<h4>Resultado del análisis de IP: ${ipAddress}</h4><p>${data.choices[0].message.content}</p>`;
            document.getElementById('gemini-content').appendChild(resultElement);
        })
        .catch(error => {
            statusElement.textContent = `Error: ${error.message}`;
            statusElement.style.color = 'red';
        });
}

// Run Translator
function runTranslator() {
    // Crear un formulario para solicitar la API key y el texto
    const apiKey = prompt('Introduce tu API Key de OpenAI:');
    if (!apiKey) {
        alert('Se requiere una API Key para continuar.');
        return;
    }
    
    const textToTranslate = prompt('Introduce el texto a traducir:');
    if (!textToTranslate) return;
    
    // Mostrar estado
    const statusElement = document.createElement('div');
    statusElement.className = 'status-message';
    statusElement.textContent = 'Traduciendo...';
    document.getElementById('translator-content').appendChild(statusElement);
    
    // Llamar a la API de OpenAI para traducir
    fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini', // Usamos un modelo disponible
            messages: [
                {
                    role: 'user',
                    content: `Traduce la siguiente frase al inglés: "${textToTranslate}". Responde con el texto traducido, sin explicaciones adicionales.`
                }
            ]
        })
    })
    .then(response => {
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        return response.json();
    })
    .then(data => {
        // Mostrar la traducción
        statusElement.remove();
        const resultElement = document.createElement('div');
        resultElement.className = 'translation-result';
        resultElement.innerHTML = `
            <h4>Texto original:</h4>
            <p>${textToTranslate}</p>
            <h4>Traducción:</h4>
            <p>${data.choices[0].message.content}</p>
        `;
        document.getElementById('translator-content').appendChild(resultElement);
    })
    .catch(error => {
        statusElement.textContent = `Error: ${error.message}`;
        statusElement.style.color = 'red';
    });
}

// Hamburger Menu Functionality
const burger = document.querySelector('.burger');
const navLinks = document.querySelector('.nav-links');

burger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    burger.classList.toggle('active');
});

// Initial content load after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplay('codigo_dall_e/readme-image1.md', 'codigo_dall_e/index.js', 'dalle-readme', 'dalle-code');
    fetchAndDisplay('flux_context/readme-flux.md', 'flux_context/flux_context.js', 'flux-readme', 'flux-code');
    fetchAndDisplay('sst-gemini/readme-sst.md', 'sst-gemini/index.js', 'gemini-readme', 'gemini-code');
    fetchAndDisplay('traductor-amb-sdk-ai-vercel/readme.md', 'traductor-amb-sdk-ai-vercel/index.js', 'translator-readme', 'translator-code');
});