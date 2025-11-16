const admin = require("firebase-admin");
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const app = express();

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
  }),
  storageBucket: "moto-max-woekle.firebasestorage.app"
});

const bucket = admin.storage().bucket();

// Configuração do multer para upload em memória
const upload = multer({ storage: multer.memoryStorage() });

// Permitir requisições CORS
app.use(cors());

// Endpoint para upload de fotos
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Arquivo é obrigatório" });

    const fileName = `FotosDosTaxistas/${uuidv4()}.png`;
    const file = bucket.file(fileName);

    await file.save(req.file.buffer, { contentType: req.file.mimetype });
    await file.makePublic();

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

    res.json({ url: publicUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

