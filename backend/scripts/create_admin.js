
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const client = new Client({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'host.docker.internal',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'ceveco_db',
});

async function run() {
    try {
        await client.connect();
        console.log('Connected to DB');

        // Check if admin exits
        const res = await client.query("SELECT * FROM usuarios WHERE rol = 'admin'");
        if (res.rows.length > 0) {
            console.log('Admin user exists:', res.rows[0].email);
            // Force update password to 'admin123'
            const passwordHash = await bcrypt.hash('admin123', 12);
            await client.query("UPDATE usuarios SET password_hash = $1 WHERE email = $2", [passwordHash, res.rows[0].email]);
            console.log('Updated password for:', res.rows[0].email);
        } else {
            console.log('No admin user found. Creating one...');
            const passwordHash = await bcrypt.hash('admin123', 12);
            const insert = await client.query(`
                INSERT INTO usuarios (email, password_hash, nombre, rol, activo, email_verificado)
                VALUES ($1, $2, $3, 'admin', true, true)
                RETURNING id_usuario, email;
            `, ['admin@test.com', passwordHash, 'Admin Test']);
            console.log('Created admin user:', insert.rows[0]);
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
