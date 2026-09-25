import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const KEY_FILE_PATH = path.join(__dirname, 'credentials.json');
const SPREADSHEET_ID = '1Yg7sGg8MAcyYleeHfvuX4MSC4X0jTLVLyio8cfVh_DM'; // Coloque o seu ID aqui
const RANGE = 'Motoristas!A1:Z100';

async function gerarJsonEfetivo() {
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
        if (!rows || rows.length === 0) return;

        let dadosFormatados = [];

        // Ignoramos o cabeçalho (linha 0) e filtramos linhas vazias ou novos cabeçalhos repetidos
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            
            // Se a linha estiver vazia ou for um cabeçalho repetido, ignoramos
            if (!row || row.length === 0 || row[0] === 'PrevisaoChegada' || row[0] === 'prev. chegada') {
                continue;
            }

            // Mapeando os dados para um objeto JSON limpo
            const item = {
                previsaoChegada: row[0] || '',
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

        console.log("JSON Gerado com sucesso:");
        console.log(JSON.stringify(dadosFormatados, null, 2));

        // Aqui é onde vamos montar o texto formatado para enviar para o seu número
        let mensagemFinal = "📋 *Resumo dos Motoristas - Planilha*\n\n";

        dadosFormatados.forEach((d, index) => {
            mensagemFinal += `*Item ${index + 1}*\n`;
            mensagemFinal += `🗓️ Previsão: ${d.previsaoChegada}\n`;
            mensagemFinal += `🚚 Motorista: ${d.nomeMotorista}\n`;
            mensagemFinal += `🔑 PIX: ${d.pix}\n`;
            mensagemFinal += `📍 Origem: ${d.origem}\n`;
            mensagemFinal += `📦 Coletar: ${d.coletar} (${d.medida})\n`;
            mensagemFinal += `💰 Preço: R$ ${d.preco}\n`;
            mensagemFinal += `👤 Cliente: ${d.cliente}\n`;
            mensagemFinal += `-----------------------------------\n`;
        });

        console.log("\nMensagem formatada que será enviada para você:");
        console.log(mensagemFinal);

        return mensagemFinal;

    } catch (error) {
        console.error('Erro ao processar planilha:', error.message);
    }
}

gerarJsonEfetivo();