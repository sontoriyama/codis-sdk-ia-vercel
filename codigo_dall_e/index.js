// Importamos las librerías necesarias
import { experimental_generateImage as generateImage } from 'ai';
import { openai } from '@ai-sdk/openai';
import { writeFile } from 'fs/promises';

async function main() {
  console.log('--- Inicio del script ---');
  console.log('Generando imagen estilo Ghibli...');

  const image = await generateImage({
    model: openai.image('dall-e-3'), // Nota: El modelo en el video era 'gpt-image-1', pero 'dall-e-3' es un modelo más común de OpenAI. El funcionamiento es el mismo.
    prompt: 'A cat flying over a city, in the style of Studio Ghibli animation',
    size: '1024x1024'
  });

  console.log('Imagen generada, guardando en disco...');
  await writeFile('ghibli-image.png', image.uint8Array);

  console.log('✅ Imagen guardada como ghibli-image.png');
  console.log('--- Fin del script ---');
}

main().catch(console.error);