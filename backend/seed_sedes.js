const { query } = require('./src/config/db');

async function seedSedes() {
    try {
        console.log('🌱 Seeding Sedes...');

        // 1. Riosucio (Update existing or insert)
        const riosucio = {
            nombre: 'Ceveco Riosucio',
            codigo: 'RS001',
            departamento: 'Caldas',
            ciudad: 'Riosucio',
            direccion: 'Carrera 5 # 9-45',
            telefono: '(606) 859 1234',
            latitud: 5.4200, // Approx
            longitud: -75.7000
        };

        await query(`
            INSERT INTO sedes (nombre, codigo, departamento, ciudad, direccion, telefono, latitud, longitud, es_principal, activo)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE, TRUE)
            ON CONFLICT (codigo) DO UPDATE SET
            latitud = $7, longitud = $8
        `, [riosucio.nombre, riosucio.codigo, riosucio.departamento, riosucio.ciudad, riosucio.direccion, riosucio.telefono, riosucio.latitud, riosucio.longitud]);

        // 2. Supia
        const supia = {
            nombre: 'Ceveco Supía', // Added Ceveco prefix for consistency
            codigo: 'SP001',
            departamento: 'Caldas',
            ciudad: 'Supía',
            direccion: 'Cra 7 # 10-20', // Fake address for demo
            telefono: '(606) 856 5678',
            latitud: 5.4500,
            longitud: -75.6500
        };
        await query(`
             INSERT INTO sedes (nombre, codigo, departamento, ciudad, direccion, telefono, latitud, longitud, es_principal, activo)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, FALSE, TRUE)
             ON CONFLICT (codigo) DO UPDATE SET
             latitud = $7, longitud = $8
         `, [supia.nombre, supia.codigo, supia.departamento, supia.ciudad, supia.direccion, supia.telefono, supia.latitud, supia.longitud]);

        // 3. La Virginia
        const virginia = {
            nombre: 'Ceveco La Virginia',
            codigo: 'LV001',
            departamento: 'Risaralda',
            ciudad: 'La Virginia',
            direccion: 'Calle 10 # 5-30', // Fake
            telefono: '(606) 368 9012',
            latitud: 4.9000,
            longitud: -75.8800
        };
        await query(`
             INSERT INTO sedes (nombre, codigo, departamento, ciudad, direccion, telefono, latitud, longitud, es_principal, activo)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, FALSE, TRUE)
             ON CONFLICT (codigo) DO UPDATE SET
             latitud = $7, longitud = $8
         `, [virginia.nombre, virginia.codigo, virginia.departamento, virginia.ciudad, virginia.direccion, virginia.telefono, virginia.latitud, virginia.longitud]);

        // 4. La Pintada
        const pintada = {
            nombre: 'Ceveco La Pintada',
            codigo: 'LP001',
            departamento: 'Antioquia',
            ciudad: 'La Pintada',
            direccion: 'Av 30 de Mayo # 12-14', // Fake
            telefono: '(604) 845 3456',
            latitud: 5.7500,
            longitud: -75.6000
        };
        await query(`
             INSERT INTO sedes (nombre, codigo, departamento, ciudad, direccion, telefono, latitud, longitud, es_principal, activo)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, FALSE, TRUE)
             ON CONFLICT (codigo) DO UPDATE SET
             latitud = $7, longitud = $8
         `, [pintada.nombre, pintada.codigo, pintada.departamento, pintada.ciudad, pintada.direccion, pintada.telefono, pintada.latitud, pintada.longitud]);

        // 5. Anserma
        const anserma = {
            nombre: 'Ceveco Anserma',
            codigo: 'AN001',
            departamento: 'Caldas',
            ciudad: 'Anserma',
            direccion: 'Calle Real # 4-55', // Fake
            telefono: '(606) 853 7890',
            latitud: 5.2300,
            longitud: -75.7800
        };
        await query(`
             INSERT INTO sedes (nombre, codigo, departamento, ciudad, direccion, telefono, latitud, longitud, es_principal, activo)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, FALSE, TRUE)
             ON CONFLICT (codigo) DO UPDATE SET
             latitud = $7, longitud = $8
         `, [anserma.nombre, anserma.codigo, anserma.departamento, anserma.ciudad, anserma.direccion, anserma.telefono, anserma.latitud, anserma.longitud]);

        console.log('✅ Sedes seeded successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding sedes:', error);
        process.exit(1);
    }
}

seedSedes();
