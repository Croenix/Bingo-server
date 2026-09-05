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
async function start(){if(!process.env.MONGODB_URI)throw new Error('MONGODB_URI is missing in .env');if(!process.env.JWT_SECRET)throw new Error('JWT_SECRET is missing in .env');await mongoose.connect(process.env.MONGODB_URI);console.log('MongoDB connected');app.listen(PORT,()=>console.log(`Bingo User Server running on http://localhost:${PORT}`));}
start().catch(e=>{console.error('Server startup failed:',e.message);process.exit(1);});
