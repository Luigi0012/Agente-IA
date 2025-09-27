import fs from 'fs';

// Caminho do arquivo atual
const oldPath = './frontend/src/pages/capilot.html';

// Novo nome do arquivo
const newPath = './frontend/src/pages/Github.html';

// Renomear o arquivo
fs.rename(oldPath, newPath, (err) => {
  if (err) {
    console.error('Erro ao renomear o arquivo:', err);
  } else {
    console.log(`Arquivo renomeado de "capilot.html" para "Github.html" com sucesso!`);
  }
});