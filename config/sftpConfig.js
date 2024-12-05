require('dotenv').config();

const sftpConfig = {
  host: process.env.SFTP_HOST,
  port: parseInt(process.env.SFTP_PORT, 10),
  username: process.env.SFTP_USER,
  password: process.env.SFTP_PASSWORD,
};

module.exports = sftpConfig;