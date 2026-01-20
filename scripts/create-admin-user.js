#!/usr/bin/env node

/**
 * Script para crear un usuario administrador
 * Uso: node scripts/create-admin-user.js
 * 
 * O con parámetros:
 * node scripts/create-admin-user.js --email admin@ceveco.com --password admin123 --nombre Admin
 */

require('dotenv').config({ path: './backend/.env' });
const UsuarioModel = require('../backend/src/models/usuario.model');
const readline = require('readline');

// Configurar interfaz de lectura
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Función para hacer preguntas
function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

// Función para leer contraseña (simplificada para Windows)
function questionPassword(query) {
    // En Windows, simplemente mostramos la contraseña
    // Para producción, se podría usar una librería como 'readline-sync' o 'inquirer'
    return question(query);
}

async function createAdminUser() {
    try {
        console.log('═══════════════════════════════════════════════════════');
        console.log('  Crear Usuario Administrador - Ceveco');
        console.log('═══════════════════════════════════════════════════════\n');

        // Obtener parámetros de línea de comandos
        const args = process.argv.slice(2);
        let email, password, nombre, apellido;

        // Parsear argumentos
        for (let i = 0; i < args.length; i++) {
            if (args[i] === '--email' && args[i + 1]) {
                email = args[i + 1];
                i++;
            } else if (args[i] === '--password' && args[i + 1]) {
                password = args[i + 1];
                i++;
            } else if (args[i] === '--nombre' && args[i + 1]) {
                nombre = args[i + 1];
                i++;
            } else if (args[i] === '--apellido' && args[i + 1]) {
                apellido = args[i + 1];
                i++;
            }
        }

        // Solicitar datos si no se proporcionaron
        if (!email) {
            email = await question('📧 Email del administrador: ');
        }
        if (!email || !email.includes('@')) {
            console.error('❌ Email inválido');
            process.exit(1);
        }

        if (!password) {
            password = await question('🔒 Contraseña (mínimo 6 caracteres): ');
        }
        if (!password || password.length < 6) {
            console.error('❌ La contraseña debe tener al menos 6 caracteres');
            process.exit(1);
        }

        // Confirmar contraseña (solo si no se pasó por parámetro)
        if (!process.argv.includes('--password')) {
            const confirmPassword = await question('🔒 Confirmar contraseña: ');
            if (password !== confirmPassword) {
                console.error('❌ Las contraseñas no coinciden');
                process.exit(1);
            }
        }

        if (!nombre) {
            nombre = await question('👤 Nombre: ');
        }
        if (!nombre) {
            console.error('❌ El nombre es requerido');
            process.exit(1);
        }

        if (!apellido) {
            apellido = await question('👤 Apellido (opcional): ') || null;
        }

        console.log('\n🔄 Creando usuario administrador...\n');

        // Verificar si el email ya existe
        const existingUser = await UsuarioModel.findByEmail(email);
        if (existingUser) {
            console.log('⚠️  El email ya está registrado.');
            const update = await question('¿Deseas actualizar el rol de este usuario a admin? (s/n): ');
            if (update.toLowerCase() === 's' || update.toLowerCase() === 'y') {
                // Actualizar rol a admin
                const { query } = require('../backend/src/config/db');
                await query(
                    'UPDATE usuarios SET rol = $1 WHERE email = $2 RETURNING id_usuario, email, nombre, rol',
                    ['admin', email.toLowerCase()]
                );
                console.log('✅ Usuario actualizado a administrador exitosamente!');
                console.log(`   Email: ${email}`);
                console.log(`   Rol: admin`);
                rl.close();
                return;
            } else {
                console.log('❌ Operación cancelada');
                rl.close();
                process.exit(0);
            }
        }

        // Crear usuario admin
        const newUser = await UsuarioModel.create({
            email: email.toLowerCase(),
            password,
            nombre,
            apellido,
            rol: 'admin',
            auth_method: 'local',
            email_verificado: true // Marcar como verificado para admin
        });

        console.log('✅ Usuario administrador creado exitosamente!\n');
        console.log('═══════════════════════════════════════════════════════');
        console.log('  Credenciales de acceso:');
        console.log('═══════════════════════════════════════════════════════');
        console.log(`   Email: ${newUser.email}`);
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
    } finally {
        rl.close();
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    createAdminUser();
}

module.exports = { createAdminUser };
