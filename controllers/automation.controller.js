import { whatsappService } from '../services/whatsapp.service.js';
import { config } from '../config/env.js';

export const testAutomation = async (req, res) => {
  try {
    // Pega o primeiro número configurado no .env para o teste
    const numeroDestino = config.whatsapp.numero1;
    
    if (!numeroDestino) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Nenhum número de WhatsApp configurado na variável WHATSAPP_NUMERO_1 do .env' 
      });
    }

    const mensagemTeste = 'Olá! Esta é uma mensagem de teste automatizada enviada pelo nosso novo backend MVC com Evolution API.';

    await whatsappService.sendMessage(numeroDestino, mensagemTeste);

    res.json({ 
      status: 'success', 
      message: `Mensagem de teste disparada com sucesso para ${numeroDestino}!` 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Falha ao disparar mensagem via WhatsApp',
      error: error.message 
    });
  }
};