require('dotenv').config();
const express=require('express'); const cors=require('cors'); const helmet=require('helmet'); const rateLimit=require('express-rate-limit'); const mongoose=require('mongoose');
const userRoutes=require('./routes/users'); const adminRoutes=require('./routes/admin');
const app=express(); const PORT=Number(process.env.PORT||3000);
app.use(helmet()); app.use(cors({origin:process.env.CORS_ORIGIN||'*'})); app.use(express.json({limit:'100kb'}));
app.use(rateLimit({windowMs:15*60*1000,limit:300,standardHeaders:'draft-8',legacyHeaders:false}));
app.get('/api/health',(req,res)=>res.json({ok:true,service:'bingo-user-server',database:mongoose.connection.readyState===1?'connected':'disconnected'}));
app.use('/api/users',userRoutes); app.use('/api/admin',adminRoutes);
app.use((req,res)=>res.status(404).json({error:'Route not found'}));
app.use((err,req,res,next)=>{console.error(err);res.status(err.status||500).json({error:err.message||'Internal server error'});});
async function getPublicIP() {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    return data.ip;
  } catch (err) {
    return 'Unknown';
  }
}

async function start(){
  if(!process.env.MONGODB_URI) throw new Error('MONGODB_URI is missing in .env');
  if(!process.env.JWT_SECRET) throw new Error('JWT_SECRET is missing in .env');
  
  const publicIP = await getPublicIP();
  console.log(`\n==================================================`);
  console.log(`🌐 Server Public IP Address: ${publicIP}`);
  console.log(`==================================================\n`);

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('\n==================================================');
    console.error('❌ MONGODB CONNECTION FAILED!');
    console.error(`Current Public IP: ${publicIP}`);
    console.error('Please whitelist this IP in MongoDB Atlas Network Access:');
    console.error('👉 https://cloud.mongodb.com -> Network Access -> Add IP Address');
    console.error('==================================================\n');
    throw err;
  }

  app.listen(PORT, () => console.log(`Bingo User Server running on http://localhost:${PORT}`));
}

start().catch(e=>{console.error('Server startup failed:',e.message);process.exit(1);});
