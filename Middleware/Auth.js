const prisma = require('../Config/Prisma');
const jwt = require('jsonwebtoken');

// Auth check
exports.authCheck = async (req, res, next) => {
    try {
        // Code
        const headerToken = req.headers.authorization;

        if (!headerToken) {
            return res.status(401).json({
                message: "No token, Authorization"
            });
        }

        const token = headerToken.split(" ")[1];
        const decode = jwt.verify(token, process.env.SECRET);
        req.user = decode;

        const {
            email,
            name_th,
            hcode,
            hcode9,
            user_type,
            role
        } = req.user;

        const user = await prisma.users.findFirst({
            where: {
                email: email,
                name_th: name_th,
                hcode: hcode,
                hcode9: hcode9,
                user_type: user_type,
                role: role
            }
        })

        if(!user.enabled){
            return res.status(400).json({
                message: "Account นี้ยังไม่ได้รับการอนุมัติ!"
            })
        }

        next();

    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: "Token Invalid!"
        })
    }
}

// Current admin
exports.currentAdmin = async (req, res, next) =>{
    try {
        // Code
        const {
            email,
            name_th,
            hcode,
            hcode9,
            user_type,
            role
        } = req.user;

        const adminUser = await prisma.users.findFirst({
            where: {
                email: email,
                name_th: name_th,
                hcode: hcode,
                hcode9: hcode9,
                user_type: user_type,
                role: role
            }
        })

        if(!adminUser || adminUser.role !== "admin"){
            return res.status(403).json({
                message: "Access denied, admin only!"
            })
        }

        next();
        
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: "Error admin access denied. "
        })
    }
}