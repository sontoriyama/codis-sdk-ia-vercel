// Importamos las librerías necesarias
import { generateText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

// Primera llamada a la IA para ejecutar una herramienta
// La función 'generateText' es la clave para usar modelos de lenguaje y herramientas.
const { toolResults } = await generateText({
  model: openai('gpt-4.1'), // Especificamos el modelo de OpenAI a usar
  prompt: 'Dime la información de la IP 104.28.223.105', // El prompt inicial que indica a la IA qué hacer
  tools: {
    ipInfo: tool({
      description: 'Get the info from an IP', // Descripción de la herramienta para que la IA la entienda
      parameters: z.object({
        ip: z.string().describe('The IP to get info from'), // Definimos el parámetro 'ip' que necesita la herramienta
      }),
      execute: async ({ ip }) => {
        // Función que se ejecuta cuando la IA decide usar la herramienta
        // console.log({ ip })
        const response = await fetch(`https://ip.guide/${ip}`); // Hacemos la petición a la API externa
        const data = await response.json(); // Obtenemos los datos en formato JSON
        // console.log({ data })
        return data; // Devolvemos los datos
      },
    }),
  },
});

// Si la herramienta se ejecutó y devolvió resultados...
if (toolResults) {
  // Segunda llamada a la IA para interpretar los resultados de la herramienta
  const { text } = await generateText({
    model: openai('gpt-4.1'), // Usamos el mismo modelo
    prompt: `Explica de forma natural la información de este objeto: ${JSON.stringify(
      toolResults
    )}. Directamente explica, no me digas nada más.`, // Le damos un prompt para que interprete los resultados
  });

  console.log(text); // Mostramos la explicación generada
}
