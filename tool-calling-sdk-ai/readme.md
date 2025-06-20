# Proyecto: Análisis de IP con Tool Calling y Vercel AI SDK

Este proyecto demuestra el uso de la Vercel AI SDK en combinación con OpenAI para realizar análisis de direcciones IP utilizando la técnica de *tool calling* (también conocida como *function calling*).

## Descripción

El objetivo es obtener información sobre una dirección IP específica y presentarla de manera clara y concisa.  El proceso se divide en dos etapas principales:

1.  **Obtención de la Información:**  Se utiliza una "herramienta" para consultar una API externa (en este caso, `ip.guide`) y recuperar los datos asociados a la IP.
2.  **Interpretación y Presentación:**  Se emplea un modelo de lenguaje de OpenAI (GPT-4.1) para analizar los resultados obtenidos por la herramienta y generar una explicación en lenguaje natural.

Este enfoque permite integrar datos de fuentes externas y aprovechar las capacidades de razonamiento de los modelos de lenguaje.

## Tecnologías Utilizadas

*   [Vercel AI SDK](https://sdk.vercel.ai/):  Facilita la interacción con modelos de lenguaje y la definición de herramientas.
*   [OpenAI](https://openai.com/):  Modelo de lenguaje (GPT-4.1) para la interpretación de resultados.
*   [TypeScript](https://www.typescriptlang.org/):  Lenguaje de programación utilizado para el desarrollo del script.
*   `node-fetch`: Para realizar peticiones HTTP.
*   `zod`: Para la validación de datos.

## Estructura del Proyecto

El proyecto consta de un único archivo principal: `index.ts` (ubicado en la carpeta `tool-calling-sdk-ai/`).  Este archivo contiene la lógica para:

*   Definir la herramienta `ipInfo` que consulta la API de `ip.guide`.
*   Llamar a los modelos de lenguaje de OpenAI utilizando la Vercel AI SDK.
*   Presentar la información de la IP de forma legible.

## Cómo Ejecutar

1.  **Instalación:**
    *   Asegúrate de tener [Node.js](https://nodejs.org/) y [npm](https://www.npmjs.com/) (o [yarn](https://yarnpkg.com/)) instalados.
    *   Clona o descarga el repositorio del proyecto.
    *   Navega al directorio del proyecto en tu terminal.
    *   Ejecuta `npm install` (o `yarn install`) para instalar las dependencias.
2.  **Configuración:**
    *   Obtén una API Key de OpenAI.  Puedes obtener una clave en el sitio web de OpenAI.
    *   Define la variable de entorno `OPENAI_API_KEY` con tu clave.  Esto se puede hacer de varias maneras:
        *   Directamente en tu terminal antes de ejecutar el script (ej: `export OPENAI_API_KEY=TU_CLAVE_AQUI`).
        *   En un archivo `.env` en la raíz del proyecto (necesitarás instalar un paquete como `dotenv` para cargarlo).
3.  **Ejecución:**
    *   Ejecuta el script con el comando `npx ts-node tool-calling-sdk-ai/index.ts`
    *   El script mostrará la información de la IP en la consola.

## Posibles Mejoras

*   **Manejo de Errores:** Implementar un manejo de errores más robusto, incluyendo la gestión de errores de red y errores de la API de `ip.guide`.
*   **Configuración Dinámica de la IP:** Permitir que la IP a analizar se pase como un argumento al script, en lugar de estar codificada.
*   **Mejor Presentación:**  Formatear la salida en la consola de una manera más visualmente atractiva, utilizando tablas o listas.
*   **Validación de la IP:** Validar la dirección IP ingresada para asegurar que sea una dirección IP válida.

## Conclusión

Este proyecto es un ejemplo práctico de cómo combinar la Vercel AI SDK con los modelos de lenguaje de OpenAI para construir aplicaciones inteligentes que interactúan con fuentes de datos externas y presentan la información de manera efectiva. El uso de *tool calling* abre un amplio abanico de posibilidades para el desarrollo de aplicaciones de IA más complejas y versátiles.
