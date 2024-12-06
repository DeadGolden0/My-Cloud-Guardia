const { Client } = require('ssh2'); // Import du module ssh2
const config = require('../config/sftpConfig');

async function CryptFile(fileName, userPassword, userName, destinationPath) {
  console.log(destinationPath);
    const command = `sudo -S ckms sym encrypt --tag key-${userName}-aes --output-file ${destinationPath}/${fileName} /secure/tmp/${fileName}`;
    await executeRemoteCommand(command, userName, userPassword);
    return true;
}

async function DecryptFile(fileName, userPassword, userName, destinationPath) {
   console.log(destinationPath);
    const command = `sudo -S ckms sym decrypt --tag key-${userName}-aes --output-file /secure/tmp/${fileName} ${destinationPath}/${fileName}`;
    await executeRemoteCommand(command, userName, userPassword);
    return true;
}

async function executeRemoteCommand(command, userName, userPassword) {
    return new Promise((resolve, reject) => {
        const conn = new Client();

        conn
            .on('ready', () => {
                console.log('Connexion SSH réussie');
                conn.exec(command, { pty: true }, (err, stream) => {
                    if (err) {
                        conn.end();
                        return reject(err);
                    }

                    let output = '';
                    let errorOutput = '';

                    stream
                        .on('data', (data) => {
                            console.log('STDOUT:', data.toString());
                            output += data.toString();

                            if (data.toString().includes('[sudo] password for')) {
                                stream.write(`${userPassword}\n`);
                            }
                        })
                        .stderr.on('data', (data) => {
                            console.log('STDERR:', data.toString());
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
                                console.error(`Erreur de la commande : ${errorMessage}`);
                                reject(new Error(errorMessage));
                            }
                        });
                });
            })
            .on('error', (err) => {
                console.error('Erreur de connexion SSH :', err.message);
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
