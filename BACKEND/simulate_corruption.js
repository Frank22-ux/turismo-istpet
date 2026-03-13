const pool = require('./src/config/db');
const bcrypt = require('bcryptjs');
const axios = require('axios');

const API_URL = 'http://localhost:4000/api';

async function simulate() {
    console.log('--- STARTING SIMULATION ---');
    
    // 1. Check Jose state
    const res1 = await pool.query('SELECT password FROM usuarios WHERE correo = $1', ['jose@sistema.com']);
    const hashInitial = res1.rows[0].password;
    const matchJoseInitial = await bcrypt.compare('Jose2026.', hashInitial);
    console.log(`Step 1: Jose initial match: ${matchJoseInitial}`);
    
    // 2. Login as Jorge
    console.log('Step 2: Logging in as Jorge...');
    try {
        await axios.post(`${API_URL}/auth/login`, {
            correo: 'jorge@sistema.com',
            password: 'Jorge2026.'
        });
        console.log('  Jorge login successful.');
    } catch (err) {
        console.log('  Jorge login failed:', err.response?.data || err.message);
    }
    
    // 3. Re-check Jose state
    const res2 = await pool.query('SELECT password FROM usuarios WHERE correo = $1', ['jose@sistema.com']);
    const hashFinal = res2.rows[0].password;
    const matchJoseFinal = await bcrypt.compare('Jose2026.', hashFinal);
    console.log(`Step 3: Jose final match: ${matchJoseFinal}`);
    
    if (hashInitial !== hashFinal) {
        console.log('🚨 ALERT: Jose hash has CHANGED!');
        console.log(`  Initial: ${hashInitial}`);
        console.log(`  Final:   ${hashFinal}`);
    } else {
        console.log('✅ Jose hash is unchanged.');
    }
    
    await pool.end();
}

simulate();
