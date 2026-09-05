const jwt=require('jsonwebtoken');
function requireAdmin(req,res,next){const header=req.headers.authorization||'';if(!header.startsWith('Bearer '))return res.status(401).json({error:'Admin authentication required'});try{const payload=jwt.verify(header.slice(7),process.env.JWT_SECRET);if(payload.role!=='admin')return res.status(403).json({error:'Admin access required'});req.admin=payload;next();}catch{return res.status(401).json({error:'Invalid or expired admin token'});}}
module.exports={requireAdmin};
