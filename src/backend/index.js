import express from 'express';
import paymentRoutes from './routes/payment.routes.js'
import{PORT} from './config/config.js'
import path from 'path'
const app = express();
app.use(paymentRoutes);

app.use(express.static(path.resolve('src/backend/static')))

app.listen(PORT);

console.log("Server en puerto " , PORT);


