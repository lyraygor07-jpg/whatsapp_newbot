import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, Browsers } from '@whiskeysockets/baileys';
import pino from 'pino';
import qrcode from 'qrcode-terminal';
import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const KEY_FILE_PATH = path.join(__dirname, 'credentials.json');
const SPREADSHEET_ID = '1Yg7sGg8MAcyYleeHfvuX4MSC4X0jTLVLyio8cfVh_DM'; // ID da sua planilha
const RANGE = 'Motoristas!A1:Z100';

// Função para buscar, comparar com a data atual do sistema e processar os dados
async function gerarRelatorioPlanilha() {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: KEY_FILE_PATH,
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });

        const sheets = google.sheets({ version: 'v4', auth });
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: RANGE,
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            return "📅 *Relatório de Pagamentos*\n\n⚠️ *Não há previsão de pagamento para o período.*";
        }

        // Pega a data atual do sistema formatada como DD/MM/AAAA (ex: "24/09/2026")
        const hoje = new Date();
        const dia = String(hoje.getDate()).padStart(2, '0');
        const mes = String(hoje.getMonth() + 1).padStart(2, '0');
        const ano = hoje.getFullYear();
        const dataSistema = `${dia}/${mes}/${ano}`;

        let dadosFormatados = [];

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length === 0 || row[0] === 'PrevisaoChegada' || row[0] === 'prev. chegada') {
                continue;
            }

            const previsaoPlanilha = (row[0] || '').trim();

            // Compara a data da planilha com a data dinâmica do sistema
            if (previsaoPlanilha !== dataSistema) {
                continue; 
            }

            const item = {
                previsaoChegada: previsaoPlanilha,
                nomeMotorista: row[1] || '',
                pix: row[2] || '',
                origem: row[3] || '',
                coletar: row[4] || '',
                medida: row[5] || '',
                preco: row[6] || '',
                statusColeta: row[7] || '',
                cliente: row[8] || ''
            };

            dadosFormatados.push(item);
        }

        // Se não houver itens para a data de hoje, retorna a mensagem com bom visual
        if (dadosFormatados.length === 0) {
            return `📅 *Relatório de Pagamentos (${dataSistema})*\n\n` +
                   `───────────────────────────\n` +
                   `⚠️ *Não há previsão de pagamento para o período.*`;
        }

        let mensagemFinal = `📋 *Resumo de Motoristas - ${dataSistema}*\n\n`;

        dadosFormatados.forEach((d, index) => {
            mensagemFinal += `🔹 *Item ${index + 1}*\n`;
            mensagemFinal += `🗓️ *Previsão:* ${d.previsaoChegada}\n`;
            mensagemFinal += `🚚 *Motorista:* ${d.nomeMotorista}\n`;
            mensagemFinal += `🔑 *PIX:* ${d.pix}\n`;
            mensagemFinal += `📍 *Origem:* ${d.origem}\n`;
            mensagemFinal += `📦 *Coleta:* ${d.coletar} (${d.medida})\n`;
            mensagemFinal += `💰 *Preço:* R$ ${d.preco}\n`;
            mensagemFinal += `👤 *Cliente:* ${d.cliente}\n`;
            mensagemFinal += `───────────────────────────\n`;
        });

        return mensagemFinal;

    } catch (error) {
        console.error('Erro ao processar planilha:', error.message);
        return '❌ *Ocorreu um erro ao ler os dados da planilha.*';
    }
}

// Inicialização do Bot Baileys Estabilizada
async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`Usando versão do WA Web v${version.join('.')}, é a mais recente: ${isLatest}`);

    const sock = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: 'silent' }),
        browser: Browsers.macOS('Desktop'),
        syncFullHistory: false
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('Escaneie o QR Code abaixo com o seu WhatsApp:');
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            console.log(`Conexão fechada devido a ${lastDisconnect?.error}, reconectando...`, shouldReconnect);
            
            if (shouldReconnect) {
                setTimeout(() => startBot(), 3000);
            }
        } else if (connection === 'open') {
            console.log('🟢 Bot conectado com sucesso ao WhatsApp e estável!');
        }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message) return;

        const sender = m.key.remoteJid;
        const messageContent = m.message.conversation || 
                               m.message.extendedTextMessage?.text || 
                               m.message.imageMessage?.caption;

        if (!messageContent) return;

        const textoRecebido = messageContent.trim().toLowerCase();
        console.log(`Mensagem recebida de ${sender}: ${textoRecebido}`);

        if (textoRecebido === 'relatorio') {
            // Lista com os números e IDs autorizados a pedir e receber o relatório
            const numerosPermitidos = [
                '5567993197336', // O seu número tradicional
                '52940521926688', // O seu ID LID atual do WhatsApp
                '5511950630670', // 2º número autorizado
                '5511965802118'  // 3º número autorizado
            ];

            // Extrai apenas os números (dígitos) do remetente
            const senderLimpo = sender.replace(/\D/g, '');

            // Verifica se os números permitidos contêm os dígitos do remetente ou o ID exato
            const autorizado = numerosPermitidos.some(numPermitido => {
                const permitidoLimpo = numPermitido.replace(/\D/g, '');
                return senderLimpo.includes(permitidoLimpo) || sender.includes(numPermitido);
            });

            if (!autorizado) {
                console.log(`Acesso negado para o sender: ${sender} (Limpo: ${senderLimpo})`);
                await sock.sendMessage(sender, { text: '❌ Você não tem permissão para solicitar este relatório.' });
                return;
            }

            await sock.sendMessage(sender, { text: '⏳ A ler a planilha e a montar o relatório...' });
            const relatorioFormatado = await gerarRelatorioPlanilha();
            await sock.sendMessage(sender, { text: relatorioFormatado });
        } 
        else if (textoRecebido === 'ping') {
            await sock.sendMessage(sender, { text: 'Pong! 🤖 Baileys funcionando perfeitamente.' });
        }
    });
}

startBot();