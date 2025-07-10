# Unified AI Tools Interface

Una interfaz web unificada que integra múltiples herramientas de inteligencia artificial en una sola aplicación moderna y responsiva.

## 🚀 Características

### Herramientas Integradas
- **DALL-E 3**: Generación de imágenes con OpenAI
- **Flux**: Generación de imágenes con Replicate
- **Gemini IP**: Análisis de direcciones IP con datos geográficos
- **SST Gemini**: Análisis avanzado de IP con múltiples opciones
- **Tool Calling**: Análisis de IP con capacidades de tool calling
- **Translator**: Traductor de texto multiidioma con opciones avanzadas

### Funcionalidades Principales
- ✅ **Gestión centralizada de API keys** con almacenamiento seguro
- ✅ **Interfaz responsiva** optimizada para móviles y escritorio
- ✅ **Navegación fluida** entre herramientas con animaciones
- ✅ **Validación en tiempo real** de inputs
- ✅ **Detección automática de IP** del usuario
- ✅ **Manejo elegante de errores** con notificaciones
- ✅ **Estados de carga** durante el procesamiento
- ✅ **Tema moderno** con gradientes y efectos visuales

## 📋 Requisitos

### APIs Necesarias
- **OpenAI API Key**: Para DALL-E, análisis de IP y traducción
- **Replicate API Key**: Para generación de imágenes con Flux
- **Gemini API Key**: Para funcionalidades específicas de Gemini (opcional)

### Navegadores Compatibles
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 🛠️ Instalación y Uso

### Método 1: Uso Directo
1. Abre `unified-ui.html` en tu navegador
2. Configura tus API keys en la sección superior
3. Selecciona la herramienta que deseas usar
4. ¡Comienza a crear!

### Método 2: Servidor Local
```bash
# Con Python
python -m http.server 8000

# Con Node.js
npx serve .

# Luego visita http://localhost:8000/unified-ui.html
```

## 🔧 Configuración

### API Keys
1. **OpenAI**: Obtén tu clave en [platform.openai.com](https://platform.openai.com/api-keys)
2. **Replicate**: Regístrate en [replicate.com](https://replicate.com) y obtén tu token
3. **Gemini**: Configura tu clave de Google AI Studio (opcional)

### Almacenamiento Seguro
- Las API keys se almacenan localmente en tu navegador
- Usa el botón 👁️ para mostrar/ocultar las claves
- Las claves nunca se envían a servidores externos excepto a las APIs oficiales

## 📖 Guía de Uso

### DALL-E 3
1. Ingresa una descripción detallada de la imagen
2. Selecciona tamaño, calidad y estilo
3. Haz clic en "Generar Imagen"
4. Espera el resultado (30-60 segundos)

### Flux
1. Describe la imagen que quieres generar
2. Configura proporción, formato y calidad
3. Inicia la generación
4. El sistema hará polling hasta obtener el resultado

### Análisis de IP
1. Ingresa una dirección IP válida
2. Usa "Detectar Mi IP" para análisis automático
3. Personaliza el prompt de análisis (opcional)
4. Selecciona opciones de análisis específicas
5. Obtén información técnica + análisis AI

### Traductor
1. Selecciona idiomas de origen y destino
2. Ingresa el texto a traducir
3. Configura opciones avanzadas:
   - Tono formal
   - Traducción contextual
   - Preservar formato
4. Usa funciones de productividad:
   - Copiar/Pegar
   - Síntesis de voz
   - Intercambio de idiomas

## 🏗️ Estructura del Proyecto

```
├── unified-ui.html          # Interfaz principal
├── unified-ui.css           # Estilos y diseño
├── unified-ui.js            # Lógica y funcionalidad
├── README.md               # Este archivo
└── [subcarpetas]/          # Herramientas individuales
    ├── index.js            # Scripts de línea de comandos
    ├── ui.html             # Interfaces individuales
    ├── ui.css              # Estilos específicos
    ├── ui.js               # Lógica específica
    └── readme.md           # Documentación específica
```

## 🎨 Personalización

### Colores y Tema
Edita `unified-ui.css` para personalizar:
- Gradientes de fondo
- Colores de botones
- Efectos de hover
- Animaciones

### Agregar Nuevas Herramientas
1. Añade un botón en la navegación
2. Crea un panel en el HTML
3. Implementa la lógica en `unified-ui.js`
4. Añade estilos específicos en el CSS

## 🔒 Seguridad

### Buenas Prácticas
- ✅ Las API keys se almacenan solo localmente
- ✅ Validación de inputs antes del envío
- ✅ Manejo seguro de errores
- ✅ No se registran datos sensibles

### Recomendaciones
- Usa claves API con permisos mínimos necesarios
- Revisa regularmente el uso de tus APIs
- No compartas tus claves API
- Considera usar variables de entorno en producción

## 🚨 Solución de Problemas

### Errores Comunes

**"API key no configurada"**
- Verifica que hayas ingresado la clave correcta
- Asegúrate de que la clave tenga permisos suficientes

**"Error de CORS"**
- Usa un servidor local en lugar de abrir el archivo directamente
- Algunos navegadores bloquean requests desde file://

**"Tiempo de espera agotado"**
- Las APIs pueden tardar en responder
- Verifica tu conexión a internet
- Intenta con prompts más simples

**"IP inválida"**
- Usa el formato IPv4: 192.168.1.1
- Verifica que la IP sea pública para análisis externos

### Depuración
1. Abre las herramientas de desarrollador (F12)
2. Revisa la consola para errores
3. Verifica la pestaña Network para requests fallidos
4. Comprueba que las API keys estén configuradas

## 📱 Compatibilidad Móvil

- ✅ Diseño completamente responsivo
- ✅ Menú hamburguesa para navegación
- ✅ Botones optimizados para touch
- ✅ Layouts adaptables según el tamaño de pantalla

## 🔄 Actualizaciones

### Versión Actual: 1.0.0
- Integración completa de 6 herramientas AI
- Interfaz unificada y responsiva
- Gestión centralizada de API keys
- Validaciones y manejo de errores

### Próximas Características
- [ ] Historial de generaciones
- [ ] Exportación de resultados
- [ ] Temas personalizables
- [ ] Más proveedores de AI
- [ ] Modo offline para algunas funciones

## 🤝 Contribución

### Cómo Contribuir
1. Fork el proyecto
2. Crea una rama para tu feature
3. Implementa los cambios
4. Prueba en múltiples navegadores
5. Envía un pull request

### Reportar Bugs
- Describe el problema detalladamente
- Incluye pasos para reproducir
- Especifica navegador y versión
- Adjunta capturas de pantalla si es necesario

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Puedes usarlo, modificarlo y distribuirlo libremente.

## 🙏 Agradecimientos

- **OpenAI** por DALL-E y GPT APIs
- **Replicate** por Flux y modelos de AI
- **Google** por Gemini AI
- **ip-api.com** e **ip.guide** por servicios de geolocalización

## 📞 Soporte

Si tienes preguntas o necesitas ayuda:
1. Revisa la sección de solución de problemas
2. Consulta la documentación de las APIs
3. Abre un issue en el repositorio

---

**¡Disfruta creando con AI! 🎨🤖**