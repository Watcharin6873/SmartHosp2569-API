const prisma = require('../Config/Prisma');

// Create 
exports.createSubQuestion = async (req, res) => {
    try {
        // Code
        const {
            topic_id,
            category_id,
            question_id,
            question_type,
            sub_quest_name,
            is_required,
            user_id,
        } = req.body;

        const findExists = await prisma.sub_quest.findFirst({
            where: {
                sub_quest_name: sub_quest_name
            }
        });

        if (findExists) return res.status(401).json({ message: `มีข้อมูลนี้แล้ว กรุณาเพิ่มหัวข้อถัดไป!` });

        const saveData = await prisma.sub_quest.create({
            data: {
                topic_id: parseInt(topic_id),
                category_id: parseInt(category_id),
                question_id: parseInt(question_id),
                question_type: question_type,
                sub_quest_name: sub_quest_name,
                is_required: Boolean(is_required),
                user_id: parseInt(user_id)
            }
        });

        if (saveData) return res.status(201).json({ message: `เพิ่มข้อมูลสำเร็จ!` });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: `Server error!!` })
    }
}

// Get List sub-question
exports.getListSubQuestion = async (req, res) => {
    try {
        // Code
        const result = await prisma.sub_quest.findMany();

        if (result) return res.status(200).json(result);

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: `Server error!!` })
    }
}

// Get list sub-question by category id
exports.getListSubQuestionByQusetionId = async (req, res) => {
    try {
        // Code
        const { question_id } = req.params;
        const result = await prisma.sub_quest.findMany({
            where: {
                question_id: parseInt(question_id)
            }
        });

        if (result) return res.status(200).json(result);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: `Server error!!` })
    }
}

// Get sub-question by id
exports.getSubQuestionById = async (req, res) => {
    try {
        // Code
        const { id } = req.params;
        const result = await prisma.sub_quest.findFirst({
            where: {
                id: parseInt(id)
            }
        });

        if (result) return res.status(200).json(result);

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: `Server error!!` })
    }
}

// Get list sub-question by category id
exports.getListSubQuestionByCatId = async (req, res) => {
    try {
        const { category_id } = req.query;
        const result = await prisma.sub_quest.findMany({
            where: {
                category_id: parseInt(category_id)
            }
        });

        if (result) return res.status(200).json(result);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: `Server error!!` })
    }
}

// Update sub-question
exports.updateSubQuestion = async (req, res) => {
    try {
        // Code
        const {
            id,
            topic_id,
            category_id,
            question_id,
            question_type,
            sub_quest_name,
            is_required,
            user_id,
        } = req.body;

        const updateData = await prisma.sub_quest.update({
            where: {
                id: parseInt(id)
            },
            data: {
                topic_id: parseInt(topic_id),
                category_id: parseInt(category_id),
                question_id: parseInt(question_id),
                sub_quest_name: sub_quest_name,
                question_type: question_type,
                is_required: Boolean(is_required),
                user_id: parseInt(user_id),
                updateAt: new Date()
            }
        });

        if (updateData) return res.status(201).json({ message: `แก้ไขข้อมูลสำเร็จ!` })

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: `Server error!!` })
    }
}

// Delete sub-question
exports.deleteSubQuestion = async (req, res) => {
    try {
        // Code
        const { id } = req.params;

        const del = await prisma.sub_quest.delete({ where: { id: parseInt(id) } });

        if (del) return res.status(200).json({message: `ลบข้อมูลสำเร็จ!!`})

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: `Server error!!` })
    }
}