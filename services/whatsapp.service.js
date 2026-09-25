import axios from 'axios';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

export const whatsappService = {
  async sendMessage(number, text) {
    try {
      const url = `${config.whatsapp.apiUrl}/message/sendText/${config.whatsapp.instanceName}`;
      
      const payload = {
        number: number,
        textMessage: {
          text: text
        }
      };

      const headers = {
        'Content-Type': 'application/json',
        'apikey': config.whatsapp.token
      };

      logger.info(`A enviar mensagem para o número ${number}...`);
      
      const response = await axios.post(url, payload, { headers });
      
      logger.success(`Mensagem enviada com sucesso para ${number}!`);
      return response.data;
    } catch (error) {
      logger.error(`Erro ao enviar mensagem para ${number}: ${error.response?.data?.message || error.message}`);
      throw error;
    }
  }
};