async function generateImage(apiKey, prompt, model) {
  const body = {
    model,
    prompt,
    n: 1,
    size: '1024x1024'
  };
  // Solo DALL·E necesita response_format
  if (model !== 'gpt-image-1') {
    body.response_format = 'url';
  }

  const resp = await fetch(
    'https://api.openai.com/v1/images/generations',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    }
  );

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

// Y en tu handler de botón:
try {
  const imageSrc = await generateImage(apiKey, prompt, modelSelect.value);
  generatedImage.src = imageSrc;
} catch (e) {
  showError(e.message);
}
