// Importa las funciones necesarias del Vercel AI SDK y el módulo 'util'
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { parseArgs } from 'util'; // Para parsear argumentos de línea de comandos en Bun/Node.js

async function main() {
    // Usa parseArgs para obtener argumentos de línea de comandos.  Compatible con Bun y Node.
    const { values } = parseArgs({
        args: Bun.argv, // Bun.argv contiene los argumentos en Bun, process.argv en Node
        options: {
            text: {
                type: 'string', // Define que el argumento 'text' es una cadena de texto
            },
            target: {
                type: 'string', // Idioma de destino
                default: 'inglés' // Por defecto traduce al inglés
            },
            source: {
                type: 'string', // Idioma de origen
                default: 'auto' // Por defecto detecta automáticamente
            }
        },
        allowPositionals: true // Permite argumentos posicionales (aunque no se usan en este ejemplo)
    });

    // Verifica si se proporcionó el argumento 'text'.  Si no, muestra un mensaje de error.
    if (!values.text) {
        console.error('Uso: bun run index.js --text "Tu frase aquí" [--target "idioma"] [--source "idioma"]');
        console.error('Ejemplo: bun run index.js --text "Hola mundo" --target "inglés"');
        process.exit(1); // Sale del script con un código de error
    }

    // Construye el prompt de traducción
    let prompt = `Traduce el siguiente texto `;
    
    if (values.source === 'auto') {
        prompt += `(detecta automáticamente el idioma) `;
    } else {
        prompt += `del ${values.source} `;
    }
    
    prompt += `al ${values.target}:\n\n"${values.text}"\n\n`;
    prompt += `Instrucciones:\n`;
    prompt += `- Proporciona solo la traducción, sin explicaciones adicionales\n`;
    prompt += `- Mantén el tono y estilo del texto original\n`;
    prompt += `- Si hay términos técnicos, mantenlos apropiadamente\n`;
    prompt += `- Preserva el formato si es necesario`;

    try {
        // Llama a la API de OpenAI para traducir el texto.  Usamos gpt-4o-mini.
        const { text } = await generateText({
            model: openai('gpt-4o-mini'), // Especifica el modelo de OpenAI
            prompt: prompt, // Usa el prompt construido
        });

        // Imprime la traducción en la consola.
        console.log(text); // Muestra la traducción
    } catch (error) {
        console.error('Error durante la traducción:', error.message);
        process.exit(1);
    }
}

// Ejecuta la función principal y maneja errores.
main().catch(console.error);