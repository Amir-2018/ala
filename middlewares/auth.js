import jwt from 'jsonwebtoken'

export function checkToken(req, res, next)
{
    let token = req.header["x-access-token"] || req.headers.authorization;
    if (token && token.startsWith("Bearer ")) {
        token = token.slice(7, token.length);
    }
    else{
        return res.status(401).send('Access Rejected')
    }

    try{
        const decodeToken = jwt.verify(token, 'privateKey')
        req.user = decodeToken;
        next()
    }catch(e){
        res.status(400).send('Wrong Token')
    } 
}
