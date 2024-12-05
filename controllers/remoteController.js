const { Client } = require('ssh2'); // Import du module ssh2
const config = require('../config/sftpConfig');

async function CryptFile(fileName, userPassword, userName) {
    // Commande bash pour déplacer le fichier
    const command = `sshpass -p '${userPassword}' sudo -S ckms sym encrypt --tag key-${userName}-aes --output-file /secure/${userName}/${fileName} /secure/tmp/${fileName}`;

    // Exécution de la commande
    await executeRemoteCommand(command, userName, userPassword);

    return true;
}

async function DecryptFile(fileName, userPassword, userName) {
    // Commande bash pour déplacer le fichier
    const command = `sshpass -p '${userPassword}' sudo -S ckms sym decrypt --tag key-${userName}-aes --output-file /secure/tmp/${fileName} /secure/${userName}/${fileName}`;

    // Exécution de la commande
    await executeRemoteCommand(command, userName, userPassword);

    return true;
}

async function executeRemoteCommand(command, userName, userPassword) {
  return new Promise((resolve, reject) => {
    const conn = new Client();

    conn
        .on('ready', () => {
          console.log('Connexion SSH réussie');
          conn.exec(command, (err, stream) => {
            if (err) {
              conn.end();
              return reject(err);
            }
        
            let output = '';
            stream
              .on('data', (data) => {
                console.log('STDOUT:', data.toString());
                output += data.toString();
              
                // Si `sudo` demande un mot de passe, le fournir
                if (data.toString().includes('[sudo] password for')) {
                  stream.write(`${userPassword}\n`);
                }
              })
              .stderr.on('data', (data) => {
                console.log('STDERR:', data.toString());
                errorOutput += data.toString();
              });
          });
        })
        .connect({
          host: config.host,
          port: config.port,
          username: userName,
          password: userPassword,
        });
    });
}

module.exports = { CryptFile, DecryptFile };