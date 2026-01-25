const prisma = require('../Config/Prisma');

// Get my chat room
exports.getMyChatRoom = async (req, res) => {
    try {
        const user = req.user;
        const topicId = 2; // หรือรับจาก query

        const roomConfigs = [];

        // 🏥 โรงพยาบาล ↔ สสจ.
        if (['Unit_service', 'Prov'].includes(user.user_type)) {
            roomConfigs.push({
                topic_id: Number(topicId),
                room_type: 'HOSPITAL_PROVINCE',
                province_code: user.province_code,
                zone_code: user.zone,
                hcode9: user.hcode9
            });
        }

        // 🏛 สสจ. ↔ เขต
        if (['Prov', 'Zone'].includes(user.user_type)) {
            roomConfigs.push({
                topic_id: Number(topicId),
                room_type: 'PROVINCE_REGION',
                province_code: user.province_code,
                zone_code: user.zone,
                hcode9: user.hcode9
            });
        }

        const rooms = [];

        for (const config of roomConfigs) {

            // ✅ findUnique ใช้เฉพาะ composite key
            let room = await prisma.chatRoom.findUnique({
                where: {
                    topic_id_room_type_province_code_zone_code: {
                        topic_id: config.topic_id,
                        room_type: config.room_type,
                        province_code: config.province_code,
                        zone_code: config.zone_code
                    }
                },
                include: {
                    members: true
                }
            });

            // ❌ ไม่มี room → สร้างใหม่
            if (!room) {
                room = await prisma.chatRoom.create({
                    data: {
                        topic_id: config.topic_id,
                        room_type: config.room_type,
                        hcode9: config.hcode9,
                        province_code: config.province_code,
                        zone_code: config.zone_code,
                        members: {
                            create: {
                                user_id: user.id,
                                hcode9: user.hcode9
                            }
                        }
                    },
                    include: {
                        members: true
                    }
                });
            }
            // ✅ มี room แต่ user ยังไม่ join
            else {
                const isMember = room.members.some(
                    m => m.user_id === user.id
                );

                if (!isMember) {
                    await prisma.chatRoomMember.create({
                        data: {
                            room_id: room.id,
                            user_id: user.id,
                            hcode9: user.hcode9
                        }
                    });
                }
            }

            rooms.push(room);
        }

        return res.status(200).json(rooms);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


// Get message
exports.getMessages = async (req, res) => {
    try {
        // Code
        const { roomId } = req.params;

        const messages = await prisma.chatMessage.findMany({
            where: {
                room_id: Number(roomId),
                isDeleted: false
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name_th: true,
                        user_type: true
                    }
                },
                reads: true
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        if (messages) return res.status(200).json(messages);

    } catch (err) {
        console.log(err);
        res.status().json({ message: 'Internal server error!!' })
    }
}

// Send message
exports.sendMessages = async (req, res) => {
    try {
        // Code
        const { room_id, content, sender_id, hcode9 } = req.body;

        console.log(req.body)

        const msg = await prisma.chatMessage.create({
            data: {
                room_id: Number(room_id),
                hcode9: hcode9,
                sender_id: Number(sender_id),
                content: content
            }
        });

        if (msg) return res.status(200).json(msg);

    } catch (err) {
        console.log(err);
        res.status().json({ message: 'Internal server error!!' });
    }
}