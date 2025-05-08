import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import fileUpload = require('express-fileupload');

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(fileUpload());

const PORT = Number(process.env.PORT) || 3000;
const SECRET = process.env.JWT_SECRET || '';

export { app, PORT, SECRET };