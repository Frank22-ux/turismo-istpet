#!/usr/bin/env node

require('dotenv').config();
const seedDatabase = require('./database.seeder');

const runSeed = async () => {
    try {
        console.log('\n========================================');
        console.log('🌱 SISTEMA DE SEEDERS - TURISMO ISTPET');
        console.log('========================================\n');
        
        await seedDatabase();
        console.log('✅ Seed completado. Saliendo...\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    }
};

runSeed();
