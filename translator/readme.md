# Traductor de Textos con IA

## Descripción

Este proyecto implementa un traductor de textos inteligente utilizando la Vercel AI SDK y OpenAI. Ofrece traducción entre múltiples idiomas con opciones avanzadas como detección automática de idioma, tono formal, traducción contextual y preservación de formato.

## Características

- **Traducción multiidioma**: Soporte para más de 10 idiomas principales
- **Detección automática**: Identifica automáticamente el idioma de origen
- **Opciones avanzadas**: Tono formal, traducción contextual, preservación de formato
- **Interfaz moderna**: UI intuitiva con áreas de texto duales
- **Funciones de productividad**: Copiar, pegar, limpiar, intercambiar idiomas
- **Síntesis de voz**: Escucha las traducciones con text-to-speech
- **Persistencia**: Guarda configuración y texto automáticamente
- **Estadísticas**: Información detallada sobre la traducción

## Tecnologías Utilizadas

- [Vercel AI SDK](https://sdk.vercel.ai/): Framework para interactuar con modelos de IA
- [OpenAI GPT-4o-mini](https://openai.com/): Modelo de lenguaje optimizado para traducción
- HTML5, CSS3, JavaScript: Tecnologías web modernas
- Web Speech API: Para síntesis de voz
- LocalStorage API: Para persistencia de datos

## Estructura del Proyecto

```
translator/
├── index.js          # Script principal de traducción
├── ui.html           # Interfaz web completa
├── ui.css            # Estilos modernos y responsivos
├── ui.js             # Lógica de la interfaz y funcionalidades
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
   npm install ai @ai-sdk/openai util
   ```

2. **Configurar variables de entorno:**
   ```bash
   export OPENAI_API_KEY="tu-api-key-aqui"
   ```

## Uso

### Script de línea de comandos

```bash
# Traducción básica
node index.js --text "Hola mundo" --target "inglés"

# Especificar idioma de origen
node index.js --text "Hello world" --source "inglés" --target "español"

# Usar detección automática (por defecto)
node index.js --text "Bonjour le monde" --target "español"
```

### Interfaz web

1. Abrir `ui.html` en un navegador web
2. Introducir tu API Key de OpenAI
3. Seleccionar idiomas de origen y destino
4. Escribir o pegar el texto a traducir
5. Configurar opciones avanzadas si es necesario
6. Hacer clic en "Traducir Texto"

## Funcionalidades de la UI

### Configuración de Idiomas
- **Idiomas soportados**: Español, Inglés, Francés, Alemán, Italiano, Portugués, Chino, Japonés, Coreano, Ruso, Árabe
- **Detección automática**: Opción para detectar automáticamente el idioma de origen
- **Intercambio rápido**: Botón para intercambiar idiomas de origen y destino

### Área de Texto
- **Contador de caracteres**: Límite de 5000 caracteres con indicador visual
- **Controles de texto**: Pegar, limpiar, copiar, reproducir audio
- **Validación en tiempo real**: Verificación de longitud y contenido

### Opciones Avanzadas
- **Tono formal**: Utiliza un registro formal y profesional
- **Traducción contextual**: Considera contexto cultural e idiomático
- **Preservar formato**: Mantiene saltos de línea y espaciado original

### Funciones de Productividad
- **Portapapeles**: Integración completa con copy/paste
- **Síntesis de voz**: Escucha las traducciones con pronunciación nativa
- **Persistencia**: Guarda automáticamente configuración y texto
- **Estadísticas**: Información sobre palabras, caracteres y opciones aplicadas

## Ejemplo de Uso Programático

```javascript
// Configuración básica
const { values } = parseArgs({
    args: Bun.argv,
    options: {
        text: { type: 'string' },
        target: { type: 'string', default: 'inglés' },
        source: { type: 'string', default: 'auto' }
    }
});

// Llamada a la API
const { text } = await generateText({
    model: openai('gpt-4o-mini'),
    prompt: generateTranslationPrompt(values.text, values.source, values.target)
});
```

## Idiomas Soportados

| Idioma | Código | Síntesis de Voz |
|--------|--------|----------------|
| Español | es-ES | ✅ |
| Inglés | en-US | ✅ |
| Francés | fr-FR | ✅ |
| Alemán | de-DE | ✅ |
| Italiano | it-IT | ✅ |
| Portugués | pt-PT | ✅ |
| Chino | zh-CN | ✅ |
| Japonés | ja-JP | ✅ |
| Coreano | ko-KR | ✅ |
| Ruso | ru-RU | ✅ |
| Árabe | ar-SA | ✅ |

## Consideraciones de Rendimiento

- **Modelo optimizado**: Utiliza GPT-4o-mini para balance entre calidad y velocidad
- **Caché local**: Guarda configuraciones para evitar reconfiguración
- **Validación previa**: Evita llamadas innecesarias a la API
- **Límites de caracteres**: Controla el uso de tokens de la API

## Consideraciones de Seguridad

- **API Keys**: Almacenamiento seguro en localStorage, nunca en código
- **Validación de entrada**: Sanitización de texto antes del envío
- **Rate limiting**: Respeta los límites de la API de OpenAI
- **Datos privados**: No se almacenan textos sensibles permanentemente

## Limitaciones

- Requiere conexión a internet para la traducción
- Limitado por los rate limits de OpenAI
- Máximo 5000 caracteres por traducción
- La síntesis de voz depende del soporte del navegador

## Casos de Uso

- **Traducción de documentos**: Textos largos con preservación de formato
- **Comunicación internacional**: Mensajes y emails profesionales
- **Aprendizaje de idiomas**: Comparación de traducciones con audio
- **Contenido web**: Traducción de contenido para sitios multiidioma
- **Investigación**: Traducción de textos académicos y técnicos

## Contribución

Para contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Realiza tus cambios y añade tests si es necesario
4. Commit tus cambios (`git commit -am 'Añade nueva funcionalidad'`)
5. Push a la rama (`git push origin feature/nueva-funcionalidad`)
6. Crea un Pull Request

## Roadmap

- [ ] Soporte para más idiomas
- [ ] Traducción de archivos (PDF, DOCX)
- [ ] API REST para integración
- [ ] Modo offline con modelos locales
- [ ] Integración con servicios de almacenamiento

## Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo LICENSE para más detalles.

## Soporte

Para reportar bugs, solicitar features o hacer preguntas:

- Crea un issue en el repositorio
- Contacta al equipo de desarrollo
- Consulta la documentación de la Vercel AI SDK

## Agradecimientos

- Vercel AI SDK por el framework de IA
- OpenAI por los modelos de lenguaje
- Comunidad open source como Midudev por sus videos