# Análisis de IP con Gemini AI

## Descripción

Este proyecto utiliza la Vercel AI SDK junto con OpenAI para realizar análisis completos de direcciones IP. El sistema emplea la técnica de *tool calling* para obtener información en tiempo real de las direcciones IP y luego utiliza inteligencia artificial para proporcionar análisis detallados sobre geolocalización, seguridad, red y reputación.

## Características

- **Análisis completo de IP**: Obtiene información detallada incluyendo ubicación geográfica, ISP, organización y más
- **Tool Calling**: Utiliza herramientas externas para obtener datos actualizados en tiempo real
- **Análisis de IA**: Interpreta los datos obtenidos y proporciona insights de seguridad
- **Interfaz web moderna**: UI intuitiva con validación en tiempo real
- **Múltiples opciones de análisis**: Geolocalización, seguridad, red y reputación
- **Exportación de resultados**: Guarda los análisis en formato JSON

## Tecnologías Utilizadas

- [Vercel AI SDK](https://sdk.vercel.ai/): Framework principal para interactuar con modelos de IA
- [OpenAI GPT-4](https://openai.com/): Modelo de lenguaje para análisis e interpretación
- [ip-api.com](http://ip-api.com/): API para obtener información básica de IP
- HTML5, CSS3, JavaScript: Tecnologías web para la interfaz de usuario

## Estructura del Proyecto

```
gemini_ip/
├── index.js          # Script principal con tool calling
├── ui.html           # Interfaz web
├── ui.css            # Estilos de la interfaz
├── ui.js             # Lógica de la interfaz
└── readme.md         # Este archivo
```

## Instalación y Configuración

### Prerrequisitos

- Node.js (versión 18 o superior)
- API Key de OpenAI
- Navegador web moderno (para la UI)

### Instalación

1. **Instalar dependencias:**
   ```bash
   npm install ai @ai-sdk/openai zod
   ```

2. **Configurar variables de entorno:**
   ```bash
   export OPENAI_API_KEY="tu-api-key-aqui"
   ```

## Uso

### Script de línea de comandos

```bash
# Ejecutar análisis desde terminal
node index.js
```

### Interfaz web

1. Abrir `ui.html` en un navegador web
2. Introducir tu API Key de OpenAI
3. Ingresar la dirección IP a analizar
4. Seleccionar las opciones de análisis deseadas
5. Hacer clic en "Analizar IP"

## Funcionalidades de la UI

### Configuración
- **API Key**: Almacenamiento seguro en localStorage
- **Detección automática**: Botón para detectar tu IP actual
- **Validación en tiempo real**: Verificación de formato de IP

### Opciones de Análisis
- **Geolocalización**: Ubicación geográfica y coordenadas
- **Seguridad**: Evaluación de riesgos y amenazas
- **Red**: Información de ISP y infraestructura
- **Reputación**: Análisis de confiabilidad y historial

### Resultados
- **Información básica**: Datos técnicos de la IP
- **Análisis de IA**: Interpretación inteligente de los datos
- **Exportación**: Descarga de resultados en JSON
- **Nuevo análisis**: Reinicio rápido para otra IP

## Ejemplo de Uso

```javascript
// El script utiliza tool calling para obtener información
const { toolResults } = await generateText({
  model: openai('gpt-4.1'),
  prompt: 'Analiza la información de la IP 104.28.223.105',
  tools: {
    ipInfo: tool({
      description: 'Get comprehensive information from an IP address',
      parameters: z.object({
        ip: z.string().describe('The IP address to analyze'),
      }),
      execute: async ({ ip }) => {
        // Obtiene información de la API
        const response = await fetch(`http://ip-api.com/json/${ip}`);
        return await response.json();
      },
    }),
  },
});
```

## Consideraciones de Seguridad

- **API Keys**: Nunca hardcodees las API keys en el código
- **Validación**: Siempre valida las direcciones IP antes del análisis
- **Rate Limiting**: Respeta los límites de las APIs externas
- **Datos sensibles**: No registres información personal en logs

## Limitaciones

- Requiere conexión a internet para APIs externas
- Limitado por los rate limits de OpenAI y APIs de IP
- Algunas IPs privadas o especiales pueden no tener información completa

## Contribución

Para contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature
3. Realiza tus cambios
4. Envía un pull request

## Licencia

Este proyecto está bajo la licencia MIT.

## Soporte

Para reportar bugs o solicitar features, por favor crea un issue en el repositorio del proyecto. Gracias midudev!