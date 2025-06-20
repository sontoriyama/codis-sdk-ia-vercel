# Análisis de IP con Gemini y Vercel AI SDK

Este proyecto demuestra el uso de la Vercel AI SDK en combinación con OpenAI (GPT-4.1) para realizar análisis de direcciones IP utilizando la técnica de *tool calling* (también conocida como *function calling*).

## Descripción

El objetivo principal de este proyecto es obtener información detallada sobre una dirección IP específica y presentarla de manera clara y concisa. Para lograr esto, se sigue un proceso de dos etapas:

1.  **Obtención de Datos:** Se utiliza una "herramienta" integrada para consultar una API externa (en este caso, `ip.guide`) y recuperar los datos asociados a la IP proporcionada.
2.  **Interpretación y Presentación:** Empleando un modelo de lenguaje avanzado (GPT-4.1 de OpenAI), se analizan los resultados obtenidos por la herramienta y se genera una explicación en lenguaje natural que resume la información.

Este enfoque combina la capacidad de las herramientas para acceder a datos externos con la inteligencia de los modelos de lenguaje para ofrecer un análisis efectivo y comprensible.

## Tecnologías Utilizadas

*   [Vercel AI SDK](https://sdk.vercel.ai/): Permite la integración con modelos de lenguaje y la definición de herramientas personalizadas.
*   [OpenAI](https://openai.com/): El modelo de lenguaje GPT-4.1, para la interpretación y generación de texto.
*   [TypeScript](https://www.typescriptlang.org/): Lenguaje de programación utilizado para el desarrollo del script, que ofrece tipado estático y mejor organización del código.
*   `node-fetch`: Para realizar peticiones HTTP y obtener información de la API externa.
*   `zod`: Librería para la validación de datos, asegurando la integridad y la correcta estructura de la información manejada.

## Estructura del Proyecto

El proyecto está estructurado con un único archivo principal: `index.js` (ubicado en la carpeta `sst-gemini/`). Este archivo contiene la lógica para:

*   Definir y configurar la herramienta `ipInfo`, la cual se encarga de consultar la API de `ip.guide` y recuperar la información asociada a una IP.
*   Utilizar los modelos de lenguaje de OpenAI a través de la Vercel AI SDK para la interpretación de los datos obtenidos.
*   Presentar la información de la IP en un formato claro y entendible, facilitando su análisis.

## Cómo Ejecutar

1.  **Instalación:**
    *   Asegúrate de tener instalados [Node.js](https://nodejs.org/) y [npm](https://www.npmjs.com/) (o [yarn](https://yarnpkg.com/)).
    *   Clona o descarga el repositorio del proyecto.
    *   Navega al directorio del proyecto en tu terminal.
    *   Ejecuta el comando `npm install` (o `yarn install`) para instalar todas las dependencias necesarias.
2.  **Configuración:**
    *   Obtén una API Key de OpenAI. Puedes obtener una clave en el sitio web de OpenAI. (Si necesitas una clave, puedes obtenerla en el sitio web de OpenAI).
    *   Define la variable de entorno `OPENAI_API_KEY` con tu clave. Puedes hacerlo de varias maneras:
        *   Directamente en tu terminal antes de ejecutar el script (ej: `export OPENAI_API_KEY=TU_CLAVE_AQUI`).
        *   En un archivo `.env` en la raíz del proyecto (necesitarás instalar un paquete como `dotenv` para cargarlo).
3.  **Ejecución:**
    *   Ejecuta el script con el comando `npx ts-node sst-gemini/index.js`. 
    *   El script mostrará la información de la IP en la consola.

## Consideraciones Adicionales

*   **Manejo de Errores:** Implementar un manejo de errores robusto para las llamadas a la API externa, incluyendo la gestión de errores de red y errores específicos de la API. Esto mejorará la fiabilidad del script.
*   **Flexibilidad de la IP:**  Modificar el script para que la dirección IP a analizar se pueda especificar como un argumento de línea de comandos. Esto aumentará la versatilidad del script.
*   **Formato de Salida Mejorado:** Considerar la posibilidad de formatear la salida en la consola utilizando tablas o listas para presentar la información de manera más clara y organizada.
*   **Validación de la IP:** Implementar validación de la dirección IP para asegurar que la entrada sea una dirección IP válida, previniendo errores y aumentando la robustez del script.

## Conclusión

Este proyecto ejemplifica cómo la combinación de la Vercel AI SDK con los modelos de lenguaje de OpenAI puede ser utilizada para construir aplicaciones inteligentes. Estas aplicaciones no solo interactúan con fuentes de datos externas, sino que también presentan la información de manera efectiva y comprensible. El uso de la técnica de *tool calling* abre nuevas posibilidades para el desarrollo de aplicaciones de IA más complejas y versátiles, proporcionando una herramienta valiosa para el análisis y la presentación de información.
