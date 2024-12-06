## 🌐 Guardia Projet3

Guardia Projet3 is a system for securely managing files, including encryption and decryption operations, designed to enhance data confidentiality and integrity. The project uses a combination of SSH, Docker, and a secure backend for seamless file handling.

## 📋 Prerequisites

- VPS or dedicated Server
- Node.js (version 20 or later)
- Docker installed on your system
- Basic knowledge of Linux and SSH

## ⚙️ Installation

1. Clone the repository:

```bash
git clone https://github.com/your-repo/guardia-projet3.git
cd guardia-projet3
```

2. Install dependencies:

```bash
npm install
```

3. Build the Docker image:

```bash
docker build -t guardia-projet3 .
```

4. Run the container:

```bash
docker run -d -p 5000:5000 --name guardia guardia-projet3
```

## 📋 Configuration

1. Set up environment variables:
Create a .env file in the root directory:

```bash
env
Copier le code
SFTP_HOST=example.com
SFTP_PORT=22
SSH_USER=your-username
SSH_PASSWORD=your-password
```

2. Update Docker Compose (Optional):
If using docker-compose, update the docker-compose.yml file to include your .env file:

```bash
yaml
Copier le code
env_file:
  - .env
```

3. Run the application:

```bash
docker-compose up -d
```

## 🖥️ Usage

1. Access the application via your browser at http://<your-server-ip>:5000.
2. Use the dashboard to:

- Upload files
- Encrypt files
- Decrypt files
- Download securely managed files

3. API Endpoints:

- /create-file: Create and encrypt files
- /download-file: Decrypt and download files
- /import-files: Upload and encrypt files

Refer to the API documentation for more details.
 
## 🤝 Contributing

Your contributions make the open source community a fantastic place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under a Restrictive License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

> [!IMPORTANT]
> This project is intended for educational purposes only. The use of this code for any other purpose is not authorized. 
> Please ensure that you comply with all applicable laws and regulations when using this project.

## ✉️ Contact

For any questions or suggestions, please feel free to contact me:

[![Discord](https://img.shields.io/badge/Discord-%235865F2.svg?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/w92W7XR9Yg)
[![Gmail](https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:deadgolden9122@gmail.com)
[![Steam](https://img.shields.io/badge/steam-%23000000.svg?style=for-the-badge&logo=steam&logoColor=white)](https://steamcommunity.com/id/DeAdGoLdEn/)

## 💖 Support Me

If you find this project helpful and would like to support my work, you can contribute through PayPal. Any support is greatly appreciated and helps me continue developing and maintaining the project.

[![PayPal](https://img.shields.io/badge/PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/DeadGolden0)
