const prisma = require('../Config/Prisma');

exports.provApproveEvaluation = async (req, res) => {
    try {
        // Code
        const {
            id,
            evaluate_id,
            category_id,
            question_id,
            sub_question_id,
            hospital_code,
            prov_approve,
            user_id
        } = req.body;

        // console.log('Payload: ', req.body)

        const exists = await prisma.approve_answers.findFirst({
            where: {
                evaluate_id: parseInt(evaluate_id),
                category_id: parseInt(category_id),
                question_id: parseInt(question_id),
                sub_question_id: parseInt(sub_question_id),
                hospital_code: hospital_code
            }
        });

        if (!exists) {
            const approve = await prisma.approve_answers.create({
                data: {
                    evaluate_id: parseInt(evaluate_id),
                    category_id: parseInt(category_id),
                    question_id: parseInt(question_id),
                    sub_question_id: parseInt(sub_question_id),
                    hospital_code: hospital_code,
                    prov_approve: Boolean(prov_approve),
                    user_id: parseInt(user_id)
                }
            });

            if (approve) return res.status(200).json({
                message: 'อนุมัติผลการประเมินเรียบร้อย!!'
            })
        } else {
            const updated = await prisma.approve_answers.update({
                where: {
                    id: parseInt(id)
                },
                data: {
                    prov_approve: Boolean(prov_approve),
                    user_id: parseInt(user_id),
                    updatedAt: new Date()
                }
            });

            if (updated) return res.status(200).json({
                message: 'เปลี่ยนผลอนุมัติการประเมินเรียบร้อย!!'
            })
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

exports.provUpdateApproveEvaluation = async (req, res) => {
    try {
        // Code
        const {
            evaluate_id,
            category_id,
            question_id,
            sub_question_id,
            hospital_code,
            prov_approve,
            user_id
        } = req.body
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

exports.getProvApproveEvaluation = async (req, res) => {
    try {
        // Code
        const results = await prisma.approve_answers.findMany();

        if (results) return res.status(200).json(results)

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

exports.getProvAndZoneApprove = async (req, res) => {
    try {
        // Code
        const results = await prisma.$queryRaw`
            SELECT
                t2.zone, t2.zone_name, t2.province,
                t1.hospital_code,t2.hname_th AS hospital_name, t2.dept_type AS hospital_type,
                CAST(COUNT(CASE WHEN (t1.prov_approve = 1 AND t1.category_id = 2) THEN 1 END) AS SIGNED) AS prov_approvedCat1,
                CAST(COUNT(CASE WHEN (t1.prov_approve = 0 AND t1.category_id = 2) THEN 1 END) AS SIGNED) AS prov_penddingCat1,
                CAST(COUNT(CASE WHEN (t1.prov_approve = 1 AND t1.category_id = 3) THEN 1 END) AS SIGNED) AS prov_approvedCat2,
                CAST(COUNT(CASE WHEN (t1.prov_approve = 0 AND t1.category_id = 3) THEN 1 END) AS SIGNED) AS prov_penddingCat2,
                CAST(COUNT(CASE WHEN (t1.prov_approve = 1 AND t1.category_id = 4) THEN 1 END) AS SIGNED) AS prov_approvedCat3,
                CAST(COUNT(CASE WHEN (t1.prov_approve = 0 AND t1.category_id = 4) THEN 1 END) AS SIGNED) AS prov_penddingCat3,
                CAST(COUNT(CASE WHEN (t1.prov_approve = 1 AND t1.category_id = 5) THEN 1 END) AS SIGNED) AS prov_approvedCat4,
                CAST(COUNT(CASE WHEN (t1.prov_approve = 0 AND t1.category_id = 5) THEN 1 END) AS SIGNED) AS prov_penddingCat4,  
                CAST(COUNT(CASE WHEN (t1.zone_approve = 1 AND t1.category_id = 2) THEN 1 END) AS SIGNED) AS zone_approvedCat1,
                CAST(COUNT(CASE WHEN (t1.zone_approve = 0 AND t1.category_id = 2) THEN 1 END) AS SIGNED) AS zone_penddingCat1,
                CAST(COUNT(CASE WHEN (t1.zone_approve = 1 AND t1.category_id = 3) THEN 1 END) AS SIGNED) AS zone_approvedCat2,
                CAST(COUNT(CASE WHEN (t1.zone_approve = 0 AND t1.category_id = 3) THEN 1 END) AS SIGNED) AS zone_penddingCat2,
                CAST(COUNT(CASE WHEN (t1.zone_approve = 1 AND t1.category_id = 4) THEN 1 END) AS SIGNED) AS zone_approvedCat3,
                CAST(COUNT(CASE WHEN (t1.zone_approve = 0 AND t1.category_id = 4) THEN 1 END) AS SIGNED) AS zone_penddingCat3,
                CAST(COUNT(CASE WHEN (t1.zone_approve = 1 AND t1.category_id = 5) THEN 1 END) AS SIGNED) AS zone_approvedCat4,
                CAST(COUNT(CASE WHEN (t1.zone_approve = 0 AND t1.category_id = 5) THEN 1 END) AS SIGNED) AS zone_penddingCat4
            FROM Approve_answers AS t1
            INNER JOIN Hospitals AS t2 
            ON t1.hospital_code = t2.hcode9
            GROUP BY t2.zone, t2.zone_name, t2.province, t1.hospital_code,t2.hname_th, t2.dept_type
        `;

        const safeResults = JSON.parse(
            JSON.stringify(results, (_, v) =>
                typeof v === "bigint" ? Number(v) : v
            )
        );

        if (safeResults) return res.status(200).json(safeResults);


    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
