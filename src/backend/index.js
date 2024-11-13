import express from 'express';
import paymentRoutes from './routes/payment.routes.js'
import{PORT} from './config/config.js'
import path from 'path'
import cors from 'cors'
const app = express();

app.use(express.json()),
app.use(cors());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
app.listen(PORT);
app.use(paymentRoutes);
app.use(express.static(path.resolve('src/backend/static')))

console.log("Server en puerto " , PORT);


