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
        },
        allowPositionals: true // Permite argumentos posicionales (aunque no se usan en este ejemplo)
    });

    // Verifica si se proporcionó el argumento 'text'.  Si no, muestra un mensaje de error.
    if (!values.text) {
        console.error('Uso: bun run index.ts --text "Tu frase aquí"');
        process.exit(1); // Sale del script con un código de error
    }

    // Llama a la API de OpenAI para traducir el texto.  Usamos gpt-4o-mini.
    const { text } = await generateText({
        model: openai('gpt-4o-mini'), // Especifica el modelo de OpenAI
        prompt: `Traduce la siguiente frase al inglés: "${values.text}". Responde con el texto traducido, sin explicaciones adicionales.`, // Crea el prompt con el texto a traducir
    });

    // Imprime la traducción en la consola.
    console.log(text); // Muestra la traducción
}

// Ejecuta la función principal y maneja errores.
main().catch(console.error);