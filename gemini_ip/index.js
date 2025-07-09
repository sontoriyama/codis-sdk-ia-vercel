// Importamos las librerías necesarias

//refet dsp de borrarlo, per lo que putser no és tal com hauria de ser
//tinc l'original al zip

import { generateText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

// Primera llamada a la IA para ejecutar una herramienta
// La función 'generateText' es la clave para usar modelos de lenguaje y herramientas.
const { toolResults } = await generateText({
  model: openai('gpt-4.1'), // Especificamos el modelo de OpenAI a usar
  prompt: 'Analiza la información de la IP 104.28.223.105 incluyendo geolocalización, seguridad y reputación', // El prompt inicial que indica a la IA qué hacer
  tools: {
    ipInfo: tool({
      description: 'Get comprehensive information from an IP address including geolocation, security and reputation data', // Descripción de la herramienta para que la IA la entienda
      parameters: z.object({
        ip: z.string().describe('The IP address to analyze'), // Definimos el parámetro 'ip' que necesita la herramienta
      }),
      execute: async ({ ip }) => {
        // Función que se ejecuta cuando la IA decide usar la herramienta
        try {
          // Obtenemos información básica de la IP
          const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`);
          const data = await response.json();
          
          if (data.status === 'success') {
            return {
              ip: data.query,
              country: data.country,
              countryCode: data.countryCode,
              region: data.regionName,
              city: data.city,
              zip: data.zip,
              coordinates: {
                lat: data.lat,
                lon: data.lon
              },
              timezone: data.timezone,
              isp: data.isp,
              organization: data.org,
              as: data.as
            };
          } else {
            throw new Error(data.message || 'Error al obtener información de IP');
          }
        } catch (error) {
          console.error('Error obteniendo información de IP:', error);
          return {
            error: 'No se pudo obtener información de la IP',
            ip: ip
          };
        }
      },
    }),
  },
});

// Si la herramienta se ejecutó y devolvió resultados...
if (toolResults) {
  // Segunda llamada a la IA para interpretar los resultados de la herramienta
  const { text } = await generateText({
    model: openai('gpt-4.1'), // Usamos el mismo modelo
    prompt: `Analiza de forma detallada la información de esta IP: ${JSON.stringify(
      toolResults
    )}. Proporciona un análisis completo que incluya:
    
    1. Información geográfica y de ubicación
    2. Análisis de seguridad y posibles riesgos
    3. Información de red e ISP
    4. Evaluación de reputación
    5. Recomendaciones de seguridad si es necesario
    
    Presenta la información de manera clara y profesional.`, // Le damos un prompt para que interprete los resultados
  });

  console.log(text); // Mostramos la explicación generada
}