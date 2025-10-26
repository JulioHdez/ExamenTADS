const axios = require('axios');

async function testLogin() {
    try {
        console.log('=== Probando Login ===');
        
        const response = await axios.post('http://localhost:3001/api/docentes/login/email', {
            email: 'test1@tec.com',
            password: 'test1234'
        });
        
        console.log('✅ Login exitoso!');
        console.log('Respuesta:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.log('❌ Error en el login:');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', error.response.data);
        } else {
            console.log('Error:', error.message);
        }
    }
}

testLogin();