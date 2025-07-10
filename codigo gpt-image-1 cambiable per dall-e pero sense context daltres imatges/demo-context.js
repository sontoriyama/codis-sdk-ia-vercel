// Demo script para mostrar las nuevas funcionalidades
// Este script demuestra cómo usar el modelo GPT-Image-1 con contexto de imagen

// Importamos las librerías necesarias (requiere npm install ai @ai-sdk/openai)
import { experimental_generateImage as generateImage } from 'ai';
import { openai } from '@ai-sdk/openai';
import { writeFile, readFile } from 'fs/promises';

async function demoContextImageGeneration() {
    console.log('🎨 === Demo: Generación con Contexto de Imagen ===');
    
    try {
        // Paso 1: Generar imagen base
        console.log('\n📸 Paso 1: Generando imagen base...');
        const baseImage = await generateImage({
            model: openai.image('gpt-image-1'),
            prompt: 'Un robot en una ciudad futurista, estilo cyberpunk, colores neón',
            size: '1024x1024'
        });
        
        console.log('✅ Imagen base generada');
        await writeFile('demo-base.png', baseImage.uint8Array);
        console.log('💾 Guardada como: demo-base.png');
        
        // Paso 2: Usar la imagen como contexto para una variación
        console.log('\n🔄 Paso 2: Generando variación con contexto...');
        
        // Nota: En la implementación real, necesitarías convertir la imagen a base64
        // y usar la nueva funcionalidad de contexto cuando esté disponible en la API
        
        const variationImage = await generateImage({
            model: openai.image('gpt-image-1'),
            prompt: 'El mismo robot pero ahora volando entre los edificios, con efectos de movimiento',
            size: '1024x1024',
            // context_image: base64Image // Funcionalidad futura
        });
        
        console.log('✅ Variación generada');
        await writeFile('demo-variation.png', variationImage.uint8Array);
        console.log('💾 Guardada como: demo-variation.png');
        
        // Paso 3: Demostrar diferentes modelos
        console.log('\n🤖 Paso 3: Comparando modelos...');
        
        const models = [
            { name: 'GPT-Image-1', model: 'gpt-image-1' },
            { name: 'DALL-E 3', model: 'dall-e-3' },
            { name: 'DALL-E 2', model: 'dall-e-2' }
        ];
        
        for (const modelInfo of models) {
            console.log(`\n🎯 Generando con ${modelInfo.name}...`);
            
            const testImage = await generateImage({
                model: openai.image(modelInfo.model),
                prompt: 'Un gato mágico con poderes elementales, arte digital',
                size: '1024x1024'
            });
            
            const filename = `demo-${modelInfo.model.replace('-', '')}.png`;
            await writeFile(filename, testImage.uint8Array);
            console.log(`✅ ${modelInfo.name} completado - ${filename}`);
        }
        
        console.log('\n🎉 Demo completado exitosamente!');
        console.log('\n📁 Archivos generados:');
        console.log('  - demo-base.png (imagen base)');
        console.log('  - demo-variation.png (variación)');
        console.log('  - demo-gptimage1.png (GPT-Image-1)');
        console.log('  - demo-dalle3.png (DALL-E 3)');
        console.log('  - demo-dalle2.png (DALL-E 2)');
        
    } catch (error) {
        console.error('❌ Error durante la demo:', error);
        console.log('\n💡 Consejos:');
        console.log('  - Verifica que tengas una API key válida');
        console.log('  - Asegúrate de tener créditos suficientes');
        console.log('  - Comprueba tu conexión a internet');
    }
}

// Función para demostrar la conversión a base64 (para contexto futuro)
async function demoBase64Conversion() {
    console.log('\n🔧 === Demo: Conversión a Base64 para Contexto ===');
    
    try {
        // Leer una imagen existente y convertirla a base64
        const imageBuffer = await readFile('demo-base.png');
        const base64Image = imageBuffer.toString('base64');
        const dataUrl = `data:image/png;base64,${base64Image}`;
        
        console.log('✅ Imagen convertida a base64');
        console.log(`📏 Tamaño: ${Math.round(base64Image.length / 1024)} KB`);
        console.log(`🔗 Data URL: ${dataUrl.substring(0, 50)}...`);
        
        // Guardar el base64 para referencia
        await writeFile('demo-base64.txt', dataUrl);
        console.log('💾 Base64 guardado en: demo-base64.txt');
        
    } catch (error) {
        console.error('❌ Error en conversión base64:', error);
    }
}

// Función principal
async function main() {
    console.log('🚀 Iniciando demo de funcionalidades avanzadas...');
    console.log('⚡ Usando GPT-Image-1 con contexto de imagen');
    console.log('📅 Fecha:', new Date().toISOString());
    
    await demoContextImageGeneration();
    await demoBase64Conversion();
    
    console.log('\n🎯 La UI web ahora incluye:');
    console.log('  ✅ Selección de modelo (GPT-Image-1, DALL-E 3, DALL-E 2)');
    console.log('  ✅ Carga de imagen de contexto');
    console.log('  ✅ Vista previa de contexto');
    console.log('  ✅ Botón "Usar como contexto"');
    console.log('  ✅ Interfaz mejorada y responsiva');
    
    console.log('\n🌟 ¡Abre ui.html para probar la nueva interfaz!');
}

// Ejecutar demo
main().catch(console.error);
