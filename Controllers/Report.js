const prisma = require('../Config/Prisma');


// Report all category
exports.getReportAllCat = async (req, res) => {
    try {
        // Code
        const report = await prisma.$queryRaw`
            SELECT 
                t2.hospital_code,
                t2.hospital_name,
                t1.category_id,
                SUM(t1.answer_value) AS answer_value,
                SUM(t1.answer_required) AS answer_required
            FROM EvaluateAnswer AS t1
            INNER JOIN Evaluate AS t2
            ON t1.evaluate_id = t2.id
            WHERE t1.category_id IN (2,3,5) AND t2.is_draft = 0 
            GROUP BY t2.hospital_code,t2.hospital_name,t1.category_id
            UNION ALL
            SELECT 
                tb1.hospital_code,
                tb1.hospital_name,
                tb1.category_id,
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
                WHERE t1.category_id = 4 AND t2.is_draft = 0  
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
                WHERE t1.category_id = 4 AND t2.is_draft = 0 
                AND t1.sub_question_id IN (
                '113','114','115','116','117',
                '118','119','120','121','125',
                '136','139','142','153','154')) AS tb1
            GROUP BY tb1.hospital_code, tb1.hospital_name, tb1.category_id
        `;

        if (report) return res.status(200).json(report);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error!.' });
    }
}

// get report by hcode9
exports.getReportAllCatByHcode9 = async (req, res) => {
    try {
        // Code
        const { hcode9 } = req.query;
        const report = await prisma.$queryRaw`
            SELECT 
                t2.hospital_code,
                t2.hospital_name,
                t1.category_id,
                SUM(t1.answer_value) AS answer_value,
                SUM(t1.answer_required) AS answer_required
            FROM EvaluateAnswer AS t1
            INNER JOIN Evaluate AS t2
            ON t1.evaluate_id = t2.id
            WHERE t1.category_id IN (2,3,5) AND t2.hospital_code = ${hcode9}
            GROUP BY t2.hospital_code,t2.hospital_name,t1.category_id
            UNION ALL
            SELECT 
                tb1.hospital_code,
                tb1.hospital_name,
                tb1.category_id,
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
                WHERE t1.category_id = 4 AND t2.hospital_code = ${hcode9} 
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
                WHERE t1.category_id = 4 AND t2.hospital_code = ${hcode9}
                AND t1.sub_question_id IN (
                '113','114','115','116','117',
                '118','119','120','121','125',
                '136','139','142','153','154')) AS tb1
            GROUP BY tb1.hospital_code, tb1.hospital_name, tb1.category_id
        `;

        if (report) return res.status(200).json(report);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error!.' });
    }
}


exports.getCyberLevelByHosp = async (req, res) =>{
    try {
        // Code
        const { hcode9 } = req.query;
        const result = await prisma.cyber_risk_level.findFirst({
            where: {
                hcode9: hcode9
            },
            select:{
                id: true,
                hcode5: true,
                hcode9: true,
                province: true,
                hname_th: true,
                hosp_level: true,
                cyber_level : true,
                cyber_levelname: true,
                zone_name: true,
                supplier: true,
                usersId: true,
                createdAt: true
            }
        });

        if (result) return res.status(200).json(result);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error!.' });
    }
}

exports.getCyberLevel = async (req, res) =>{
    try {
        // Code
        const result = await prisma.cyber_risk_level.findMany({
            select:{
                id: true,
                hcode5: true,
                hcode9: true,
                province: true,
                hname_th: true,
                hosp_level: true,
                cyber_level : true,
                cyber_levelname: true,
                zone_name: true,
                supplier: true,
                usersId: true,
                createdAt: true
            }
        });

        if (result) return res.status(200).json(result);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error!.' });
    }
}