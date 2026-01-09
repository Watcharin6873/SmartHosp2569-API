const prisma = require('../Config/Prisma');

// Create Choice with Answers
exports.createChoice = async (req, res) => {
    try {
        // Code
        const {
            topic_id,
            category_id,
            question_id,
            sub_question_id,
            user_id,
            answers
        } = req.body;

        const newChoices = await prisma.choice.create({
            data: {
                topic_id: parseInt(topic_id),
                category_id: parseInt(category_id),
                question_id: parseInt(question_id),
                sub_question_id: parseInt(sub_question_id),
                user_id: parseInt(user_id),
                answers: {
                    create: answers.map(answer => ({
                        choice_text: answer.choice_text,
                        choice_value: parseFloat(answer.choice_value),
                        choice_required: parseFloat(answer.choice_required)
                    }))
                }
            },
            include: {
                answers: true
            }
        })

        if (newChoices) return res.status(200).json({ message: `บันทึกข้อมูลสำเร็จ!!` });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Get list of Choices
exports.getListChoices = async (req, res) => {
    try {
        // Code
        const choices = await prisma.choice.findMany({
            include: {
                answers: true
            }
        });

        res.status(200).json(choices);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get llist Choice by category ID
exports.getListChoicesByCatId = async (req, res) =>{
    try {
        const { category_id } = req.query;
        const choices = await prisma.choice.findMany({
            where: {
                category_id: parseInt(category_id)
            },
            include: {
                answers: true
            }
        });

        res.status(200).json(choices);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Get list choices by sub-question ID
exports.getListChoicesBySubQuestionId = async (req, res) => {
    try {
        // Code
        const { sub_question_id } = req.params;
        const choices = await prisma.choice.findMany({
            where: {
                sub_question_id: parseInt(sub_question_id)
            },
            include: {
                answers: true
            }
        });

        res.status(200).json(choices);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get Choice by ID
exports.getChoiceById = async (req, res) => {
    try {
        // Code
        const { id } = req.params;
        const choice = await prisma.choice.findUnique({
            where: { id: parseInt(id) },
            include: {
                answers: true
            }
        });

        if (!choice) {
            return res.status(404).json({ error: 'Choice not found' });
        }

        res.status(200).json(choice);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update Choice
exports.updateChoice = async (req, res) => {
    try {
        // Code
        const {
            id,
            topic_id,
            category_id,
            question_id,
            sub_question_id,
            user_id,
            answers
        } = req.body;

        const updatedChoice = await prisma.choice.update({
            where: { id: parseInt(id) },
            data: {
                topic_id: parseInt(topic_id),
                category_id: parseInt(category_id),
                question_id: parseInt(question_id),
                sub_question_id: parseInt(sub_question_id),
                user_id: parseInt(user_id),
                answers: {
                    // 1) UPDATE เฉพาะรายการที่มี id เดิม
                    update: answers
                        .filter(a => a.id) // มี id → update
                        .map(a => ({
                            where: {
                                id: parseInt(a.id)
                            },
                            data: {
                                choice_text: a.choice_text,
                                choice_value: parseFloat(a.choice_value),
                                choice_required: parseFloat(a.choice_required)
                            }
                        })),
                    // 2) CREATE เฉพาะรายการที่เพิ่มใหม่
                    create: answers
                        .filter(a => !a.id) // ไม่มี id → create
                        .map(a => ({
                            choice_text: a.choice_text,
                            choice_value: parseFloat(a.choice_value),
                            choice_required: parseFloat(a.choice_required)
                        })),
                    // 3) DELETE แถวที่ถูกลบ (ไม่ได้ส่งมาจาก client)
                    deleteMany: {
                        id: {
                            notIn: answers
                                .filter(a => a.id)
                                .map(a => parseInt(a.id))
                        }
                    }
                },
                updateAt: new Date()
            },
            include: {
                answers: true
            }
        });

        if (updatedChoice) return res.status(200).json({ message: `อัปเดตข้อมูลสำเร็จ!!` });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete Choice
exports.deleteChoice = async (req, res) => {
    try {
        // Code
        const { id } = req.params;

        await prisma.choice.delete({
            where: { id: parseInt(id) }
        });

        res.status(200).json({ message: 'ลบข้อมูลสำเร็จ!!' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};