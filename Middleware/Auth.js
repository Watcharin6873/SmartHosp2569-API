const prisma = require('../Config/Prisma');
const jwt = require('jsonwebtoken');

// Auth check
exports.authCheck = async (req, res, next) => {
    try {   
        const headerToken = req.headers.authorization;

        if (!headerToken) {
            return res.status(401).json({ message: "No token, Authorization" });
        }

        const token = headerToken.split(" ")[1];

        const decode = jwt.verify(token, process.env.SECRET);   

        const user = await prisma.users.findFirst({
            where: {
                email: decode.user.email,
                hcode: decode.user.hcode,
                hcode9: decode.user.hcode9,
                user_type: decode.user.user_type,
                role: decode.user.role
            },
            include: {
                hospitals: true
            }
        });

        if (!user) {
            return res.status(401).json({ message: "ไม่พบบัญชีผู้ใช้ในระบบ" });
        }

        if (user.enabled !== true) {
            return res.status(403).json({
                message: "Account นี้ยังไม่ได้รับการอนุมัติ!"
            });
        }

        req.user = {
            id: user.id,
            email: user.email,
            title_th: user.title_th,
            name_th: user.name_th,
            position_id: user.position_id,
            position: user.position,
            hcode: user.hcode,
            hcode9: user.hcode9,
            hname_th: user.hname_th,
            district: user.district,
            province_code: user.hospitals?.province_code,
            province: user.province,
            zone: user.zone,
            user_type: user.user_type,
            role: user.role,
            enabled: user.enabled,
            cratedAt: user.cratedAt,
            updateAt: user.updateAt
        };
        next(); 
    } catch (err) {
        console.log("AUTH ERROR:", err.message);
        return res.status(401).json({
            message: "Token Invalid หรือหมดอายุ"
        });
    }
};


// Current admin
exports.currentAdmin = async (req, res, next) => {
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

        if (!adminUser || adminUser.role !== "admin") {
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