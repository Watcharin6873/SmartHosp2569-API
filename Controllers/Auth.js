const prisma = require('../Config/Prisma');
const axios = require('axios');
const btoa = require('btoa');
const jwt = require('jsonwebtoken');

const clientId = process.env.CLIENT_ID;
const secretKey = process.env.SECRET_KEY;

const returnUserType = (user_type) => {
    switch (user_type) {
        case 'Unit_service':
            return 'ผู้ประเมินหน่วยบริการ'
        case 'Prov':
            return 'ผู้อนุมัติระดับจังหวัด'
        case 'Zone':
            return 'ผู้อนุมัติระดับเขตฯ'
        case 'Centre':
            return 'Admin ส่วนกลาง'
        default:
            return '-'
    }
}

// Exchange-token
exports.exchangeToken = async (req, res) => {
    try {
        // Code
        const { code, env } = req.body;

        console.log('Code: ', code)

        let redirectUri = "";

        switch (env) {
            case "production":
                // production
                redirectUri = process.env.REDIRECT_URL_PROD;
                break;

            default:
                // development
                redirectUri = process.env.REDIRECT_URL_DEV;
                break;
        }

        console.log('Client ID: ', clientId)
        console.log("ENV FROM FE =", env);
        console.log("REDIRECT =", redirectUri);

        const token_url = 'https://provider.id.th/v1/oauth2/token';
        const values = {
            grant_type: "authorization_code",
            code: code,
            redirect_uri: redirectUri
        }

        // 1. ขอ Access Token
        const tokenRes = await axios.post(token_url, values,
            {
                headers: {
                    Authorization: "Basic " + btoa(`${clientId}:${secretKey}`),
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }
        );

        const { access_token, refresh_token } = tokenRes.data.data;

        // 2. ดึงข้อมูล Profile
        const profile_url = 'https://provider.id.th/api/v1/services/profile';
        const profileRes = await axios.get(profile_url, {
            params: {
                moph_center_token: "1",
                moph_idp_permission: "1",
                position_type: "1"
            },
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + access_token,
                "client-id": clientId,
                "secret-key": secretKey
            }
        });

        const profile = profileRes.data.data;

        res.json({ profile, access_token, refresh_token })



    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Server error!"
        })
    }
}

// Check status user
exports.checkStatusAccount = async (req, res) => {
    try {
        //Code
        const {
            email,
            hcode,
            hcode9,
            hname_th,
            name_th,
            position,
            position_id,
            title_th
        } = req.body;

        const search = await prisma.users.findMany({
            where: {
                email: email,
                hcode: hcode,
                hcode9: hcode9,
                hname_th: hname_th,
                name_th: name_th,
                position: position,
                position_id: position_id,
                title_th: title_th
            }
        })
        res.status(200).json(search);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Server error!"
        })
    }
}

//Login system
exports.loginSmartHosp = async (req, res) => {
    try {
        //Code
        const {
            email,
            hcode,
            hcode9,
            hname_th,
            name_th,
            position,
            position_id,
            title_th,
            user_type,
            role
        } = req.body;

        const user = await prisma.users.findFirst({
            where: {
                email: email,
                hcode: hcode,
                hcode9: hcode9,
                hname_th: hname_th,
                name_th: name_th,
                position: position,
                position_id: position_id,
                title_th: title_th,
                user_type: user_type,
                role: role
            },
            include: {
                hospitals: true
            }
        })

        if (user) {
            const payload = {
                user: {
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
                    province_code: user.hospitals.province_code,
                    province: user.province,
                    zone: user.zone,
                    role: user.role,
                    user_type: user.user_type
                }
            }

            await prisma.logEvent.create({
                data: {
                    event_rec_id: parseInt(user.id),
                    table_name: 'Users',
                    eventType: 'signin',
                    description: 'ล็อกอินเข้าใช้งาน',
                    detail: `${name_th} Sign in ในสิทธิ "${returnUserType(user.user_type)}" ของ${hname_th} [${hcode9}]`,
                    user_id: parseInt(user.id)
                }
            });

            jwt.sign(payload, process.env.SECRET, { expiresIn: '24h' }, (err, token) => {
                if (err) {
                    return res.status(500).json({ message: 'Server Error' })
                }
                res.json({ payload, token })
            })


        }

    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Server error!"
        })
    }
}

// Current user
exports.currentUser = async (req, res) => {
    try {
        // Code
        const {
            email, 
            hcode9, 
            user_type,
            role
        } = req.user;

        const user = await prisma.users.findFirst({
            where: {
                email: email, 
                hcode9: hcode9, 
                user_type: user_type,
                role: role
            },
            select: {
                email: true,
                name_th: true,
                hcode: true,
                hcode9: true,
                hname_th: true,
                position_id: true,
                position: true,
                user_type: true,
                role: true
            }
        })

        res.json({ user })
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Server error!"
        })
    }
}

// Verify token
exports.verifyToken = (req, res) => {
    try {
        // Code
        // ส่ง payload กลับไป frontend
        // frontend สามารถเอา token + payload ไปวางใน jwt.io
        res.json({
            message: "Token verified ✅",
            tokenPayload: req.user,
            token: req.headers.authorization.split(" ")[1],
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Server error!"
        })
    }
}

exports.signout = async (req, res) => {
    try {
        // Code
        const {
            id,
            name_th,
            hcode9,
            hname_th,
            user_type
        } = req.body;

        const s = await prisma.logEvent.create({
            data: {
                event_rec_id: parseInt(id),
                table_name: 'Users',
                eventType: 'signout',
                description: 'ออกจากระบบ',
                detail: `${name_th} Sign out ในสิทธิ "${returnUserType(user_type)}" ของ${hname_th} [${hcode9}]`,
                user_id: parseInt(id)
            }
        })

        res.status(200).json({ message: `Sigout success!` })
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Server error!"
        })
    }
}