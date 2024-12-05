require('dotenv').config();

const sftpConfig = {
  host: process.env.SFTP_HOST,
  port: parseInt(process.env.SFTP_PORT, 10),
};

module.exports = sftpConfig;