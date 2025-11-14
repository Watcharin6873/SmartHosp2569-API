const prisma = require('../Config/Prisma');



// Create survey score
exports.createSurveyScore = async (req, res) => {
    try {
        // Code
        const {
            topic_id,
            category_id,
            question_id,
            answers
        } = req.body;

        const survey_score = await prisma.score_survey.create({
            data: {
                topic_id: parseInt(topic_id),
                category_id: parseInt(category_id),
                question_id: parseInt(question_id),
                answers: {
                    create: answers.map(a => ({
                        score_name: a.score_name,
                        score_value: parseInt(a.score_value)
                    }))
                }
            },
            include: { answers: true }
        });

        if (survey_score) return res.status(200).json({ message: `บันทึกข้อมูลสำเร็จ!!` })

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: `Server error!!` });
    }
}

exports.getListSurveyScore = async (req, res) => {
    try {
        // Code
        const result = await prisma.score_survey.findMany({
            select: {
                id: true,
                topic_id: true,
                category_id: true,
                question_id: true,
                answers: true
            }
        });
        if (result) return res.status(200).json(result);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: `Server error!!` })
    }
}

// Save survey form
exports.saveSurveyForm = async (req, res) => {
    try {
        const listData = req.body.map((item) => ({
            topic_id: parseInt(item.topic_id),
            category_id: parseInt(item.category_id),
            question_id: parseInt(item.question_id),
            alert_id: item.alert_id,
            hcode: item.hcode,
            score_value: parseInt(item.score_value)
        }));

        const result = await prisma.survey_form.createMany({
            data: listData,
            skipDuplicates: true,  // ป้องกัน insert ซ้ำ
        });

        if (result) res.status(200).json({ message: `🎉 ขอบคุณสำหรับการตอบแบบประเมิน!`, count: result.count })

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: `Server error!!` })
    }
}

// Save survey comemt
exports.saveSurveyComment = async (req, res) => {
    try {
        const listData = req.body.map((item) => ({
            topic_id: parseInt(item.topic_id),
            category_id: parseInt(item.category_id),
            question_id: parseInt(item.question_id),
            alert_id: item.alert_id,
            hcode: item.hcode,
            comment_string: item.comment_string
        }));

        const result = await prisma.survey_comment.createMany({
            data: listData,
            skipDuplicates: true,  // ป้องกัน insert ซ้ำ
        });

        if (result) res.status(200).json({ message: `🎉 ขอบคุณสำหรับการตอบแบบประเมิน!`, count: result.count })

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: `Server error!!` })
    }
}

// Get form survey
exports.getSurveyFormById = async (req, res) => {
    try {
        // Code
        const { id } = req.params;
        const result = await prisma.score_survey.findFirst({
            where: {
                id: parseInt(id)
            },
            select: {
                id: true,
                topic_id: true,
                category_id: true,
                question_id: true,
                answers: true
            }
        });

        if (result) return res.status(200).json(result);

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: `Server error!!` })
    }
}

// Update score survey
exports.updateScoreSurvey = async (req, res) => {
    try {
        // Code
        const {
            id,
            topic_id,
            category_id,
            question_id,
            answers
        } = req.body;

        const result = await prisma.score_survey.update({
            where: {
                id: parseInt(id)
            },
            data: {
                topic_id: parseInt(topic_id),
                category_id: parseInt(category_id),
                question_id: parseInt(question_id),
                answers: {
                    update: answers.map(a => ({
                        where: {
                            id: parseInt(a.id),
                            score_surveyId: parseInt(id)
                        },
                        data: {
                            score_name: a.score_name,
                            score_value: parseInt(a.score_value)
                        }
                    }))
                },
                updatedAt: new Date()
            },
            include: { answers: true }
        });

        if (result) return res.status(200).json({ message: `แก้ไขข้อมูลสำเร็จ!!` })

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: `Server error!!` })
    }
}

exports.searchAVGSurvey = async (req, res) => {
    try {
        // Code
        const result = await prisma.$queryRaw`SELECT t2.zone_name,
                        t2.province,
                        t1.hcode,
                        t2.hname_th,
                        ROUND(AVG(CASE WHEN t1.question_id = 2 THEN t1.score_value END), 2) AS question_1,
                        ROUND(AVG(CASE WHEN t1.question_id = 3 THEN t1.score_value END), 2) AS question_2,
                        ROUND(AVG(CASE WHEN t1.question_id = 4 THEN t1.score_value END), 2) AS question_3,
                        ROUND(AVG(CASE WHEN t1.question_id = 5 THEN t1.score_value END), 2) AS question_4,
                        ROUND(AVG(CASE WHEN t1.question_id = 6 THEN t1.score_value END), 2) AS question_5,
                        COUNT(DISTINCT alert_id) AS total_survey
                        FROM Survey_form AS t1
                        INNER JOIN Hospitals AS t2
                        ON t1.hcode = t2.hcode9
                        GROUP BY t2.zone_name,t2.province,t1.hcode,t2.hname_th`

        const safeResult = result.map(row =>
            Object.fromEntries(
                Object.entries(row).map(([k, v]) => [
                    k,
                    typeof v === 'bigint' ? Number(v) : v
                ])
            )
        );

        if (safeResult) return res.status(200).json(safeResult);

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: `Server error!!` })
    }
}