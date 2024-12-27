import  nodemailer from 'nodemailer';
import configEnv from '../config/configEnv.js';

// create transporter and export 
const transporter =nodemailer.createTransport({
  service:'gmail',
  port:456,
  secure:false,
  auth:{
    user:configEnv.smtp_email,
    pass:configEnv.smtp_password
  }
})

export default transporter;

