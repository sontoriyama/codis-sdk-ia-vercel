document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const promptInput = document.getElementById('prompt');
  const modelSelect = document.getElementById('model');
  const contextInput = document.getElementById('contextImage');
  const contextPreview = document.getElementById('contextImagePreview');
  const removeBtn = document.getElementById('removeContextBtn');
  const generateBtn = document.getElementById('generateBtn');
  const btnText = generateBtn.querySelector('.btn-text');
  const loading = generateBtn.querySelector('.loading');
  const errorBox = document.getElementById('error');
  const errorMessage = document.getElementById('errorMessage');
  const resultBox = document.getElementById('result');
  const resultImage = document.getElementById('generatedImage');
  const downloadBtn = document.getElementById('downloadBtn');

  // Mostrar la imagen seleccionada como contexto
  contextInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = evt => {
        contextPreview.src = evt.target.result;
        contextPreview.style.display = 'block';
        removeBtn.style.display = 'inline-block';
      };
      reader.readAsDataURL(file);
    }
  });

  removeBtn.addEventListener('click', () => {
    contextPreview.src = '';
    contextPreview.style.display = 'none';
    removeBtn.style.display = 'none';
    contextInput.value = '';
  });

  generateBtn.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();
    const prompt = promptInput.value.trim();
    const model = modelSelect.value;
    const hasContext = contextPreview.src.startsWith('data:');

    if (!apiKey || !apiKey.startsWith('sk-')) return showError('🔐 API Key inválida.');
    if (prompt.length < 10) return showError('📝 El prompt debe tener al menos 10 caracteres.');
    if (hasContext && model === 'dall-e-3') return showError('🚫 DALL·E 3 no permite edición con contexto.');

    setLoading(true);
    hideError();
    resultBox.style.display = 'none';

    try {
      const imageSrc = hasContext
        ? await editImage(apiKey, prompt, contextPreview.src, model)
        : await generateImage(apiKey, prompt, model);

      resultImage.src = imageSrc;
      resultBox.style.display = 'block';
    } catch (err) {
      showError(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  });

  downloadBtn.addEventListener('click', () => {
    if (!resultImage.src) return;
    const link = document.createElement('a');
    link.href = resultImage.src;
    link.download = 'imagen-ai.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  function setLoading(isLoading) {
    generateBtn.disabled = isLoading;
    btnText.style.display = isLoading ? 'none' : 'inline';
    loading.style.display = isLoading ? 'inline' : 'none';
  }

  function showError(msg) {
    errorMessage.textContent = msg;
    errorBox.style.display = 'block';
    resultBox.style.display = 'none';
  }

  function hideError() {
    errorBox.style.display = 'none';
  }

  async function generateImage(apiKey, prompt, model) {
    const body = {
      model,
      prompt,
      n: 1,
      size: '1024x1024'
    };
    if (model !== 'gpt-image-1') {
      body.response_format = 'url';
    }

    const resp = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error?.message || 'Error generando imagen');

    if (model === 'gpt-image-1') {
      const b64 = data.data[0].b64_json;
      if (!b64) throw new Error('No se recibió b64_json de GPT-Image-1');
      return `data:image/png;base64,${b64}`;
    } else {
      const url = data.data[0].url;
      if (!url) throw new Error('No se recibió URL de DALL·E');
      return url;
    }
  }

  async function editImage(apiKey, prompt, base64, model) {
    const blob = await fetch(base64).then(res => res.blob());
    const form = new FormData();
    form.append('model', model);
    form.append('image', blob, 'context.png');
    form.append('prompt', prompt);
    form.append('n', '1');
    form.append('size', '1024x1024');
    // response_format solo para DALL·E
    if (model !== 'gpt-image-1') form.append('response_format', 'url');

    const resp = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`
      },
      body: form
    });

    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error?.message || 'Error en edición');

    if (model === 'gpt-image-1') {
      const b64 = data.data[0].b64_json;
      if (!b64) throw new Error('No se recibió imagen base64 de GPT-Image-1');
      return `data:image/png;base64,${b64}`;
    } else {
      return data.data[0].url;
    }
  }
});
