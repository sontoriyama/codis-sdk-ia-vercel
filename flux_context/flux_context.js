// Importamos las librerías necesarias
import fetch from 'node-fetch'; // O usa el fetch nativo de Node.js v18+
import { promises as fs } from 'fs';
import FormData from 'form-data';

// --- Configuración ---
const BFL_API_KEY = process.env.BFL_API_KEY || 'TU_API_KEY_DE_BLACK_FOREST_LABS';
const MODELO_A_USAR = 'flux-1-schnell'; // Puedes cambiarlo a 'flux-1-pro' para máxima calidad
const RUTA_IMAGEN_ORIGINAL = './mi-imagen-original.png';
const RUTA_IMAGEN_SALIDA = './imagen-modificada.png';

async function main() {
  if (BFL_API_KEY === 'TU_API_KEY_DE_BLACK_FOREST_LABS') {
    console.error('Error: Por favor, establece tu API Key de Black Forest Labs.');
    return;
  }

  console.log(`Cargando la imagen original: ${RUTA_IMAGEN_ORIGINAL}`);
  const imageBuffer = await fs.readFile(RUTA_IMAGEN_ORIGINAL);

  // Creamos un formulario de datos para enviar la imagen y el prompt
  const form = new FormData();
  form.append('prompt', 'A small, fluffy cat sleeping on the sofa, cartoon style');
  form.append('image', imageBuffer, { filename: 'mi-imagen-original.png' });
  // Opcional: puedes añadir una máscara si quieres editar solo una parte
  // form.append('mask', maskBuffer, { filename: 'mask.png' });

  console.log(`Enviando petición al modelo ${MODELO_A_USAR}...`);

  try {
    const response = await fetch(`https://api.blackforestlabs.ai/v1/images/edits/context`, {
      method: 'POST',
      headers: {
        ...form.getHeaders(), // Headers para el formulario
        'Authorization': `Bearer ${BFL_API_KEY}`,
      },
      body: form,
    });

    if (!response.ok) {
      // Si hay un error, muestra el texto del error que devuelve la API
      const errorData = await response.text();
      throw new Error(`Error de la API (${response.status}): ${errorData}`);
    }

    // La respuesta de la API es la imagen binaria directamente
    const arrayBuffer = await response.arrayBuffer();
    const bufferFinal = Buffer.from(arrayBuffer);

    console.log(`Imagen recibida. Guardando en ${RUTA_IMAGEN_SALIDA}...`);
    await fs.writeFile(RUTA_IMAGEN_SALIDA, bufferFinal);

    console.log('✅ ¡Imagen modificada y guardada con éxito!');

  } catch (error) {
    console.error('Ha ocurrido un error:', error);
  }
}

main();