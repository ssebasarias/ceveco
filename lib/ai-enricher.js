/**
 * 🤖 Enriquecedor con IA usando OpenAI/Gemini
 * Genera descripciones y extrae especificaciones usando IA
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIEnricher {
    constructor(apiKey) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    }

    /**
     * Generar descripción completa del producto
     */
    async generateDescription(ref, nombre, categoria, rawInfo) {
        const prompt = `
Eres un experto en redacción de descripciones de productos para e-commerce.

PRODUCTO:
- Referencia: ${ref}
- Nombre: ${nombre}
- Categoría: ${categoria}

INFORMACIÓN DISPONIBLE:
${JSON.stringify(rawInfo, null, 2)}

TAREA:
Genera una descripción de producto profesional y atractiva en formato HTML que incluya:

1. Una descripción corta (máximo 200 caracteres) para vista previa
2. Una descripción larga detallada (mínimo 300 palabras) que incluya:
   - Introducción atractiva
   - Características principales
   - Beneficios para el usuario
   - Casos de uso
   - Por qué elegir este producto

FORMATO DE RESPUESTA (JSON):
{
  "descripcion_corta": "...",
  "descripcion_larga": "<html>...</html>"
}

IMPORTANTE:
- Usa lenguaje persuasivo pero honesto
- Enfócate en beneficios, no solo características
- Usa HTML semántico (h3, p, ul, li)
- Sé específico y detallado
- Adapta el tono al tipo de producto
`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Intentar parsear JSON de la respuesta
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            // Fallback si no se puede parsear
            return {
                descripcion_corta: nombre.substring(0, 200),
                descripcion_larga: `<p>${nombre}</p>`
            };

        } catch (error) {
            console.error('Error generando descripción:', error.message);
            return {
                descripcion_corta: nombre.substring(0, 200),
                descripcion_larga: `<p>${nombre}</p>`
            };
        }
    }

    /**
     * Generar descripción natural desde especificaciones técnicas
     * Convierte specs técnicas en texto fluido y atractivo
     */
    async generateDescriptionFromSpecs(ref, nombre, categoria, specs) {
        const specsText = typeof specs === 'object'
            ? JSON.stringify(specs, null, 2)
            : specs;

        const prompt = `
Eres un experto redactor de contenido para e-commerce. Tu tarea es crear una descripción atractiva y profesional de un producto basándote ÚNICAMENTE en sus especificaciones técnicas.

PRODUCTO:
- Referencia: ${ref}
- Nombre: ${nombre}
- Categoría: ${categoria}

ESPECIFICACIONES TÉCNICAS:
${specsText}

TAREA:
Crea una descripción natural, fluida y persuasiva que:

1. **Descripción Corta** (máximo 200 caracteres):
   - Resalta las características más importantes
   - Usa lenguaje atractivo y directo
   - Ejemplo: "Elegante sofá de 3 puestos en tela premium azul cielo. Diseño moderno con acabados de alta calidad."

2. **Descripción Larga** (300-500 palabras en HTML):
   - Introduce el producto de forma atractiva
   - Describe las especificaciones de manera natural (NO como lista técnica)
   - Enfatiza beneficios, no solo características
   - Usa un tono profesional pero cercano
   - Incluye casos de uso y ventajas
   
EJEMPLOS DE TRANSFORMACIÓN:

❌ MAL (técnico y aburrido):
"Color: Azul. Material: Tela. Dimensiones: 200x90x85cm"

✅ BIEN (natural y atractivo):
"Este elegante sofá en tono azul cielo aporta un toque de sofisticación a cualquier espacio. Fabricado con tela de primera calidad, combina durabilidad y confort. Sus generosas dimensiones de 200x90x85 cm lo hacen ideal para salas amplias donde el estilo y la comodidad son prioridad."

FORMATO DE RESPUESTA (JSON):
{
  "descripcion_corta": "...",
  "descripcion_larga": "<div class='product-description'><h3>Sobre este producto</h3><p>...</p><h3>Características destacadas</h3><p>...</p><h3>¿Por qué elegirlo?</h3><p>...</p></div>"
}

IMPORTANTE:
- NO uses listas de especificaciones técnicas (ul/li) en la descripción
- Transforma las specs en texto narrativo fluido
- Usa lenguaje persuasivo pero honesto
- Adapta el tono a la categoría del producto
- Si es un producto premium, usa lenguaje más elegante
- Si es un producto funcional, enfócate en practicidad
`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Intentar parsear JSON de la respuesta
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            // Fallback
            return {
                descripcion_corta: nombre.substring(0, 200),
                descripcion_larga: `<div class="product-description"><p>${nombre}</p></div>`
            };

        } catch (error) {
            console.error('Error generando descripción desde specs:', error.message);
            return {
                descripcion_corta: nombre.substring(0, 200),
                descripcion_larga: `<div class="product-description"><p>${nombre}</p></div>`
            };
        }
    }

    /**
     * Extraer especificaciones técnicas estructuradas
     */
    async extractSpecifications(ref, nombre, categoria, rawInfo) {
        const prompt = `
Eres un experto en análisis de especificaciones técnicas de productos.

PRODUCTO:
- Referencia: ${ref}
- Nombre: ${nombre}
- Categoría: ${categoria}

INFORMACIÓN DISPONIBLE:
${JSON.stringify(rawInfo, null, 2)}

TAREA:
Extrae y estructura las especificaciones técnicas del producto.

FORMATO DE RESPUESTA (JSON Array):
[
  {
    "nombre": "Tamaño de Pantalla",
    "valor": "55",
    "unidad": "pulgadas"
  },
  {
    "nombre": "Resolución",
    "valor": "4K Ultra HD",
    "unidad": null
  }
]

ESPECIFICACIONES IMPORTANTES SEGÚN CATEGORÍA:

TELEVISORES:
- Tamaño de pantalla (pulgadas)
- Resolución (HD/Full HD/4K/8K)
- Tecnología de pantalla (LED/OLED/QLED)
- Smart TV (Sí/No)
- Sistema operativo (webOS/Tizen/Android TV)
- Puertos HDMI (cantidad)
- Puertos USB (cantidad)
- HDR (Sí/No)
- Frecuencia de actualización (Hz)

NEVERAS:
- Capacidad (litros)
- Tipo (Top Mount/Side by Side/French Door)
- Tecnología de frío (No Frost/Frost)
- Eficiencia energética
- Dispensador de agua (Sí/No)
- Fabricador de hielo (Sí/No)

LAVADORAS:
- Capacidad de carga (kg)
- Tipo (Carga superior/frontal)
- Velocidad de centrifugado (RPM)
- Número de programas
- Tecnología Inverter (Sí/No)

Extrae SOLO las especificaciones que puedas confirmar con la información disponible.
`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Intentar parsear JSON de la respuesta
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            return [];

        } catch (error) {
            console.error('Error extrayendo especificaciones:', error.message);
            return [];
        }
    }

    /**
     * Clasificar producto automáticamente
     */
    async classifyProduct(ref, nombre) {
        const prompt = `
Clasifica el siguiente producto en la categoría y subcategoría correcta.

PRODUCTO:
- Referencia: ${ref}
- Nombre: ${nombre}

CATEGORÍAS DISPONIBLES:
1. Electro Hogar
   - Subcategorías: Lavadoras, Neveras, Estufas, Televisores, Microondas, Aires Acondicionados, etc.
2. Muebles y Organización
   - Subcategorías: Escritorios, Sillas, Estanterías, Mesas, Camas, etc.
3. Motos
   - Subcategorías: Motos Urbanas, Motos Deportivas, Accesorios, etc.
4. Herramientas STIHL
   - Subcategorías: Motosierras, Guadañas, Sopladores, etc.

MARCAS CONOCIDAS:
LG, Samsung, Kalley, Haceb, Mabe, Whirlpool, Honda, Yamaha, STIHL, etc.

FORMATO DE RESPUESTA (JSON):
{
  "categoria": "Electro Hogar",
  "subcategoria": "Televisores",
  "marca": "LG",
  "confianza": 0.95
}
`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            return null;

        } catch (error) {
            console.error('Error clasificando producto:', error.message);
            return null;
        }
    }
}

module.exports = AIEnricher;
