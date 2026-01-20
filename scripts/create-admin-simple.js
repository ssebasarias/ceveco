#!/usr/bin/env node

/**
 * Script simple para crear un usuario administrador
 * Uso: node scripts/create-admin-simple.js
 */

require('dotenv').config({ path: './backend/.env' });
const UsuarioModel = require('../backend/src/models/usuario.model');

async function createAdminUser() {
    try {
        console.log('🔄 Creando usuario administrador...\n');

        const email = 'admin@ceveco.com';
        const password = 'admin123';
        const nombre = 'Administrador';
        const apellido = 'Ceveco';

        // Verificar si el email ya existe
        const existingUser = await UsuarioModel.findByEmail(email);
        if (existingUser) {
            console.log('⚠️  El email ya está registrado.');
            
            // Actualizar rol a admin si no lo es
            if (existingUser.rol !== 'admin') {
                const { query } = require('../backend/src/config/db');
                await query(
                    'UPDATE usuarios SET rol = $1 WHERE email = $2 RETURNING id_usuario, email, nombre, rol',
                    ['admin', email.toLowerCase()]
                );
                console.log('✅ Usuario actualizado a administrador exitosamente!');
            } else {
                console.log('✅ El usuario ya es administrador.');
            }
            
            console.log(`   Email: ${email}`);
            console.log(`   Contraseña: ${password}`);
            console.log(`   Rol: admin\n`);
            return;
        }

        // Crear usuario admin
        const newUser = await UsuarioModel.create({
            email: email.toLowerCase(),
            password,
            nombre,
            apellido,
            rol: 'admin',
            auth_method: 'local',
            email_verificado: true
        });

        console.log('✅ Usuario administrador creado exitosamente!\n');
        console.log('═══════════════════════════════════════════════════════');
        console.log('  Credenciales de acceso:');
        console.log('═══════════════════════════════════════════════════════');
        console.log(`   Email: ${newUser.email}`);
        console.log(`   Contraseña: ${password}`);
        console.log(`   Nombre: ${newUser.nombre} ${newUser.apellido || ''}`);
        console.log(`   Rol: ${newUser.rol}`);
        console.log(`   ID: ${newUser.id_usuario}`);
        console.log('═══════════════════════════════════════════════════════\n');
        console.log('💡 Puedes iniciar sesión en: /pages/login.html');
        console.log('💡 Panel de administración: /pages/admin.html\n');

    } catch (error) {
        console.error('❌ Error al crear usuario administrador:', error.message);
        if (process.env.NODE_ENV === 'development') {
            console.error(error);
        }
        process.exit(1);
    }
}

// Ejecutar
createAdminUser();
