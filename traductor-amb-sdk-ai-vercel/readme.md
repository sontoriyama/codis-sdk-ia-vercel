# Traductor de Textos con Vercel AI SDK y OpenAI

Este proyecto es un sencillo traductor de textos que utiliza el Vercel AI SDK junto con el modelo de lenguaje gpt-4o-mini de OpenAI para traducir frases del español al inglés.

## Descripción

El script toma una frase como entrada a través de la línea de comandos y utiliza el modelo de IA para generar su traducción al inglés. El objetivo principal es demostrar la integración del Vercel AI SDK con los modelos de OpenAI para tareas de traducción.

## Tecnologías Utilizadas

*   [Vercel AI SDK](https://sdk.vercel.ai/):  La herramienta principal para interactuar con los modelos de IA.
*   [OpenAI](https://openai.com/):  El modelo de lenguaje gpt-4o-mini para la traducción del texto.
*   [TypeScript](https://www.typescriptlang.org/):  Lenguaje de programación utilizado para el desarrollo del script.
*   `util`: Módulo de Node.js que proporciona la función `parseArgs` para analizar los argumentos de línea de comandos.
*   `Bun.argv` o `process.argv`: Array que contiene los argumentos de línea de comandos.

## Requisitos

Antes de ejecutar el script, asegúrate de tener lo siguiente:

1.  **Node.js y npm/pnpm/yarn:** Debes tener instalado Node.js y un gestor de paquetes como npm, pnpm o yarn.
2.  **Clave de API de OpenAI:** Necesitas una clave de API válida de OpenAI.
3.  **Entorno de Ejecución:** El script está diseñado para ser ejecutado en entornos como Bun o Node.js.

## Instalación

1.  **Crear un proyecto y navegar al directorio del proyecto en tu terminal.**
2.  **Instala las dependencias:** Utiliza el gestor de paquetes que prefieras para instalar las dependencias necesarias.
    *   Con npm:
        ```bash
        npm install ai @ai-sdk/openai
        ```
    *   Con pnpm:
        ```bash
        pnpm add ai @ai-sdk/openai
        ```
    *   Con yarn:
        ```bash
        yarn add ai @ai-sdk/openai
        ```
3.  **Configurar la Clave de API:**
    *   Establece la variable de entorno `OPENAI_API_KEY` con tu clave de API de OpenAI. Puedes hacer esto de varias maneras:
        *   En tu terminal antes de ejecutar el script (recomendado para pruebas):
            *   En Linux/macOS:
                ```bash
                export OPENAI_API_KEY="tu_clave_api_de_openai"
                ```
            *   En Windows (CMD):
                ```bash
                set OPENAI_API_KEY="tu_clave_api_de_openai"
                ```
            *   En Windows (PowerShell):
                ```bash
                $env:OPENAI_API_KEY="tu_clave_api_de_openai"
                ```
        *   Usando un archivo `.env` en la raíz de tu proyecto (para un manejo más organizado).
            *   Crea un archivo llamado `.env` en la raíz del proyecto.
            *   Añade la siguiente línea, reemplazando `tu_clave_api_de_openai` con tu clave real:
                ```
                OPENAI_API_KEY="tu_clave_api_de_openai"
                ```
            *   Asegúrate de que tu entorno (Bun o Node.js con una librería como `dotenv`) cargue las variables desde el archivo `.env`.

## Uso

1.  Guarda el código proporcionado en un archivo llamado `index.ts` en la carpeta `traductor-amb-sdk-ai-vercel/`.
2.  Ejecuta el script desde la terminal usando uno de los siguientes comandos, reemplazando "Tu frase aquí" con la frase que deseas traducir:
    *   Con Bun:
        ```bash
        bun run index.ts --text "Tu frase aquí"
        ```
    *   Con ts-node (si usas Node.js y tienes ts-node instalado):
        ```bash
        ts-node index.ts --text "Tu frase aquí"
        ```

El script imprimirá la traducción en la consola.

## Detalles del Código

*   **Importaciones:**  Se importan las funciones `generateText` del Vercel AI SDK, el proveedor `openai` de OpenAI y la función `parseArgs` del módulo `util` para manejar los argumentos de la línea de comandos.
*   **Análisis de Argumentos:** Se utiliza `parseArgs` para extraer el texto a traducir de los argumentos de la línea de comandos.  Se espera que el texto se proporcione con la opción `--text`.
*   **Validación de la Entrada:** Se verifica si se proporcionó el argumento `--text`.  Si no, se muestra un mensaje de uso y el script se cierra.
*   **Llamada a la API de OpenAI:** Se utiliza `generateText` del Vercel AI SDK, especificando el modelo `gpt-4o-mini` y el prompt que contiene la frase a traducir.
*   **Presentación del Resultado:** La traducción generada por el modelo se imprime en la consola.

## Posibles Mejoras

*   **Soporte para otros idiomas:**  Permitir especificar el idioma de destino como un argumento de línea de comandos.
*   **Mejor Manejo de Errores:** Implementar un manejo de errores más completo, como la gestión de errores de red y errores de la API de OpenAI.
*   **Interfaz más amigable:** Desarrollar una interfaz de usuario más interactiva (por ejemplo, usando una interfaz web o una aplicación de consola más avanzada).
*   **Almacenamiento en caché:** Implementar una función de almacenamiento en caché para evitar llamadas repetidas a la API de OpenAI con las mismas frases.

## Conclusión

Este proyecto es un ejemplo básico pero funcional de cómo utilizar el Vercel AI SDK y OpenAI para crear una herramienta de traducción de textos.  Sirve como un punto de partida para explorar las capacidades del SDK y la integración con modelos de lenguaje de manera sencilla y efectiva.