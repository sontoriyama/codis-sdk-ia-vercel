# Código para editar imágenes con Flux.Context

Este script de Node.js usa la API de Black Forest Labs para editar una imagen existente usando el modelo Flux.Context.

## Requisitos

*   Node.js y npm (o yarn)
*   Una API Key de Black Forest Labs (regístrate en su sitio web y obtén una)
*   Una imagen original (ej: `mi-imagen-original.png` en el mismo directorio)

## Cómo usar

1.  **Instala las dependencias:**
    `npm install node-fetch form-data`
2.  **Configura tu API Key:**
    Establece la variable de entorno `BFL_API_KEY` con tu clave de API.  Puedes hacerlo directamente en tu terminal antes de ejecutar el script (ej: `export BFL_API_KEY=TU_CLAVE_AQUI`) o en un archivo `.env` (necesitarás un paquete como `dotenv` para cargarlo).
3.  **Prepara tu imagen original:**  Asegúrate de tener una imagen llamada `mi-imagen-original.png` (o cambia la constante `RUTA_IMAGEN_ORIGINAL` en el código) en el mismo directorio del script.
4.  **Ejecuta el script:**  `node flux_context.js`

## Explicación del Código

### Imports

*   `import fetch from 'node-fetch';`:  Usamos `node-fetch` para hacer peticiones HTTP a la API de Black Forest Labs.  Alternativamente, puedes usar el `fetch` nativo de Node.js v18+.
*   `import { promises as fs } from 'fs';`:  Importamos el módulo `fs` (File System) para leer y escribir archivos.
*   `import FormData from 'form-data';`:  Usamos `form-data` para construir el formulario que enviaremos a la API (necesario para enviar la imagen).

### Configuración

*   `const BFL_API_KEY = process.env.BFL_API_KEY || 'TU_API_KEY_DE_BLACK_FOREST_LABS';`:  Lee tu clave de API de la variable de entorno `BFL_API_KEY`.  Si no está definida, usa un valor por defecto (que deberías cambiar).
*   `const MODELO_A_USAR = 'flux-1-schnell';`:  Define el modelo de Flux.Context que usaremos.  Puedes cambiarlo a `'flux-1-pro'` para obtener mejor calidad (pero será más caro).
*   `const RUTA_IMAGEN_ORIGINAL = './mi-imagen-original.png';`:  La ruta a tu imagen original.
*   `const RUTA_IMAGEN_SALIDA = './imagen-modificada.png';`:  La ruta donde se guardará la imagen modificada.

### Función Principal async function main()

1.  **Carga la imagen original:**  Lee la imagen original del disco.
2.  **Crea el formulario:**  Crea un formulario `FormData` y añade el prompt (la descripción de la modificación que quieres hacer) y la imagen original.
3.  **Envía la petición a la API:**  Hace una petición `POST` a la API de Black Forest Labs, incluyendo tu API key en el header.
4.  **Procesa la respuesta:**  Si la petición es exitosa, guarda la imagen modificada en el disco.  Si hay un error, muestra el mensaje de error.

## Notas Adicionales

*   **API Key:**  Asegúrate de reemplazar `TU_API_KEY_DE_BLACK_FOREST_LABS` con tu clave real.
*   **Prompt:**  Experimenta con diferentes prompts para obtener los resultados deseados.
*   **Modelos:**  Considera el costo de cada modelo al elegir (`flux-1-schnell` es más barato pero puede ser menos preciso).
*   **Enmascaramiento (Opcional):**  Puedes añadir una máscara para modificar solo ciertas partes de la imagen.  Esto requiere crear y subir un archivo de máscara.