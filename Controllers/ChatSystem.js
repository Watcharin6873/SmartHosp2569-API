const prisma = require('../Config/Prisma');

// Get my chat room
exports.getMyChatRoom = async (req, res) => {
    try {
        const user = req.user;
        const topicId = 2; // หรือรับจาก req.query

        const rooms = [];

        // =========================================================
        // 1️⃣ โรงพยาบาล (Hospital ↔ Province)
        // =========================================================
        if (user.user_type === 'Unit_service') {

            const room = await prisma.chatRoom.upsert({
                where: {
                    topic_id_room_type_hcode9_province_code_zone_code: {
                        topic_id: topicId,
                        room_type: 'HOSPITAL_PROVINCE',
                        hcode9: user.hcode9,
                        province_code: user.province_code,
                        zone_code: user.zone
                    }
                },
                update: {},
                create: {
                    topic_id: topicId,
                    room_type: 'HOSPITAL_PROVINCE',
                    hcode9: user.hcode9,
                    province_code: user.province_code,
                    zone_code: user.zone,
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

            rooms.push(room);
        }

        // =========================================================
        // 2️⃣ สสจ (เห็นหลาย รพ + แชทกับเขต)
        // =========================================================
        if (user.user_type === 'Prov') {

            // ---------- 2.1 ห้อง รพ ↔ สสจ ----------
            const hospitalRooms = await prisma.chatRoom.findMany({
                where: {
                    topic_id: topicId,
                    room_type: 'HOSPITAL_PROVINCE',
                    province_code: user.province_code
                },
                include: {
                    members: true
                }
            });

            for (const room of hospitalRooms) {
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

                rooms.push(room);
            }

            // ---------- 2.2 ห้อง สสจ ↔ เขต ----------
            const provinceRegionRoom = await prisma.chatRoom.upsert({
                where: {
                    topic_id_room_type_hcode9_province_code_zone_code: {
                        topic_id: topicId,
                        room_type: 'PROVINCE_REGION',
                        hcode9: user.hcode9,
                        province_code: user.province_code,
                        zone_code: user.zone
                    }
                },
                update: {},
                create: {
                    topic_id: topicId,
                    room_type: 'PROVINCE_REGION',
                    hcode9: user.hcode9,
                    province_code: user.province_code,
                    zone_code: user.zone,
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

            rooms.push(provinceRegionRoom);
        }

        // =========================================================
        // 3️⃣ เขต (เห็นหลายจังหวัด)
        // =========================================================
        if (user.user_type === 'Zone') {

            const zoneRooms = await prisma.chatRoom.findMany({
                where: {
                    topic_id: topicId,
                    room_type: 'PROVINCE_REGION',
                    zone_code: user.zone
                },
                include: {
                    members: true
                }
            });

            for (const room of zoneRooms) {
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

                rooms.push(room);
            }
        }

        // =========================================================
        // 4️⃣ เติมชื่อ รพ / จังหวัด / เขต (join hospital table)
        // =========================================================
        const hcodes = [
            ...new Set(
                rooms.map(r => r.hcode9).filter(Boolean)
            )
        ];

        const hospitals = await prisma.hospitals.findMany({
            where: {
                hcode9: { in: hcodes }
            }
        });

        const hospitalMap = Object.fromEntries(
            hospitals.map(h => [h.hcode9, h])
        );

        const result = rooms.map(room => {
            const hospital = hospitalMap[room.hcode9] || {};
            return {
                ...room,
                hname_th: hospital.hname_th || null,
                province: hospital.province || null,
                zone_name: hospital.zone_name || null
            };
        });

        return res.status(200).json(result);

    } catch (err) {
        console.error('getMyChatRoom error:', err);
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