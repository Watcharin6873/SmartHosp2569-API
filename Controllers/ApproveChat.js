const prisma = require('../Config/Prisma');

// Get approve chat
exports.getApproveChat = async (req, res) =>{
    try {
        // Code
        const {
            subQuestionId,
            hospitalCode
        } = req.query;

        const chats = await prisma.approve_chat.findMany({
            where: {
                sub_question_id: Number(subQuestionId),
                hospital_code: hospitalCode
            },
            orderBy:{
                created_at: 'asc'
            }
        })

        if (chats) return res.status(200).json(chats)

        

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: `Internal server error!` })
    }
}


// Post approve chat
exports.saveApproveChat = async (req, res) =>{
    try {
        // Code
        const {
            categoryId,
            questionId,
            subQuestionId,
            hospitalCode,
            senderRole,
            message
        } = req.body;

        const saveApprove = await prisma.approve_chat.create({
            data: {
                category_id: Number(categoryId),
                question_id: Number(questionId),
                sub_question_id: Number(subQuestionId),
                hospital_code: hospitalCode,
                sender_role: senderRole,
                message: message
            }
        })

        if (saveApprove) return res.status(200).json({message: 'บันทึกข้อมูลเรียบร้อย!!'})

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: `Internal server error!` })
    }
}