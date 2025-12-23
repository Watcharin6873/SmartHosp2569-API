const prisma = require('../Config/Prisma');

// Create
exports.createQuestion = async (req, res) => {
    try {
        // Code
        const {
            topic_id,
            category_id,
            question_name,
            user_id
        } = req.body;

        const question = await prisma.question.create({
            data: {
                topic_id: parseInt(topic_id),
                category_id: parseInt(category_id),
                question_name: question_name,
                user_id: parseInt(user_id)
            }
        });

        if (question) return res.status(200).json({ message: `เพิ่มคำถามในแบบประเมินสำเร็จ!` })

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: `Server error!` })
    }
}

// Get list
exports.getListQuestion = async (req, res) => {
    try {
        // Code
        const question = await prisma.question.findMany();

        if (question) return res.status(200).json(question);

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: `Server error!` })
    }
}

// Get list question by category id
exports.getListQuestionByCatId = async (req, res) =>{
    try {
        const { category_id } = req.params;
        const question = await prisma.question.findMany({
            where: {
                category_id: parseInt(category_id)
            }
        });

        if (question) return res.status(200).json(question);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: `Server error!` })
    }
}

// Get question by id
exports.getQuestionById = async (req, res) => {
    try {
        // Code
        const { id } = req.params;

        const question = await prisma.question.findFirst({
            where: {
                id: parseInt(id)
            }
        });

        if (question) return res.status(200).json(question);

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: `Server error!` })
    }
}

// Update question by id
exports.updateQuestion = async (req, res) => {
    try {
        // Code
        const {
            id,
            topic_id,
            category_id,
            question_name,
            user_id
        } = req.body;

        const question = await prisma.question.update({
            where: {
                id: parseInt(id)
            },
            data: {
                topic_id: parseInt(topic_id),
                category_id: parseInt(category_id),
                question_name: question_name,
                user_id: parseInt(user_id),
                updateAt: new Date()
            }
        });

        if (question) return res.status(200).json({message: `แก้ไขข้อมูลสำเร็จ`});

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: `Server error!` })
    }
}

// Delete question by id
exports.deleteQuestion = async (req, res) => {
    try {
        // Code
        const {id} = req.params;

        const question = await prisma.question.delete({
            where:{
                id: parseInt(id)
            }
        });

        if (question) return res.status(200).json({message: `ลบข้อมูลสำเร็จ`});

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: `Server error!` })
    }
}