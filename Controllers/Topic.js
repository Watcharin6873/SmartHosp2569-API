const prisma = require('../Config/Prisma');

// Create topic
exports.createTopic = async (req, res) => {
    try {
        // Code
        const {
            user_id,
            topic_name
        } = req.body;

        const user = await prisma.users.findFirst({
            where: {
                id: parseInt(user_id)
            }
        });

        const saveTopic = await prisma.topic.create({
            data: {
                user_id: parseInt(user_id),
                topic_name: topic_name
            }
        })

        if (saveTopic) {
            const findTopic = await prisma.topic.findFirst({
                where: {
                    user_id: parseInt(user_id),
                    topic_name: topic_name
                }
            })
            if (findTopic) {
                await prisma.logEvent.create({
                    data: {
                        event_rec_id: parseInt(findTopic.id),
                        table_name: 'Topic',
                        eventType: 'create',
                        description: 'เพิ่มข้อมูล',
                        detail: `${user.name_th} (UserID: ${user_id}) เพิ่มชื่อแบบประเมิน "${topic_name}"`,
                        user_id: parseInt(user_id)
                    }
                })
            }
            // ส่ง response หลังทำทุกอย่างเสร็จ
            return res.status(200).json({ message: 'บันทึกหัวข้อแบบประเมินเรียบร้อย!' });
        }

    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: `Server error!`
        })
    }
}

// Get list topic
exports.getListTopic = async (req, res) => {
    try {
        // Code
        const topic = await prisma.topic.findMany();

        res.status(200).json(topic)
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: `Server error!`
        })
    }
}


// Get topic by id
exports.getTopicById = async (req, res) => {
    try {
        // Code
        const { id } = req.params;

        const topic = await prisma.topic.findFirst({
            where: {
                id: parseInt(id)
            }
        });

        if (topic) return res.status(200).json(topic);

    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: `Server error!`
        })
    }
}


// Update topic
exports.updateTopic = async (req, res) => {
    try {
        // Code
        const { id, topic_name, user_id } = req.body;

        const topic = await prisma.topic.update({
            where: {
                id: parseInt(id)
            },
            data: {
                topic_name: topic_name,
                user_id: parseInt(user_id),
                updateAt: new Date()
            }
        });

        if (topic) return res.status(200).json({ message: `แก้ไขหัวข้อแบบประเมินเรียบร้อย!` });

    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: `Server error!`
        })
    }
}


// Change status topic
exports.changeStatusTopic = async (req, res) => {
    try {
        // Code
        const { id, status, user_id } = req.body;

        const user = await prisma.users.findFirst({
            where: {
                id: parseInt(user_id)
            }
        });

        const topic = await prisma.topic.update({
            where: {
                id: parseInt(id)
            },
            data: {
                status: status,
                user_id: parseInt(user_id)
            }
        });

        if (topic) {
            await prisma.logEvent.create({
                data: {
                    event_rec_id: parseInt(topic.id),
                    table_name: 'Topic',
                    eventType: 'change_status',
                    description: 'เปลี่ยนสถานะ',
                    detail: `${user.name_th} (UserID: ${user_id}) เปลี่ยนสถานะแบบประเมิน "${topic.topic_name}" เป็น "${topic.status === true ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}"`,
                    user_id: parseInt(user_id)
                }
            })

            return res.status(200).json({
                message: `เปลี่ยนสถานะเรียบร้อย!`
            });
        }

    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: `Server error!`
        })
    }
}


// Delete topic
exports.deleteTopic = async (req, res) => {
    try {
        // Code
        const { id } = req.params;
        const topicId = parseInt(id);

        // ใช้ transaction ปลอดภัย
        await prisma.$transaction([

            // ลบ topic สุดท้าย
            prisma.topic.delete({
                where: { id: topicId },
            }),
        ]);

        return res.status(200).json({
            message: "ลบหัวข้อแบบประเมินเรียบร้อย!",
        });

    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: `Server error!`
        })
    }
}