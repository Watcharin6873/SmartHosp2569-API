const prisma = require('../Config/Prisma');

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

exports.saveRegister = async (req, res) => {
    try {
        //Code
        const {
            email,
            title_th,
            name_th,
            position_id,
            position,
            hcode,
            hcode9,
            hname_th,
            district,
            province,
            zone,
            user_type
        } = req.body;

        const findExists = await prisma.users.findFirst({
            where: {
                email: email,
                title_th: title_th,
                name_th: name_th,
                position_id: position_id,
                hcode: hcode,
                hcode9: hcode9,
                user_type: user_type
            }
        })

        if (findExists) {
            return res.status(401).json({
                message: `มี Account ของคุณ${name_th} ในประเภท${returnUserType(user_type)}แล้ว!`
            })
        } else {
            const save = await prisma.users.create({
                data: {
                    email: email,
                    title_th: title_th,
                    name_th: name_th,
                    position_id: position_id,
                    position: position,
                    hcode: hcode,
                    hcode9: hcode9,
                    hname_th: hname_th,
                    district: district,
                    province: province,
                    zone: zone,
                    user_type: user_type
                }
            })

            if (save) {
                const findUser = await prisma.users.findFirst({
                    where: {
                        email: email,
                        name_th: name_th,
                        position_id: position_id,
                        hcode9: hcode9,
                        zone: zone,
                        user_type: user_type
                    }
                })

                if (findUser) {
                    await prisma.logEvent.create({
                        data: {
                            event_rec_id: parseInt(findUser.id),
                            table_name: 'Users',
                            eventType: 'register',
                            description: 'ลงทะเบียนเข้าใช้งาน',
                            detail:`${name_th} ลงทะเบียนเข้าใช้งานของ${hname_th} [${hcode9}] เป็น ${returnUserType(user_type)}`,
                            user_id: parseInt(findUser.id)
                        }
                    });
                }
                // ส่ง response หลังทำทุกอย่างเสร็จ
                return res.status(200).json({
                    message: `บันทึกข้อมูลของคุณ${name_th} เป็น${returnUserType(user_type)}เรียบร้อยแล้ว!`
                });
            }
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Internal server error!'
        })
    }
}

// Get list of users
exports.getListUsers = async (req, res) => {
    try {
        //Code
        const users = await prisma.users.findMany();
        res.status(200).json(users);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Internal server error!'
        })
    }
}

// Change user type
exports.changeUserType = async (req, res) => {
    try {
        //Code
        const { id, user_type } = req.body;
        const updateUser = await prisma.users.update({
            where: { id: parseInt(id) },
            data: { user_type: user_type }
        });

        if (updateUser) {   
            await prisma.logEvent.create({
                data: {
                    event_rec_id: parseInt(updateUser.id),
                    table_name: 'Users',
                    eventType: 'update',
                    description: 'เปลี่ยนประเภทผู้ใช้งาน',
                    detail:`เปลี่ยนประเภทผู้ใช้งานเป็น ${returnUserType(user_type)}`,
                    user_id: parseInt(updateUser.id)
                }
            });
            res.status(200).json({
                message: `เปลี่ยนประเภทผู้ใช้งานเป็น ${returnUserType(user_type)} เรียบร้อยแล้ว!`
            });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Internal server error!'
        })
    }
}

// Change role
exports.changeUserRole = async (req, res) => {
    try {
        //Code
        const { id, role } = req.body;
        const updateUser = await prisma.users.update({
            where: { id: parseInt(id) },
            data: { role: role }
        });

        if (updateUser) {   
            await prisma.logEvent.create({
                data: {
                    event_rec_id: parseInt(updateUser.id),
                    table_name: 'Users',
                    eventType: 'update',
                    description: 'เปลี่ยนบทบาทผู้ใช้งาน',
                    detail:`เปลี่ยนบทบาทผู้ใช้งานเป็น ${role}`,
                    user_id: parseInt(updateUser.id)
                }
            });
            res.status(200).json({
                message: `เปลี่ยนบทบาทผู้ใช้งานเป็น ${role} เรียบร้อยแล้ว!`
            });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Internal server error!'
        })
    }
}

// Change status
exports.changeUserStatus = async (req, res) => {
    try {
        //Code
        const { id, enabled } = req.body;
        const updateUser = await prisma.users.update({
            where: { id: parseInt(id) },
            data: { enabled: enabled }
        })

        if (updateUser) {   
            await prisma.logEvent.create({
                data: {
                    event_rec_id: parseInt(updateUser.id),
                    table_name: 'Users',
                    eventType: 'update',
                    description: 'เปลี่ยนสถานะผู้ใช้งาน',
                    detail:`เปลี่ยนสถานะผู้ใช้งานเป็น ${enabled}`,
                    user_id: parseInt(updateUser.id)
                }
            });
            res.status(200).json({
                message: `เปลี่ยนสถานะผู้ใช้งานเป็น ${enabled ? 'เปิดใช้งาน' : 'ปิดใช้งาน'} เรียบร้อยแล้ว!`
            });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Internal server error!'
        })
    }
}

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        //Code
        const { userId } = req.body;
        const deleteUser = await prisma.users.delete({
            where: { id: parseInt(userId) }
        });

        if (deleteUser) {   
            await prisma.logEvent.create({
                data: {
                    event_rec_id: parseInt(deleteUser.id),
                    table_name: 'Users',
                    eventType: 'delete',
                    description: 'ลบผู้ใช้งาน',
                    detail:`ลบผู้ใช้งาน ${deleteUser.name_th} ออกจากระบบ`,
                    user_id: parseInt(deleteUser.id)
                }
            });
            res.status(200).json({
                message: `ลบผู้ใช้งาน ${deleteUser.name_th} เรียบร้อยแล้ว!`
            });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Internal server error!'
        })
    }
}