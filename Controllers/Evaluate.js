const prisma = require('../Config/Prisma');

// Create Evaluation
exports.createEvaluation = async (req, res) => {
    try {
        // Code
        const {
            evaluate_id,
            topic_id,
            category_id,
            question_id,
            hcode9,
            is_draft,
            answers
        } = req.body;

        // console.log('Received evaluation data:', req.body);

        // 🔐 ปกติควรอ่านจาก JWT
        const user_id = req.body.user_id;

        const hospData = await prisma.hospitals.findFirst({
            where: {
                hcode9: hcode9
            }
        });

        if (!hospData) {
            return res.status(404).json({ error: 'ไม่พบข้อมูลหน่วยบริการ' });
        }

        if (!question_id || !answers || answers.length === 0) {
            return res.status(400).json({ error: 'ข้อมูลไม่ครบ' });
        }

        const evaluateId = evaluate_id && Number(evaluate_id) > 0 ? Number(evaluate_id) : null;

        const result = await prisma.$transaction(async (tx) => {
            let evaluate;

            // 1. Create / Update Evaluation
            if (evaluateId) {
                const exists = await tx.evaluate.findFirst({
                    where: {
                        id: parseInt(evaluate_id),
                        topic_id: parseInt(topic_id),
                        category_id: parseInt(category_id),
                        question_id: parseInt(question_id),
                        hospital_code: hcode9,
                    }
                });

                if (!exists) {
                    // 👉 ถือว่าเป็น create ใหม่
                    evaluate = await tx.evaluate.create({
                        data: {
                            topic_id: parseInt(topic_id),
                            category_id: parseInt(category_id),
                            question_id: parseInt(question_id),
                            hospital_code: hcode9,
                            hospital_name: hospData.hname_th,
                            hospital_type: hospData.dept_type,
                            is_draft: is_draft,
                            user_id: parseInt(user_id)
                        }
                    });
                } else {
                    evaluate = await tx.evaluate.update({
                        where: { id: parseInt(evaluate_id) },
                        data: {
                            topic_id: parseInt(topic_id),
                            category_id: parseInt(category_id),
                            question_id: parseInt(question_id),
                            hospital_code: hcode9,
                            hospital_name: hospData.hname_th,
                            hospital_type: hospData.dept_type,
                            is_draft: is_draft
                        }
                    });

                    if (evaluateId && !is_draft) {
                        await tx.evaluateAnswer.deleteMany({
                            where: { evaluate_id: evaluateId }
                        });
                    }
                }
            } else {
                evaluate = await tx.evaluate.create({
                    data: {
                        topic_id: parseInt(topic_id),
                        category_id: parseInt(category_id),
                        question_id: parseInt(question_id),
                        hospital_code: hcode9,
                        hospital_name: hospData.hname_th,
                        hospital_type: hospData.dept_type,
                        is_draft,
                        user_id: parseInt(user_id)
                    }
                });
            }

            // 2. INSERT Evaluate Answers
            for (const item of answers) {
                // 🔒 ดึง Answer จริง เพื่อกันโกงคะแนน
                const answer = await tx.answer.findUnique({
                    where: { id: parseInt(item.answer_id) }
                });

                if (!answer) {
                    throw new Error(`Answer ID ${item.answer_id} ไม่ถูกต้อง`);
                }

                if (!item.choice_id) {
                    throw new Error(`choice_id missing at sub_question ${item.sub_question_id}`);
                }

                const existing = await tx.evaluateAnswer.findFirst({
                    where: {
                        sub_question_id: parseInt(item.sub_question_id)
                    }
                });

                if (existing) {
                    await tx.evaluateAnswer.update({
                        where: { id: existing.id },
                        data: {
                            evaluate_id: evaluate.id,
                            topic_id: parseInt(topic_id),
                            category_id: parseInt(category_id),
                            question_id: parseInt(question_id),
                            sub_question_id: item.sub_question_id ? parseInt(item.sub_question_id) : null,
                            choice_id: parseInt(item.choice_id),
                            answer_id: parseInt(item.answer_id),
                            answer_text: item.answer_text || null,
                            answer_value: answer.choice_value,
                            answer_required: answer.choice_required,
                            user_id: parseInt(user_id),
                            updateAt: new Date()
                        }
                    })
                } else {
                    // No existing answer, proceed to create
                    await tx.evaluateAnswer.create({
                        data: {
                            evaluate_id: evaluate.id,
                            topic_id: parseInt(topic_id),
                            category_id: parseInt(category_id),
                            question_id: parseInt(question_id),
                            sub_question_id: item.sub_question_id ? parseInt(item.sub_question_id) : null,
                            choice_id: parseInt(item.choice_id),
                            answer_id: parseInt(item.answer_id),
                            answer_text: item.answer_text || null,
                            answer_value: answer.choice_value,
                            answer_required: answer.choice_required,
                            user_id: parseInt(user_id)
                        }
                    });
                }
            }
            return evaluate;
        });

        res.status(200).json({
            message: evaluate_id ? 'อัปเดตการประเมินสำเร็จ' : 'สร้างการประเมินสำเร็จ',
            success: true,
            question_id: Number(question_id),
            is_draft: result.is_draft
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Get draft evaluate
exports.getDraftEvaluation = async (req, res) => {
    try {
        const { question_id, hospital_code } = req.query;

        if (!question_id || !hospital_code) {
            return res.status(400).json({ error: 'question_id และ hospital_code จำเป็นต้องมี' });
        }

        const result = await prisma.evaluate.findFirst({
            where: {
                question_id: parseInt(question_id),
                hospital_code: hospital_code
            },
            orderBy: {
                updateAt: 'desc' // ⭐ สำคัญมาก
            },
            include: {
                evaluateAnswers: true
            }
        });

        // ไม่มีข้อมูล → ส่ง null ให้ frontend
        res.status(200).json(result);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get evaluate by ID
exports.getEvaluationById = async (req, res) => {
    try {
        const { evaluate_id } = req.params;

        if (!evaluate_id) {
            return res.status(400).json({ error: 'evaluate_id จำเป็นต้องมี' });
        }

        const result = await prisma.evaluate.findUnique({
            where: {
                id: parseInt(evaluate_id)
            },
            include: {
                evaluateAnswers: true
            }
        });

        if (!result) {
            return res.status(404).json({ error: 'ไม่พบการประเมิน' });
        }

        res.status(200).json(result);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
