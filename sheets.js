import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho para as credenciais da Google Cloud
const KEY_FILE_PATH = path.join(__dirname, 'credentials.json');

// ID da sua planilha (pegue o trecho que fica entre /d/ e /edit na URL da planilha)
const SPREADSHEET_ID = '1Yg7sGg8MAcyYleeHfvuX4MSC4X0jTLVLyio8cfVh_DM'; 

// Intervalo/Aba que deseja ler (ex: "Página1!A1:D10" ou apenas o nome da aba "Clientes")
const RANGE = 'Motoristas!A1:Z100'; 

async function lerPlanilha() {
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
            console.log('Nenhum dado encontrado na planilha.');
            return [];
        }

        console.log('Dados encontrados na planilha:');
        rows.forEach((row, index) => {
            console.log(`Linha ${index + 1}:`, row);
        });

        return rows;
    } catch (error) {
        console.error('Erro ao ler a planilha do Google Sheets:', error.message);
    }
}

lerPlanilha();