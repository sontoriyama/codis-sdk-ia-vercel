// Importamos las librerías necesarias
import { experimental_generateImage as generateImage } from 'ai';
import { openai } from '@ai-sdk/openai';
import { writeFile } from 'fs/promises';

async function main() {
  console.log('--- Inicio del script ---');
  console.log('Generando imagen estilo Akira Toriyama...');

  const image = await generateImage({
    model: openai.image('gpt-image-1'), // Otra opcion 'dall-e-3' pero no tiene contexto de otra imagen como el nuevo nativo de 4o. Aunque flux context es mejor en imagen con contexto de otra
    prompt: 'Un robot y un monstruo luchando en una ciudad en una epica batalla estilo Akira Toriyama',
    size: '1024x1024'
  });

  console.log('Imagen generada, guardando en disco...');
  await writeFile('dbz-image.png', image.uint8Array);

  console.log('✅ Imagen guardada como ghibli-image.png');
  console.log('--- Fin del script ---');
}

main().catch(console.error);