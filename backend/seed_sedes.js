const { query } = require('./src/config/db');

/**
 * Sedes de Ceveco.
 *
 * `telefono` es el número que se muestra en la página de sedes y `whatsapp`
 * el que abre el chat. Desde jul-2026 la empresa unificó ambos en la línea
 * celular de cada sede.
 *
 * La Pintada queda con `activo: false`: se saca de la web (SedeModel.findAll
 * filtra por activo = TRUE) sin borrar el histórico.
 */
const SEDES = [
    {
        nombre: 'Ceveco Riosucio',
        codigo: 'RS001',
        departamento: 'Caldas',
        ciudad: 'Riosucio',
        direccion: 'Cl. 9 #575',
        telefono: '3106650678',
        whatsapp: '573106650678',
        horario_atencion: 'Lunes a Viernes: 7:30 AM - 12:00 PM | 2:00 PM - 6:00 PM\nSábados: 7:30 AM - 1:00 PM',
        latitud: 5.4212985,
        longitud: -75.703798,
        link_google_maps: 'https://www.google.com/maps/place/CEVECO+S.A.S/@5.1594593,-75.959166,11z/data=!4m10!1m2!2m1!1sceveco+la+virgunia!3m6!1s0x8e470785607d6591:0x81328d9b87aa18f2!8m2!3d5.4212985!4d-75.703798!15sChJjZXZlY28gbGEgdmlyZ2luaWFaFCISY2V2ZWNvIGxhIHZpcmdpbmlhkgEPYXBwbGlhbmNlX3N0b3Jl4AEA!16s%2Fg%2F11c44d5ksb?entry=ttu',
        es_principal: true,
        activo: true
    },
    {
        nombre: 'Ceveco Supía',
        codigo: 'SP001',
        departamento: 'Caldas',
        ciudad: 'Supía',
        direccion: 'Supia-Caramanta #33-2 a 33-80',
        telefono: '3147721698',
        whatsapp: '573147721698',
        horario_atencion: 'Lunes a Viernes: 7:30 AM - 12:00 PM | 2:00 PM - 6:00 PM\nSábados: 7:30 AM - 1:00 PM',
        latitud: 5.4564245,
        longitud: -75.6505518,
        link_google_maps: 'https://www.google.com/maps/place/Ceveco/@5.4388828,-75.6874746,15z/data=!4m10!1m2!2m1!1sceveco+supia!3m6!1s0x8e470703af2f6077:0xfdd6e3bf39629ce0!8m2!3d5.4564245!4d-75.6505518!15sCgxjZXZlY28gc3VwaWGSARFnb3Zlcm5tZW50X29mZmljZeABAA!16s%2Fg%2F11rbyxdd2g?entry=ttu',
        es_principal: false,
        activo: true
    },
    {
        nombre: 'Ceveco La Virginia',
        codigo: 'LV001',
        departamento: 'Risaralda',
        ciudad: 'La Virginia',
        direccion: 'Cra. 5a #9-21',
        telefono: '3113078772',
        whatsapp: '573113078772',
        horario_atencion: 'Lunes a Viernes: 7:30 AM - 12:00 PM | 2:00 PM - 6:00 PM\nSábados: 7:30 AM - 1:00 PM',
        latitud: 4.8969787,
        longitud: -75.8849224,
        link_google_maps: 'https://www.google.com/maps/place/Ceveco+La+Virginia/@5.1594593,-75.959166,11z/data=!4m10!1m2!2m1!1sceveco+la+virgunia!3m6!1s0x8e4689ef47a7c443:0x93f96a2d2f69d2af!8m2!3d4.8969787!4d-75.8849224!15sChJjZXZlY28gbGEgdmlyZ2luaWFaFCISY2V2ZWNvIGxhIHZpcmdpbmlhkgERZWxlY3Ryb25pY3Nfc3RvcmXgAQA!16s%2Fg%2F11gsbbx_cj?entry=ttu',
        es_principal: false,
        activo: true
    },
    {
        nombre: 'Ceveco Anserma',
        codigo: 'AN001',
        departamento: 'Caldas',
        ciudad: 'Anserma',
        direccion: 'Cra. 4 #1446',
        telefono: '3128859141',
        whatsapp: '573128859141',
        horario_atencion: 'Lunes a Viernes: 7:30 AM - 12:00 PM | 2:00 PM - 6:00 PM\nSábados: 7:30 AM - 1:00 PM',
        latitud: 5.2343158,
        longitud: -75.7859593,
        link_google_maps: 'https://www.google.com/maps/place/Ceveco+Anserma/@5.2343433,-75.7859615,16z/data=!4m10!1m2!2m1!1sceveco+anserma!3m6!1s0x8e47a1e0d04f692d:0x36395836e4792d8!8m2!3d5.2343158!4d-75.7859593!15sCg5jZXZlY28gYW5zZXJtYeABAA!16s%2Fg%2F11kmn1p2y_?entry=ttu',
        es_principal: false,
        activo: true
    },
    {
        // Cerrada — se conserva la fila por histórico, pero no se publica.
        nombre: 'Ceveco La Pintada',
        codigo: 'LP001',
        departamento: 'Antioquia',
        ciudad: 'La Pintada',
        direccion: 'av 30, EL CRUCERO, Rafael Uribe Uribe',
        telefono: null,
        whatsapp: null,
        horario_atencion: 'Lunes a Viernes: 7:30 AM - 12:00 PM | 2:00 PM - 6:00 PM\nSábados: 7:30 AM - 1:00 PM',
        latitud: 5.7403798,
        longitud: -75.6063925,
        link_google_maps: 'https://www.google.com/maps/place/CEVECO+S.A.S/@5.7378352,-75.6075257,17.5z/data=!4m10!1m2!2m1!1sceveco+la+pintada!3m6!1s0x8e46f17cc3c27c77:0x232444c29ca9d086!8m2!3d5.7403798!4d-75.6063925!15sChFjZXZlY28gbGEgcGludGFkYVoTIhFjZXZlY28gbGEgcGludGFkYZIBD2FwcGxpYW5jZV9zdG9yZeABAA!16s%2Fg%2F11fp3gqx7_?entry=ttu',
        es_principal: false,
        activo: false
    }
];

async function upsertSede(s) {
    // `celular` se mantiene igual a `telefono`: la línea de cada sede es celular.
    await query(`
        INSERT INTO sedes (nombre, codigo, departamento, ciudad, direccion, telefono, celular, whatsapp, horario_atencion, latitud, longitud, link_google_maps, es_principal, activo)
        VALUES ($1, $2, $3, $4, $5, $6, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (codigo) DO UPDATE SET
            latitud = $9, longitud = $10, direccion = $5, telefono = $6, celular = $6, whatsapp = $7,
            horario_atencion = $8, link_google_maps = $11, es_principal = $12, activo = $13
    `, [s.nombre, s.codigo, s.departamento, s.ciudad, s.direccion, s.telefono, s.whatsapp,
        s.horario_atencion, s.latitud, s.longitud, s.link_google_maps, s.es_principal, s.activo]);
}

async function seedSedes() {
    try {
        console.log('🌱 Seeding Sedes...');

        // Ensure column exists
        await query(`ALTER TABLE sedes ADD COLUMN IF NOT EXISTS link_google_maps TEXT;`);

        for (const sede of SEDES) {
            await upsertSede(sede);
            console.log(`   ${sede.activo ? '✓' : '⊘'} ${sede.nombre}${sede.activo ? '' : ' (inactiva)'}`);
        }

        console.log('✅ Sedes seeded successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding sedes:', error);
        process.exit(1);
    }
}

seedSedes();
