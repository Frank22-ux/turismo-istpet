const bcrypt = require('bcryptjs');

const hash = '$2b$10$Xm7vIubR9UuT7m/C6Zt7.uUXkH/f9X1L2LzBw7q1RUp7O8yB9q5y2';
const passwords = ['Pass123!', 'Admin123!', '123456', 'password', 'Guia123!', '1234', '12345'];

async function check() {
    for (const p of passwords) {
        const match = await bcrypt.compare(p, hash);
        console.log(`Password: ${p} -> Match: ${match}`);
    }
}

check();
