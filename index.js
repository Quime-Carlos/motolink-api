const admin = require("firebase-admin");
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const app = express();

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(require("./serviceAccountKey.json")),
  storageBucket: "gs://moto-max-woekle.firebasestorage.app" // bucket correto
});

const bucket = admin.storage().bucket();

// Configuração do multer para upload em memória
const upload = multer({ storage: multer.memoryStorage() });

// Permitir requisições CORS
app.use(cors());

// Endpoint para upload de fotos (apenas file)
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    console.log("Recebido arquivo:", req.file);

    if (!req.file) {
      return res.status(400).json({ error: "Arquivo é obrigatório" });
    }

    // Gerar nome único do arquivo
    const fileName = `FotosDosTaxistas/${uuidv4()}.png`;
    const file = bucket.file(fileName);

    // Salvar arquivo no Storage
    await file.save(req.file.buffer, { contentType: req.file.mimetype });
    console.log("Arquivo salvo com sucesso:", fileName);

    // Tornar o arquivo público
    await file.makePublic();

    // URL pública
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    console.log("URL pública gerada:", publicUrl);

    // Retornar URL para o app
    res.json({ url: publicUrl });
  } catch (err) {
    console.error("Erro no upload:", err);
    res.status(500).json({ error: err.message });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
