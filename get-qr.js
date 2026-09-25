import axios from 'axios';

async function getPairingCodeCorrect() {
    try {
        const instanceName = "whatsapp-bot-v3";
        const phoneNumber = "5567993197336"; // Seu número

        console.log(`Solicitando pairing code para ${phoneNumber} via GET...`);
        
        // A rota de connect usa GET e o número vai na Query String (?number=...)
        const response = await axios.get(`http://localhost:8080/instance/connect/${instanceName}?number=${phoneNumber}`, {
            headers: { 
                'apikey': 'BQYHJGJHJ'
            }
        });

        console.log("Sucesso! Resposta:", JSON.stringify(response.data, null, 2));

    } catch (error) {
        // Se cair aqui, vamos forçar o print do erro real caso venha dentro de response.data
        if (error.response) {
            console.error("Erro da API:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("Erro de rede:", error.message);
        }
    }
}

getPairingCodeCorrect();