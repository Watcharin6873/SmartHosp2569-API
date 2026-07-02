const prisma = require('../Config/Prisma');

// Prov approved
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
            prov_status,
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
                    prov_status: prov_status,
                    user_id: parseInt(user_id)
                }
            });

            if (approve) return res.status(200).json({
                message: 'อนุมัติผลการประเมินเรียบร้อย!!'
            })
        } else {
            const updated = await prisma.approve_answers.update({
                where: {
                    id: parseInt(id),
                    evaluate_id: parseInt(evaluate_id),
                    category_id: parseInt(category_id),
                    question_id: parseInt(question_id),
                    sub_question_id: parseInt(sub_question_id),
                    hospital_code: hospital_code
                },
                data: {
                    prov_status: prov_status,
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

// Zone approved
exports.zoneApproveEvaluation = async (req, res) => {
    try {
        const { newChecked, hospital_code } = req.body;

        // ✅ Validate input
        if (typeof newChecked !== "boolean" || !hospital_code) {
            return res.status(400).json({
                message: "newChecked ต้องเป็น boolean และต้องส่ง hospital_code"
            });
        }

        // ✅ Map status
        let new_status = "";

        if (newChecked === true) {
            new_status = "PASS";
        } else if (newChecked === false) {
            new_status = "NONE";
        }

        const result = await prisma.approve_answers.updateMany({
            where: {
                hospital_code: hospital_code
            },
            data: {
                zone_status: new_status,
                updatedAt: new Date()
            }
        });

        // ✅ ไม่พบข้อมูล
        if (result.count === 0) {
            return res.status(404).json({
                message: `ไม่พบข้อมูลของโรงพยาบาล ${hospital_code}`
            });
        }

        // ✅ สำเร็จ
        return res.status(200).json({
            message:
                new_status === "PASS"
                    ? `อนุมัติผลการประเมินของ ${hospital_code} แล้ว!!`
                    : `ไม่อนุมัติผลการประเมินของ ${hospital_code} แล้ว!!`,
            updated: result.count
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.provIsCheckedEvaluation = async (req, res) => {
    try {
        // Code
        const {
            id,
            sub_question_id,
            is_checked
        } = req.body

        const isChecked = await prisma.approve_answers.update({
            where: {
                id: parseInt(id),
                sub_question_id: parseInt(sub_question_id)
            },
            data:{
                is_checked: Boolean(is_checked)
            }
        });

        if(isChecked) return res.status(200).json({message: `ตรวจสอบแบบประเมินข้อนี้แล้ว`})

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
        const {category_id, hospital_code} = req.query;
        const results = await prisma.approve_answers.findMany({
            where: {
                category_id: Number(category_id),
                hospital_code: hospital_code
            }
        });

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
                t2.zone, t2.zone_name, t2.province_code, t2.province,
                t2.hcode9 AS hospital_code,t2.hname_th AS hospital_name, t2.dept_type AS hospital_type,
                CAST(COUNT(CASE WHEN (t1.prov_status IN ("PASS","FAIL") AND t1.category_id = 2) THEN 1 END) AS SIGNED) AS prov_approvedCat1,
                CAST(COUNT(CASE WHEN (t1.prov_status = "NONE" AND t1.category_id = 2) THEN 1 END) AS SIGNED) AS prov_penddingCat1,

                CAST(COUNT(CASE WHEN (t1.prov_status IN ("PASS","FAIL") AND t1.category_id = 3) THEN 1 END) AS SIGNED) AS prov_approvedCat2,
                CAST(COUNT(CASE WHEN (t1.prov_status = "NONE" AND t1.category_id = 3) THEN 1 END) AS SIGNED) AS prov_penddingCat2,

                CAST(COUNT(CASE WHEN (t1.prov_status IN ("PASS","FAIL") AND t1.category_id = 4) THEN 1 END) AS SIGNED) AS prov_approvedCat3,
                CAST(COUNT(CASE WHEN (t1.prov_status = "NONE" AND t1.category_id = 4) THEN 1 END) AS SIGNED) AS prov_penddingCat3,

                CAST(COUNT(CASE WHEN (t1.prov_status IN ("PASS","FAIL") AND t1.category_id = 5) THEN 1 END) AS SIGNED) AS prov_approvedCat4,
                CAST(COUNT(CASE WHEN (t1.prov_status = "NONE" AND t1.category_id = 5) THEN 1 END) AS SIGNED) AS prov_penddingCat4,

                CAST(COUNT(CASE WHEN (t1.zone_status IN ("PASS","FAIL") AND t1.category_id = 2) THEN 1 END) AS SIGNED) AS zone_approvedCat1,
                CAST(COUNT(CASE WHEN (t1.zone_status = "NONE" AND t1.category_id = 2) THEN 1 END) AS SIGNED) AS zone_penddingCat1,

                CAST(COUNT(CASE WHEN (t1.zone_status IN ("PASS","FAIL") AND t1.category_id = 3) THEN 1 END) AS SIGNED) AS zone_approvedCat2,
                CAST(COUNT(CASE WHEN (t1.zone_status = "NONE" AND t1.category_id = 3) THEN 1 END) AS SIGNED) AS zone_penddingCat2,

                CAST(COUNT(CASE WHEN (t1.zone_status IN ("PASS","FAIL") AND t1.category_id = 4) THEN 1 END) AS SIGNED) AS zone_approvedCat3,
                CAST(COUNT(CASE WHEN (t1.zone_status = "NONE" AND t1.category_id = 4) THEN 1 END) AS SIGNED) AS zone_penddingCat3,

                CAST(COUNT(CASE WHEN (t1.zone_status IN ("PASS","FAIL") AND t1.category_id = 5) THEN 1 END) AS SIGNED) AS zone_approvedCat4,
                CAST(COUNT(CASE WHEN (t1.zone_status = "NONE" AND t1.category_id = 5) THEN 1 END) AS SIGNED) AS zone_penddingCat4
            FROM Hospitals AS t2 
            LEFT JOIN Approve_answers AS t1
            ON t1.hospital_code = t2.hcode9
            WHERE t2.dept_type IN ('โรงพยาบาลศูนย์', 'โรงพยาบาลทั่วไป', 'โรงพยาบาลชุมชน', 'หน่วยงานทดสอบ') 
            AND t2.hcode9 NOT IN ('EA0053964', 'EA0043735', 'EA0052478')
            GROUP BY t2.zone, t2.zone_name, t2.hcode9, t2.province, t1.hospital_code,t2.hname_th, t2.dept_type
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
