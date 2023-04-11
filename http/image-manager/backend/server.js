import express from "express";
import cors from "cors";
import multer from "multer";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import * as crypto from "crypto";

const app = express();
const upload = multer();
const port = process.env.PORT || 3000;
const host = process.env.HOST || `http://localhost:${port}`; // для деплоя бэкенда в облачный сервис необходимо изменить хост

app.use("/download", express.static(path.join(path.resolve(), "uploads")));
app.use(cors());
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

let files = [];

app.get("/files", async (request, response) => {
  response
    .status(200)
    .send(JSON.stringify({ files }))
    .end();
});
app.get("/files/:id", async (request, response) => {
  const { id } = request.params;
  const file = files.find((file) => file.id === id);
  if (!file) {
    return response
      .status(404)
      .send(JSON.stringify({ message: "File not found" }))
      .end();
  }
  response
    .status(200)
    .send(JSON.stringify({ file }))
    .end();
});
app.post("/files", upload.single("file"), async (request, response) => {
  try {
    const file = request.file;
    const fileName = `${Date.now().toString(36)}-${file.originalname}`;
    const fileSavePath = path.join(path.resolve(), "uploads", fileName);
    await writeFile(fileSavePath, file.buffer);
    const fileDocument = {
      id: crypto.randomUUID(),
      filename: fileName,
      path: `${host}/download/${fileName}`,
    };
    files.push(fileDocument);
    response
      .status(201)
      .send(JSON.stringify({ file: fileDocument }))
      .end();
  } catch (error) {
    console.error(error);
    response
      .status(500)
      .send({ message: error.message });
  }
});
app.delete("/files/:id", async (request, response) => {
  try {
    const { id } = request.params;
    const file = files.find((file) => file.id === id);
    console.log(file);

    if (!file) {
      return response
        .status(404)
        .send(JSON.stringify({ message: "File not found" }))
        .end();
    }
    files = files.filter((file) => file.id !== id);
    const filePath = path.join(path.resolve(), "uploads", file.filename);
    await unlink(filePath);
    response.status(204).end();
  } catch (error) {
    console.error(error);
    response
      .status(500)
      .send({ message: error.message });
  }
});

const bootstrap = async () => {
  try {
    app.listen(port, () => console.log(`Server has been started on ${host}`));
  } catch (error) {
    console.error(error);
  }
};

bootstrap();
