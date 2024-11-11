import { application } from "express";
import {HOST,PAYPAL_API, PAYPAL_API_CLIENT, PAYPAL_API_SECRET} from '../config/config.js'
import axios from 'axios'


export const createOrder = async (req,res)=>{
  try{

     console.log(`${HOST}/capture-order`);
  const order = {
    intent: "CAPTURE",
      purchase_units: [
        {
          "reference_id": "d9f80740-38f0-11e8-b467-0ed5f89f718b",
          amount: {
            currency_code: "USD",
            value: "600.00", // Total a cobrar por todos los productos
            breakdown: {
              item_total: {
                currency_code: "USD",
                value: "600.00" // Suma de todos los valores de productos
              }
            }
          },
          description: "Compra de múltiples productos",
          items: [
            {
              name: "Producto 1",
              unit_amount: {
                currency_code: "USD",
                value: "200.00"
              },
              quantity: "1"
            },
            {
              name: "Producto 2",
              unit_amount: {
                currency_code: "USD",
                value: "150.00"
              },
              quantity: "2"
            },
            {
              name: "Producto 3",
              unit_amount: {
                currency_code: "USD",
                value: "100.00"
              },
              quantity: "1"
            }
          ]
        }
      ],
      application_context: {
        brand_name: "PIXEL FACTORY",
        landing_page: "BILLING",
        shipping_preference: "NO_SHIPPING",
        user_action: "PAY_NOW",
        return_url: `${HOST}/capture-order`,
        cancel_url: `${HOST}/cancel-order`,
      }
    };
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
 const {data:{access_token}} = await axios.post(`${PAYPAL_API}/v1/oauth2/token`,params,{
    auth:{
      username:PAYPAL_API_CLIENT,
      password:PAYPAL_API_SECRET
    }
  }).catch(error => {
    console.error("Error al obtener el token:", error.response ? error.response.data : error.message);
    throw error; // Rethrow the error to handle it in the next block
  });
  const response = await axios.post(`${PAYPAL_API}/v2/checkout/orders`,order, {
    headers: {
      Authorization: `Bearer ${access_token}`,
      'Content-Type':'application/json'
    }
  })


  console.log(response.data);
 return res.json(response.data)
}catch(error) {
  console.log("PayPal Client:", PAYPAL_API_CLIENT);
    console.log("PayPal Secret:", PAYPAL_API_SECRET);
  console.error("Error creating PayPal order:", error);
  res.status(500).json({ error: 'Failed to create order', details: error.message });
  };
}
export const captureOrder = async(req,res)=> {
  try{
    const {token} = req.query
    const response = await axios.post(`${PAYPAL_API}/v2/checkout/orders/${token}/capture`,{},{
      auth:{
        username:PAYPAL_API_CLIENT,
        password:PAYPAL_API_SECRET
      }
    })
    console.log('Orden capturada:', response.data);
    res.json({ message: 'Pago exitoso', orderDetails: response.data });
  }catch (error) {
    console.error('Error al capturar la orden:', error.response ? error.response.data : error.message);
    res.status(500).send('Error al procesar el pago');
  }
}
export const cancelPayment= (req,res)=> res.send('cancelPayment created');

