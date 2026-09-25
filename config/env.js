import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  sheetsId: process.env.SHEETS_ID,
  googleEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  whatsapp: {
    apiUrl: process.env.WHATSAPP_API_URL || 'http://localhost:8080',
    instanceName: process.env.WHATSAPP_INSTANCE_NAME || 'bot-motoristas',
    token: process.env.WHATSAPP_TOKEN,
    numero1: process.env.WHATSAPP_NUMERO_1,
    numero2: process.env.WHATSAPP_NUMERO_2,
  }
};