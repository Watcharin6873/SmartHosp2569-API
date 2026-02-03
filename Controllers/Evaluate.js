const prisma = require('../Config/Prisma');
const { Prisma } = require('@prisma/client');

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

        console.log('Payload frontend: ', req.body);

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

            // 2. INSERT / UPDATE Evaluate Answers (รองรับ checkbox)
            const grouped = answers.reduce((acc, item) => {
                if (!acc[item.sub_question_id]) acc[item.sub_question_id] = [];
                acc[item.sub_question_id].push(item);
                return acc;
            }, {});

            for (const subQuestionId in grouped) {
                const items = grouped[subQuestionId];

                // 🔥 ลบคำตอบเดิมของ sub_question นี้ (radio + checkbox)
                await tx.evaluateAnswer.deleteMany({
                    where: {
                        evaluate_id: evaluate.id,
                        sub_question_id: parseInt(subQuestionId)
                    }
                });

                // 🔁 insert ใหม่ทั้งหมด
                for (const item of items) {
                    const answer = await tx.answer.findUnique({
                        where: { id: parseInt(item.answer_id) }
                    });

                    if (!answer) {
                        throw new Error(`Answer ID ${item.answer_id} ไม่ถูกต้อง`);
                    }

                    if (!item.choice_id) {
                        throw new Error(`choice_id missing at sub_question ${subQuestionId}`);
                    }

                    await tx.evaluateAnswer.create({
                        data: {
                            evaluate_id: evaluate.id,
                            topic_id: parseInt(topic_id),
                            category_id: parseInt(category_id),
                            question_id: parseInt(question_id),
                            sub_question_id: parseInt(subQuestionId),
                            choice_id: parseInt(item.choice_id),
                            answer_id: parseInt(item.answer_id),
                            answer_text: item.answer_text || null,

                            // 🔒 ใช้ค่าจาก Answer จริง ป้องกันโกง
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

// Get list hospitals evaluation
exports.getListHospitalsInEvaluation = async (req, res) => {
    try {
        // Code
        const listType = ['โรงพยาบาลศูนย์', 'โรงพยาบาลทั่วไป', 'โรงพยาบาลชุมชน', 'หน่วยงานทดสอบ']; //, 'หน่วยงานทดสอบ'
        const listHcode9 = ['EA0053964', 'EA0043735', 'EA0052478'];
        const results = await prisma.$queryRaw`
            SELECT DISTINCT 
                t2.zone, t2.zone_name, t2.province_code, t2.province, t1.hospital_code, 
                t1.hospital_name, t1.hospital_type, t1.category_id
            FROM Evaluate AS t1 
            INNER JOIN Hospitals AS t2 
            ON t1.hospital_code = t2.hcode9
            WHERE t1.hospital_type IN ('โรงพยาบาลศูนย์', 'โรงพยาบาลทั่วไป', 'โรงพยาบาลชุมชน', 'หน่วยงานทดสอบ') 
            AND t2.hcode9 NOT IN ('EA0053964', 'EA0043735', 'EA0052478') AND t1.is_draft = 0
        `;
        if (results) return res.status(200).json(results)
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Get list hospitals evaluation
exports.getListHospitalsInEvaluation2 = async (req, res) => {
    try {
        // Code
        const listType = ['โรงพยาบาลศูนย์', 'โรงพยาบาลทั่วไป', 'โรงพยาบาลชุมชน', 'หน่วยงานทดสอบ']; //, 'หน่วยงานทดสอบ'
        const listHcode9 = ['EA0053964', 'EA0043735', 'EA0052478'];
        const results = await prisma.$queryRaw`
            SELECT DISTINCT 
                t2.zone, t2.zone_name, t2.province_code, t2.province, t1.hospital_code, 
                t1.hospital_name, t1.hospital_type 
            FROM Evaluate AS t1 
            INNER JOIN Hospitals AS t2 
            ON t1.hospital_code = t2.hcode9
            WHERE t1.hospital_type IN ('โรงพยาบาลศูนย์', 'โรงพยาบาลทั่วไป', 'โรงพยาบาลชุมชน', 'หน่วยงานทดสอบ') 
            AND t2.hcode9 NOT IN ('EA0053964', 'EA0043735', 'EA0052478') AND t1.is_draft = 0
        `;
        if (results) return res.status(200).json(results)
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Get evaluate data
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
                evaluateAnswers: {
                    include: {
                        subQuestions: true,
                    }
                }
            }
        });

        // ไม่มีข้อมูล → ส่ง null ให้ frontend
        res.status(200).json(result);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get evaluation by cat id 
exports.getEvaluationByCatId = async (req, res) => {
    try {
        const { category_id, hospital_code } = req.query;

        if (!category_id || !hospital_code) {
            return res.status(400).json({ error: 'question_id และ hospital_code จำเป็นต้องมี' });
        }

        const result = await prisma.evaluate.findMany({
            where: {
                category_id: parseInt(category_id),
                hospital_code: hospital_code
            },
            orderBy: {
                updateAt: 'desc' // ⭐ สำคัญมาก
            },
            include: {
                evaluateAnswers: {
                    include: {
                        subQuestions: true,
                    }
                }
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

// Request for edit evaluation
exports.requestForEditEvaluation = async (req, res) => {
    try {
        // Code
        const {
            question_id,
            hcode9,
            user_id,
            is_draft
        } = req.body;

        // ✅ Validation ที่ถูกต้อง
        if (!question_id || !hcode9 || !user_id || typeof is_draft !== "boolean") {
            return res.status(400).json({ message: "Invalid request data" });
        }

        // ✅ อัปเดตข้อมูล
        const updated = await prisma.evaluate.updateMany({
            where: {
                question_id: parseInt(question_id),
                hospital_code: hcode9
            },
            data: {
                is_draft: Boolean(is_draft),
                user_id: parseInt(user_id),
                updateAt: new Date()
            }
        });

        // ✅ ไม่มีแถวถูกอัปเดต
        if (updated.count === 0) {
            return res.status(404).json({
                message: "ไม่พบแบบประเมินที่ต้องการแก้ไข"
            });
        }

        // ✅ Log event
        await prisma.logEvent.create({
            data: {
                event_rec_id: parseInt(user_id),
                table_name: "Evaluate",
                eventType: is_draft ? "request_edit" : "cancel_edit",
                description: is_draft
                    ? "ขอแก้ไขแบบประเมิน"
                    : "ยกเลิกการขอแก้ไขแบบประเมิน",
                detail: `ผู้ใช้งานรหัส ${user_id} ${is_draft ? "ขอแก้ไข" : "ยกเลิกการขอแก้ไข"
                    } แบบประเมินของ ${hcode9} คำถามหลักรหัส ${question_id}`,
                user_id: parseInt(user_id)
            }
        });

        return res.status(200).json({
            message: `ดำเนินการ${is_draft ? "ขอแก้ไข" : "ยกเลิกการขอแก้ไข"
                }แบบประเมินของ ${hcode9} สำเร็จ`,
            success: true,
            question_id: Number(question_id),
            is_draft: is_draft
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

exports.getScoreHospitalForSubQuestion = async (req, res) =>{
    try {
        // Code
        const {hospital_code} = req.query;

        const scores = await prisma.$queryRaw`
            SELECT 
                t2.hospital_code,
                t2.hospital_name,
                t1.category_id,
                t1.question_id,
                t1.sub_question_id,
                SUM(t1.answer_value) AS answer_value,
                SUM(t1.answer_required) AS answer_required
            FROM EvaluateAnswer AS t1
            INNER JOIN Evaluate AS t2
            ON t1.evaluate_id = t2.id
            WHERE t1.category_id IN (2,3,5) AND t2.hospital_code = ${hospital_code}
            GROUP BY t2.hospital_code,t2.hospital_name,t1.category_id, t1.question_id, t1.sub_question_id
            UNION ALL
            SELECT 
                tb1.hospital_code,
                tb1.hospital_name,
                tb1.category_id,
                tb1.question_id,
                tb1.sub_question_id,
                SUM(tb1.answer_value) AS answer_value,
                SUM(tb1.answer_required) AS answer_required
            FROM (SELECT
                    t2.hospital_code,
                    t2.hospital_name,
                    t1.topic_id,
                    t1.category_id,
                    t1.question_id,
                    sub_question_id,
                    t1.answer_value,
                    t1.answer_required
                FROM EvaluateAnswer AS t1
                INNER JOIN Evaluate AS t2
                ON t1.evaluate_id = t2.id
                WHERE t1.category_id = 4 AND t2.hospital_code = ${hospital_code}
                AND t1.sub_question_id NOT IN (
                '113','114','115','116','117',
                '118','119','120','121','125',
                '136','139','142','153','154')
                UNION ALL
                SELECT DISTINCT
                    t2.hospital_code,
                    t2.hospital_name,
                    t1.topic_id,
                    t1.category_id,
                    t1.question_id,
                    t1.sub_question_id,
                    t1.answer_value,
                    t1.answer_required
                FROM EvaluateAnswer AS t1
                INNER JOIN Evaluate AS t2
                ON t1.evaluate_id = t2.id
                WHERE t1.category_id = 4 AND t2.hospital_code = ${hospital_code}
                AND t1.sub_question_id IN (
                '113','114','115','116','117',
                '118','119','120','121','125',
                '136','139','142','153','154')) AS tb1
            GROUP BY tb1.hospital_code, tb1.hospital_name, tb1.category_id,tb1.question_id,tb1.sub_question_id
        `;

        if (scores) return res.status(200).json(scores)

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
