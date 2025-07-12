document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const promptInput = document.getElementById('prompt');
  const modelSelect = document.getElementById('model');
  const contextInput = document.getElementById('contextImage');
  const contextPreview = document.getElementById('contextImagePreview');
  const removeBtn = document.getElementById('removeContextBtn');
  const generateBtn = document.getElementById('generateBtn');
  const btnText = document.querySelector('.btn-text');
  const loading = document.querySelector('.loading');
  const errorDiv = document.getElementById('error');
  const errorMsg = document.getElementById('errorMessage');
  const resultDiv = document.getElementById('result');
  const genImage = document.getElementById('generatedImage');
  const downloadBtn = document.getElementById('downloadBtn');
  const contextSection = document.getElementById('contextSection');

  // Preview y limpieza del contexto
  contextInput.addEventListener('change', e => {
    const f = e.target.files[0];
    if (f && f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = e => {
        contextPreview.src = e.target.result;
        contextPreview.style.display = 'block';
        removeBtn.style.display = 'inline';
      };
      reader.readAsDataURL(f);
    }
  });
  removeBtn.addEventListener('click', () => {
    contextPreview.src = '';
    contextPreview.style.display = 'none';
    removeBtn.style.display = 'none';
    contextInput.value = '';
  });

  // Adaptar el botón y sección contexto según modelo
  modelSelect.addEventListener('change', () => {
    if (modelSelect.value === 'dall-e-3') {
      contextSection.style.display = 'none';
      removeBtn.click();
    } else {
      contextSection.style.display = 'block';
    }
  });

  // Generación y edición
  generateBtn.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();
    const prompt = promptInput.value.trim();
    const model = modelSelect.value;
    const ctx = contextPreview.src.startsWith('data:') ? contextPreview.src : null;

    if (!apiKey || !apiKey.startsWith('sk-')) return showError('API Key inválida');
    if (!prompt || prompt.length < 10) return showError('Prompt demasiado corto (mín. 10 caracteres)');
    if (ctx && model === 'dall-e-3') return showError('DALL·E 3 no permite edición');

    hideError();
    setLoading(true);

    try {
      let resp;
      if (ctx) {
        resp = await editWithContext(apiKey, prompt, ctx, model);
      } else {
        resp = await generateNew(apiKey, prompt, model);
      }
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error?.message || resp.statusText);

      const url = data.data?.[0]?.url;
      if (!url) throw new Error('No hay URL en la respuesta.');
      genImage.src = url;
      resultDiv.style.display = 'block';
    } catch (e) {
      showError(e.message);
    } finally {
      setLoading(false);
    }
  });

  downloadBtn.addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = genImage.src;
    a.download = `ai-img-${Date.now()}.png`;
    a.click();
  });

  function setLoading(on) {
    generateBtn.disabled = on;
    btnText.style.display = on ? 'none' : 'inline';
    loading.style.display = on ? 'inline' : 'none';
  }
  function showError(msg) { errorMsg.textContent = msg; errorDiv.style.display = 'block'; resultDiv.style.display = 'none'; }
  function hideError() { errorDiv.style.display = 'none'; }

  async function generateNew(key, prompt, model) {
    return fetch('https://api.openai.com/v1/images/generations', {
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':`Bearer ${key}`},
      body: JSON.stringify({model,prompt,n:1,size:"1024x1024",quality:"high",response_format:"url"})
    });
  }

  async function editWithContext(key,prompt,ctx,model) {
    if (model === 'gpt-image-1' || model === 'dall-e-2') {
      const blob = await fetch(ctx).then(r=>r.blob());
      const fd = new FormData();
      fd.append('model', model);
      fd.append('image', blob, 'ctx.png');
      fd.append('prompt', prompt);
      fd.append('n','1');
      fd.append('size','1024x1024');
      return fetch('https://api.openai.com/v1/images/edits', {
        method:'POST',
        headers:{'Authorization':`Bearer ${key}`},
        body: fd
      });
    }
    throw new Error('Edición no soportada con ' + model);
  }
});
