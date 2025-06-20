// Importamos las librerías necesarias
import { generateText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

// Primera llamada a la IA para ejecutar una herramienta
const { toolResults } = await generateText({
  model: openai('gpt-4.1'),
  prompt: 'Dime la información de la IP 104.28.223.105',
  tools: {
    ipInfo: tool({
      description: 'Get the info from an IP',
      parameters: z.object({
        ip: z.string().describe('The IP to get info from'),
      }),
      execute: async ({ ip }) => {
        // console.log({ ip })
        const response = await fetch(`https://ip.guide/${ip}`);
        const data = await response.json();
        // console.log({ data })
        return data;
      },
    }),
  },
});

// Si la herramienta se ejecutó y devolvió resultados...
if (toolResults) {
  // Segunda llamada a la IA para interpretar los resultados de la herramienta
  const { text } = await generateText({
    model: openai('gpt-4.1'),
    prompt: `Explica de forma natural la información de este objeto: ${JSON.stringify(
      toolResults
    )}. Directamente explica, no me digas nada más.`, // Se completa el prompt original
  });

  console.log(text);
}
