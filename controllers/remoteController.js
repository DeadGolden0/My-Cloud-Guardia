const { Client } = require('ssh2'); // Import du module ssh2
const config = require('../config/sftpConfig');

async function CryptFile(fileName, userPassword, userName, destinationPath) {
  const command = `sudo -S ckms sym encrypt --tag key-${userName}-aes --output-file ${destinationPath}/${fileName} /secure/tmp/${fileName}`;
  await executeRemoteCommand(command, userName, userPassword);
  return true;
}

async function DecryptFile(fileName, userPassword, userName, destinationPath) {
  const command = `sudo -S ckms sym decrypt --tag key-${userName}-aes --output-file /secure/tmp/${fileName} ${destinationPath}/${fileName}`;
  await executeRemoteCommand(command, userName, userPassword);
  return true;
}

async function executeRemoteCommand(command, userName, userPassword) {
  return new Promise((resolve, reject) => {
      const conn = new Client();

      conn
          .on('ready', () => {
              conn.exec(command, { pty: true }, (err, stream) => {
                  if (err) {
                      conn.end();
                      return reject(err);
                  }

                  let output = '';
                  let errorOutput = '';

                  stream
                      .on('data', (data) => {
                          output += data.toString();

                          // Si `sudo` demande un mot de passe, le fournir
                          if (data.toString().includes('[sudo] password for')) {
                              stream.write(`${userPassword}\n`);
                          }
                      })
                      .stderr.on('data', (data) => {
                          errorOutput += data.toString();
                      })
                      .on('close', (code) => {
                          conn.end();
                          if (code === 0) {
                              // Commande réussie
                              resolve(output.trim());
                          } else {
                              // Échec explicite
                              const errorMessage = errorOutput.trim() || 'Commande échouée sans message d’erreur.';
                              reject(new Error(errorMessage));
                          }
                      });
              });
          })
          .on('error', (err) => {
              reject(err);
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