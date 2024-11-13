import {Router} from 'express'
import {cancelPayment, captureOrder, createOrder} from '../controllers/payment.controller.js'
const router = Router();

router.post('/create-order',createOrder ); //poner post cuando se le asigne a un boton
router.get('/capture-order', captureOrder);
router.get('/cancel-order' ,cancelPayment );
export default router;
