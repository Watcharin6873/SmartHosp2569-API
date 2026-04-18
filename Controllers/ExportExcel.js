const ExcelJS = require('exceljs');
const { Prisma } = require("@prisma/client");
const prisma = require('../Config/Prisma');

exports.exportToExcelMulti = async (req, res) => {
    try {

        const hospCode = req.query.hcode9
            ? req.query.hcode9.split(",").map(h => h.trim()).filter(Boolean)
            : [];

        if (!hospCode.length) {
            return res.status(400).json({ message: "hcode9 is required" });
        }

        const data = await prisma.evaluate.findMany({
            where: {
                hospital_code: { in: hospCode }
            },
            include: {
                evaluateAnswers: true
            }
        });

        if (!data.length) {
            return res.status(404).json({ message: "No data found" });
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Export");

        // ==========================================
        // 1️⃣ Build Structure
        // ==========================================

        const hospitals = {};
        const structure = {};

        data.forEach(evaluate => {

            const hospitalName =
                `${evaluate.hospital_name} (${evaluate.hospital_code})`;

            if (!hospitals[hospitalName]) hospitals[hospitalName] = {};

            evaluate.evaluateAnswers.forEach(answer => {

                const {
                    category_id,
                    question_id,
                    sub_question_id,
                    choice_id
                } = answer;

                // ---------- hospital map ----------
                hospitals[hospitalName][category_id] ??= {};
                hospitals[hospitalName][category_id][question_id] ??= {};
                hospitals[hospitalName][category_id][question_id][sub_question_id] ??= {};

                hospitals[hospitalName][category_id][question_id][sub_question_id][choice_id] = 1;

                // ---------- structure ----------
                structure[category_id] ??= {};
                structure[category_id][question_id] ??= {};
                structure[category_id][question_id][sub_question_id] ??= new Set();

                structure[category_id][question_id][sub_question_id].add(choice_id);

            });

        });

        const sortedCategories = Object.keys(structure).sort((a, b) => Number(a) - Number(b));

        // ==========================================
        // 2️⃣ HEADER
        // ==========================================

        worksheet.getCell(1, 1).value = "hospital";
        worksheet.mergeCells(1, 1, 3, 1);

        let colIndex = 2;

        sortedCategories.forEach(catId => {

            const questions = Object.keys(structure[catId])
                .sort((a, b) => Number(a) - Number(b));

            const categoryStart = colIndex;

            questions.forEach(qId => {

                const subList = Object.keys(structure[catId][qId])
                    .sort((a, b) => Number(a) - Number(b));

                const questionStart = colIndex;

                subList.forEach(subId => {

                    const choiceList = Array
                        .from(structure[catId][qId][subId])
                        .sort((a, b) => Number(a) - Number(b));

                    choiceList.forEach(choiceId => {

                        worksheet.getCell(3, colIndex).value =
                            `sub_${subId}_choice_${choiceId}`;

                        colIndex++;
                    });

                });

                // merge question row
                if (colIndex - 1 >= questionStart) {
                    worksheet.mergeCells(2, questionStart, 2, colIndex - 1);
                    worksheet.getCell(2, questionStart).value = `question_${qId}`;
                }

            });

            // merge category row
            if (colIndex - 1 >= categoryStart) {
                worksheet.mergeCells(1, categoryStart, 1, colIndex - 1);
                worksheet.getCell(1, categoryStart).value = `category_${catId}`;
            }

        });

        // ==========================================
        // 3️⃣ DATA ROWS
        // ==========================================

        let rowIndex = 4;

        Object.keys(hospitals).forEach(hospitalName => {

            worksheet.getCell(rowIndex, 1).value = hospitalName;

            colIndex = 2;

            sortedCategories.forEach(catId => {

                const questions = Object.keys(structure[catId])
                    .sort((a, b) => Number(a) - Number(b));

                questions.forEach(qId => {

                    const subList = Object.keys(structure[catId][qId])
                        .sort((a, b) => Number(a) - Number(b));

                    subList.forEach(subId => {

                        const choiceList = Array
                            .from(structure[catId][qId][subId])
                            .sort((a, b) => Number(a) - Number(b));

                        choiceList.forEach(choiceId => {

                            const value =
                                hospitals[hospitalName]?.[catId]?.[qId]?.[subId]?.[choiceId] ?? 0;

                            worksheet.getCell(rowIndex, colIndex).value = value;
                            colIndex++;

                        });

                    });

                });

            });

            rowIndex++;
        });

        // ==========================================
        // 4️⃣ Formatting
        // ==========================================

        worksheet.columns.forEach(col => col.width = 16);
        worksheet.views = [{ state: "frozen", ySplit: 3 }];

        for (let r = 1; r <= 3; r++) {
            worksheet.getRow(r).font = { bold: true };
            worksheet.getRow(r).alignment = { horizontal: "center" };
        }

        // ==========================================
        // 5️⃣ Response
        // ==========================================

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=export_3level.xlsx"
        );

        await workbook.xlsx.write(res);
        res.end();

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};


exports.exportToExcelMulti_v2 = async (req, res) => {
    try {
        // ===============================
        // 1️⃣ รับค่า hcode
        // ===============================
        const hospCode = Array.isArray(req.body.hcode9)
            ? req.body.hcode9.map(h => String(h).trim()).filter(Boolean)
            : [];

        if (!hospCode.length) {
            return res.status(400).json({ message: "hcode9 is required" });
        }

        // ===============================
        // 2️⃣ Query Data หลัก
        // ===============================
        const data = await prisma.evaluate.findMany({
            where: {
                hospital_code: { in: hospCode },
                is_draft: false
            },
            include: {
                categories: true,
                questions: true,
                evaluateAnswers: {
                    include: { subQuestions: true }
                }
            }
        });

        if (!data.length) {
            return res.status(404).json({ message: "No data found" });
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Export");

        // ===============================
        // 3️⃣ Build Structure
        // ===============================
        const hospitals = {};
        const structure = {};
        const categoryNameMap = {};
        const questionNameMap = {};
        const subQuestionNameMap = {};

        function cleanSubQuestion(text) {
            if (!text) return text;
            const match = text.match(/^\d+(\.\d+)*/);
            return match ? match[0] : text;
        }

        data.forEach(evaluate => {
            const hospitalName = `${evaluate.hospital_name} (${evaluate.hospital_code})`;

            categoryNameMap[evaluate.category_id] =
                evaluate.categories?.category_name_th || `${evaluate.category_id}`;

            questionNameMap[evaluate.question_id] =
                evaluate.questions?.question_name || `${evaluate.question_id}`;

            evaluate.evaluateAnswers.forEach(answer => {
                const {
                    category_id,
                    question_id,
                    sub_question_id,
                    answer_id,
                    subQuestions
                } = answer;

                const choiceLabel = `${answer_id}`;

                if (sub_question_id) {
                    subQuestionNameMap[sub_question_id] =
                        subQuestions?.sub_quest_name || `${sub_question_id}`;
                }

                if (!hospitals[hospitalName]) hospitals[hospitalName] = {};
                if (!hospitals[hospitalName][category_id]) hospitals[hospitalName][category_id] = {};
                if (!hospitals[hospitalName][category_id][question_id]) hospitals[hospitalName][category_id][question_id] = {};
                if (!hospitals[hospitalName][category_id][question_id][sub_question_id])
                    hospitals[hospitalName][category_id][question_id][sub_question_id] = {};

                hospitals[hospitalName][category_id][question_id][sub_question_id][choiceLabel] = 1;

                if (!structure[category_id]) structure[category_id] = {};
                if (!structure[category_id][question_id]) structure[category_id][question_id] = {};
                if (!structure[category_id][question_id][sub_question_id])
                    structure[category_id][question_id][sub_question_id] = new Set();

                structure[category_id][question_id][sub_question_id].add(choiceLabel);
            });
        });

        const sortedCategories = Object.keys(structure).sort((a, b) => a - b);

        // ===============================
        // 4️⃣ HEADER
        // ===============================
        worksheet.getCell(1, 1).value = "Hospital";
        worksheet.mergeCells(1, 1, 3, 1);

        let colIndex = 2;

        sortedCategories.forEach(catId => {
            const questions = Object.keys(structure[catId]).sort((a, b) => a - b);
            let categoryStart = colIndex;

            questions.forEach(qId => {
                const subList = Object.keys(structure[catId][qId]).sort((a, b) => a - b);
                let questionStart = colIndex;

                subList.forEach(subId => {
                    const choiceList = Array.from(structure[catId][qId][subId]).sort();
                    const cleanName = cleanSubQuestion(subQuestionNameMap[subId] || "");

                    choiceList.forEach(choiceLabel => {
                        worksheet.getCell(3, colIndex).value = `${cleanName} - ${choiceLabel}`;
                        colIndex++;
                    });
                });

                worksheet.mergeCells(2, questionStart, 2, colIndex - 1);
                worksheet.getCell(2, questionStart).value = cleanSubQuestion(questionNameMap[qId]);
            });

            worksheet.mergeCells(1, categoryStart, 1, colIndex - 1);
            worksheet.getCell(1, categoryStart).value = categoryNameMap[catId];
        });

        // ===============================
        // 5️⃣ DATA ROWS
        // ===============================
        let rowIndex = 4;

        Object.keys(hospitals).forEach(hospitalName => {
            worksheet.getCell(rowIndex, 1).value = hospitalName;
            colIndex = 2;

            sortedCategories.forEach(catId => {
                const questions = Object.keys(structure[catId]).sort((a, b) => a - b);

                questions.forEach(qId => {
                    const subList = Object.keys(structure[catId][qId]).sort((a, b) => a - b);

                    subList.forEach(subId => {
                        const choiceList = Array.from(structure[catId][qId][subId]).sort();

                        choiceList.forEach(choiceLabel => {
                            const value =
                                hospitals[hospitalName]?.[catId]?.[qId]?.[subId]?.[choiceLabel] ?? 0;
                            worksheet.getCell(rowIndex, colIndex).value = value;
                            colIndex++;
                        });
                    });
                });
            });

            rowIndex++;
        });

        // ===============================
        // 6️⃣ Formatting sheet Export
        // ===============================
        worksheet.columns.forEach(col => col.width = 20);
        worksheet.views = [{ state: "frozen", ySplit: 3 }];

        for (let r = 1; r <= 3; r++) {
            worksheet.getRow(r).font = { bold: true };
            worksheet.getRow(r).alignment = {
                horizontal: "center",
                vertical: "middle",
                wrapText: true
            };
        }

        // =====================================================
        // 7️⃣ เพิ่ม Sheet Choice_text
        // =====================================================
        const choiceList = await prisma.answer.findMany({
            select: {
                id: true,
                choice_text: true
            },
            orderBy: { id: "asc" }
        });

        const choiceSheet = workbook.addWorksheet("Choice_text");

        choiceSheet.columns = [
            { header: "Answer ID", key: "id", width: 20 },
            { header: "Choice Text", key: "choice_text", width: 60 }
        ];

        choiceList.forEach(c => {
            choiceSheet.addRow({
                id: c.id,
                choice_text: c.choice_text || ""
            });
        });

        choiceSheet.getRow(1).font = { bold: true };
        choiceSheet.views = [{ state: "frozen", ySplit: 1 }];

        // ===============================
        // 8️⃣ Response Excel
        // ===============================
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            "attachment; filename=export_detail_all.xlsx"
        );

        await workbook.xlsx.write(res);
        res.end();

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
};


exports.exportToExcelMulti_v3 = async (req, res) => {
    try {
        const hospCode = Array.isArray(req.body.hcode9)
            ? req.body.hcode9.map(h => String(h).trim()).filter(Boolean)
            : [];

        if (!hospCode.length) {
            return res.status(400).json({ message: "hcode9 is required" });
        }

        // ===============================
        // 🔥 SORT STEP (เทพจริง)
        // ===============================
        const deepSort = (a, b) => {
            const pa = String(a).split('.').map(Number);
            const pb = String(b).split('.').map(Number);

            const len = Math.max(pa.length, pb.length);

            for (let i = 0; i < len; i++) {
                const na = pa[i] ?? -1;
                const nb = pb[i] ?? -1;
                if (na !== nb) return na - nb;
            }
            return 0;
        };

        // ===============================
        // QUERY
        // ===============================
        const data = await prisma.evaluate.findMany({
            where: {
                hospital_code: { in: hospCode },
                is_draft: false,
                approveAnswers: {
                    some: {
                        prov_status: {
                            in: ['PASS', 'FAIL']
                        }
                    }
                }
            },
            select: {
                hospital_code: true,
                hospital_name: true,
                category_id: true,
                question_id: true,
                categories: { select: { category_name_th: true } },
                questions: { select: { question_name: true } },
                evaluateAnswers: {
                    select: {
                        category_id: true,
                        question_id: true,
                        sub_question_id: true,
                        answer_id: true,
                        subQuestions: {
                            select: { sub_quest_name: true }
                        }
                    }
                },
                approveAnswers: {
                    select: {
                        evaluate_id: true,
                        category_id: true,
                        question_id: true,
                        sub_question_id: true,
                        hospital_code: true,
                        prov_status: true,
                        zone_status: true,
                        user_id: true
                    }
                }
            }
        });

        if (!data.length) {
            return res.status(404).json({ message: "No data found" });
        }

        const workbook = new ExcelJS.Workbook();

        // ===============================
        // 🔥 ADD CHOICE SHEET
        // ===============================
        const choiceList = await prisma.answer.findMany({
            select: {
                id: true,
                choice_text: true
            },
            orderBy: { id: "asc" }
        });

        const hospitals = new Map();
        const structure = new Map();

        const categoryNameMap = new Map();
        const questionNameMap = new Map();
        const subQuestionNameMap = new Map();

        const cleanSubQuestion = (text) => {
            if (!text) return text;
            const match = text.match(/^\d+(\.\d+)*/);
            return match ? match[0] : text;
        };

        const safeSheetName = (name) =>
            (name || "Sheet").replace(/[:\\/?*\[\]]/g, "").substring(0, 31);

        // ===============================
        // BUILD
        // ===============================
        for (const evaluate of data) {

            const hospitalName = `${evaluate.hospital_name} (${evaluate.hospital_code})`;

            categoryNameMap.set(
                evaluate.category_id,
                evaluate.categories?.category_name_th || `${evaluate.category_id}`
            );

            questionNameMap.set(
                evaluate.question_id,
                evaluate.questions?.question_name || `${evaluate.question_id}`
            );

            if (!hospitals.has(hospitalName)) {
                hospitals.set(hospitalName, new Map());
            }

            for (const ans of evaluate.evaluateAnswers) {

                const {
                    category_id,
                    question_id,
                    sub_question_id,
                    answer_id,
                    subQuestions
                } = ans;

                const choice = String(answer_id);

                if (sub_question_id) {
                    subQuestionNameMap.set(
                        sub_question_id,
                        subQuestions?.sub_quest_name || `${sub_question_id}`
                    );
                }

                // hospitals
                if (!hospitals.get(hospitalName).has(category_id)) {
                    hospitals.get(hospitalName).set(category_id, new Map());
                }

                const catMap = hospitals.get(hospitalName).get(category_id);

                if (!catMap.has(question_id)) {
                    catMap.set(question_id, new Map());
                }

                const qMap = catMap.get(question_id);

                if (!qMap.has(sub_question_id)) {
                    qMap.set(sub_question_id, new Map());
                }

                qMap.get(sub_question_id).set(choice, 1);

                // structure
                if (!structure.has(category_id)) {
                    structure.set(category_id, new Map());
                }

                const sCat = structure.get(category_id);

                if (!sCat.has(question_id)) {
                    sCat.set(question_id, new Map());
                }

                const sQ = sCat.get(question_id);

                if (!sQ.has(sub_question_id)) {
                    sQ.set(sub_question_id, new Set());
                }

                sQ.get(sub_question_id).add(choice);
            }
        }

        // ===============================
        // CREATE SHEETS
        // ===============================
        for (const [catId, qMap] of structure) {

            const ws = workbook.addWorksheet(
                safeSheetName(categoryNameMap.get(catId))
            );

            const header1 = ["ชื่อหน่วยบริการ"];
            const header2 = [""];
            const header3 = [""];

            // 🔥 SORT question
            const sortedQ = [...qMap.entries()]
                .sort((a, b) => deepSort(a[0], b[0]));

            for (const [qId, subMap] of sortedQ) {

                const qName = cleanSubQuestion(questionNameMap.get(qId));

                // 🔥 SORT sub
                const sortedSub = [...subMap.entries()]
                    .sort((a, b) => deepSort(a[0], b[0]));

                for (const [subId, choices] of sortedSub) {

                    const subName = cleanSubQuestion(
                        subQuestionNameMap.get(subId) || ""
                    );

                    // 🔥 SORT choice
                    const sortedChoices = [...choices]
                        .sort((a, b) => deepSort(a, b));

                    for (const choice of sortedChoices) {
                        header1.push(categoryNameMap.get(catId));
                        header2.push(qName);
                        header3.push(`${subName} - ${choice}`);
                    }
                }
            }

            ws.addRow(header1);
            ws.addRow(header2);
            ws.addRow(header3);

            // ===============================
            // MERGE
            // ===============================
            ws.mergeCells(1, 1, 3, 1);

            let colIndex = 2;

            for (const [qId, subMap] of sortedQ) {

                let startQ = colIndex;

                const sortedSub = [...subMap.entries()]
                    .sort((a, b) => deepSort(a[0], b[0]));

                for (const [subId, choices] of sortedSub) {

                    const sortedChoices = [...choices]
                        .sort((a, b) => deepSort(a, b));

                    colIndex += sortedChoices.length;
                }

                ws.mergeCells(2, startQ, 2, colIndex - 1);
            }

            ws.mergeCells(1, 2, 1, colIndex - 1);

            // ===============================
            // DATA
            // ===============================
            for (const [hospitalName, catMap] of hospitals) {

                const row = [hospitalName];

                for (const [qId, subMap] of sortedQ) {

                    const sortedSub = [...subMap.entries()]
                        .sort((a, b) => deepSort(a[0], b[0]));

                    for (const [subId, choices] of sortedSub) {

                        const sortedChoices = [...choices]
                            .sort((a, b) => deepSort(a, b));

                        for (const choice of sortedChoices) {

                            const val =
                                catMap?.get(catId)
                                    ?.get(qId)
                                    ?.get(subId)
                                    ?.get(choice) || 0;

                            row.push(val);
                        }
                    }
                }

                ws.addRow(row);
            }

            // STYLE
            for (let r = 1; r <= 3; r++) {
                ws.getRow(r).font = { bold: true };
                ws.getRow(r).alignment = {
                    horizontal: "center",
                    vertical: "middle",
                    wrapText: true
                };
            }

            ws.views = [{ state: "frozen", ySplit: 3 }];
        }

        const choiceSheet = workbook.addWorksheet("Choice_text");

        choiceSheet.columns = [
            { header: "Answer ID", key: "id", width: 20 },
            { header: "Choice Text", key: "choice_text", width: 60 }
        ];

        choiceList.forEach(c => {
            choiceSheet.addRow({
                id: c.id,
                choice_text: c.choice_text || ""
            });
        });

        // style
        choiceSheet.getRow(1).font = { bold: true };
        choiceSheet.getRow(1).alignment = { horizontal: "center" };
        choiceSheet.views = [{ state: "frozen", ySplit: 1 }];

        // ===============================
        // EXPORT
        // ===============================
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            "attachment; filename=export_multi_category.xlsx"
        );

        await workbook.xlsx.write(res);
        res.end();

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.exportToExcelMulti_v4 = async (req, res) => {
    try {
        // =========================
        // 0. PREPARE INPUT
        // =========================
        const hospCode = (req.body.hcode9 || [])
            .map(h => String(h).trim())
            .filter(h => /^[A-Za-z0-9]+$/.test(h));

        if (!hospCode.length) {
            return res.json({ success: false, message: "No hospital code" });
        }

        // =========================
        // 1. QUERY TEMPLATE
        // =========================
        const templateSql = `
            SELECT
                c.id AS category_id,
                c.category_name_th,
                q.id AS question_id,
                q.question_number,
                sq.id AS sub_quest_id,
                sq.sub_quest_number,
                a.id AS answer_id
            FROM Category c
            LEFT JOIN Question q ON c.id = q.category_id
            LEFT JOIN Sub_quest sq ON c.id = sq.category_id AND q.id = sq.question_id
            LEFT JOIN Choice ch 
                ON ch.category_id = c.id 
                AND ch.question_id = q.id 
                AND ch.sub_question_id = sq.id
            LEFT JOIN Answer a ON a.choice_id = ch.id
            WHERE a.id IS NOT NULL
            ORDER BY c.id, q.id, sq.id, a.id
        `;

        const templateData = await prisma.$queryRawUnsafe(templateSql);

        // =========================
        // 2. QUERY VALUE (SAFE PLACEHOLDER)
        // =========================
        const placeholders = hospCode.map(() => '?').join(',');

        const valueSql = `
            SELECT
                e.hospital_code,
                e.hospital_name,
                e.category_id,
                e.question_id,
                ea.sub_question_id,
                ea.answer_id
            FROM Evaluate e
            LEFT JOIN EvaluateAnswer ea ON ea.evaluate_id = e.id
            WHERE e.is_draft = false
            AND e.hospital_code IN (${placeholders})
            AND EXISTS (
                SELECT 1
                FROM Approve_answers ap
                WHERE ap.evaluate_id = e.id
                AND ap.prov_status IN ('PASS', 'FAIL')
            )
            ORDER BY 
                e.hospital_code,
                e.category_id,
                e.question_id,
                ea.sub_question_id
        `;

        const valueData = await prisma.$queryRawUnsafe(valueSql, ...hospCode);

        // =========================
        // 3. BUILD COLUMN STRUCTURE
        // =========================
        const columns = [];
        const columnMap = new Map();

        templateData.forEach(row => {
            const key = `${row.category_id}|${row.question_id}|${row.sub_quest_id}|${row.answer_id}`;

            if (!columnMap.has(key)) {
                columnMap.set(key, columns.length);

                columns.push({
                    key,
                    category_id: row.category_id,
                    category_name_th: row.category_name_th,
                    question_id: row.question_id,
                    question_number: row.question_number,
                    sub_quest_id: row.sub_quest_id,
                    sub_quest_number: row.sub_quest_number,
                    answer_id: row.answer_id
                });
            }
        });

        // =========================
        // 4. GROUP VALUE DATA
        // =========================
        const hospitalMap = new Map();

        valueData.forEach(row => {
            const hKey = row.hospital_code;

            if (!hospitalMap.has(hKey)) {
                hospitalMap.set(hKey, {
                    hospital_name: row.hospital_name,
                    hospital_code: row.hospital_code,
                    answers: new Set()
                });
            }

            const key = `${row.category_id}|${row.question_id}|${row.sub_question_id}|${row.answer_id}`;
            hospitalMap.get(hKey).answers.add(key);
        });

        // =========================
        // 5. CREATE EXCEL (MULTI SHEET)
        // =========================
        const workbook = new ExcelJS.Workbook();

        const groupBy = (arr, key) =>
            arr.reduce((acc, cur) => {
                acc[cur[key]] = acc[cur[key]] || [];
                acc[cur[key]].push(cur);
                return acc;
            }, {});

        // 👉 group category
        const catGroup = groupBy(columns, "category_name_th");

        // =========================
        // LOOP CREATE SHEET
        // =========================
        Object.entries(catGroup).forEach(([cat, catColumns]) => {

            const worksheet = workbook.addWorksheet(cat.substring(0, 31)); // Excel จำกัด 31 char

            worksheet.views = [{ state: 'frozen', xSplit: 2, ySplit: 4 }];

            // FIXED HEADER
            worksheet.mergeCells("A1:A4");
            worksheet.mergeCells("B1:B4");

            worksheet.getCell("A1").value = "ชื่อหน่วยบริการ";
            worksheet.getCell("B1").value = "รหัสหน่วยบริการ 9 หลัก";

            let colIndex = 3;

            // =========================
            // HEADER (เฉพาะ category นี้)
            // =========================
            const qGroup = groupBy(catColumns, "question_number");

            Object.entries(qGroup).forEach(([q, sqList]) => {
                const qStart = colIndex;

                const sqGroup = groupBy(sqList, "sub_quest_number");

                Object.entries(sqGroup).forEach(([sq, ansList]) => {
                    const sqStart = colIndex;

                    ansList.forEach(col => {
                        worksheet.getCell(4, colIndex).value = col.answer_id;
                        colIndex++;
                    });

                    const sqEnd = colIndex - 1;
                    if (sqStart <= sqEnd) {
                        worksheet.mergeCells(3, sqStart, 3, sqEnd);
                        worksheet.getCell(3, sqStart).value = sq;
                    }
                });

                const qEnd = colIndex - 1;
                if (qStart <= qEnd) {
                    worksheet.mergeCells(2, qStart, 2, qEnd);
                    worksheet.getCell(2, qStart).value = q;
                }
            });

            // 🔹 row 1 = category (เต็ม sheet)
            if (colIndex > 3) {
                worksheet.mergeCells(1, 3, 1, colIndex - 1);
                worksheet.getCell(1, 3).value = cat;
            }

            // =========================
            // FILL DATA
            // =========================
            let rowIndex = 5;

            hospitalMap.forEach(h => {
                worksheet.getCell(rowIndex, 1).value = h.hospital_name;
                worksheet.getCell(rowIndex, 1).alignment = { horizontal: "left", vertical: "middle" };
                worksheet.getCell(rowIndex, 2).value = h.hospital_code;

                catColumns.forEach((col, i) => {
                    const val = h.answers.has(col.key) ? "1" : "0";
                    worksheet.getCell(rowIndex, i + 3).value = val;
                });

                rowIndex++;
            });

            // =========================
            // STYLE
            // =========================
            worksheet.eachRow(row => {
                row.eachCell(cell => {
                    if (!cell.alignment) {
                        cell.alignment = { vertical: "middle", horizontal: "center" };
                    }
                });
            });

        });

        const choiceData = await prisma.answer.findMany({});

        const choiceSheet = workbook.addWorksheet("Choice_text");

        // HEADER
        choiceSheet.columns = [
            { header: "answer_id", key: "answer_id", width: 15 },
            { header: "choice_text", key: "choice_text", width: 40 },
            { header: "choice_value", key: "choice_value", width: 15 },
            { header: "choice_required", key: "choice_required", width: 20 }
        ];

        // DATA
        choiceData.forEach(row => {
            choiceSheet.addRow({
                answer_id: row.id,
                choice_text: row.choice_text ?? "",
                choice_value: row.choice_value ?? 0,
                choice_required: row.choice_required ?? 0
            });
        });

        // =========================
        // 9. EXPORT
        // =========================
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            "attachment; filename=export.xlsx"
        );

        await workbook.xlsx.write(res);
        res.end();

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
};


exports.testQueryDataFromProvApprove = async (req, res) => {
    try {
        const data = await prisma.$queryRawUnsafe(`
            SELECT 
                e.hospital_code,
                e.hospital_name,
                e.category_id,
                e.question_id,
                ea.sub_question_id,
                ea.answer_id,
                aa.prov_status,
                aa.zone_status,
                aa.user_id
            FROM Evaluate e
            INNER JOIN EvaluateAnswer ea 
                ON e.id = ea.evaluate_id
                AND e.category_id = ea.category_id
                AND e.question_id = ea.question_id
            INNER JOIN Approve_answers aa
                ON aa.evaluate_id = ea.evaluate_id
                AND aa.category_id = ea.category_id
                AND aa.question_id = ea.question_id
                AND aa.sub_question_id = ea.sub_question_id
                AND aa.hospital_code = e.hospital_code
            WHERE 
                e.is_draft = 0
                AND aa.prov_status IN ('PASS', 'FAIL')
            ORDER BY hospital_code, category_id, question_id, sub_question_id ASC
            `);

        res.json({
            success: true,
            count: data.length,
            data: data
        });

    } catch (err) {
        console.error('Error testQueryDataFromProvApprove:', err);
        res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};

exports.queryResultForexportExcel = async (req, res) => {
    try {
        const hospCode = Array.isArray(req.body.hcode9)
            ? req.body.hcode9.map(h => `'${String(h).trim()}'`).filter(Boolean)
            : [];

        if (!hospCode.length) {
            return res.json({ success: true, count: 0, data: [] });
        }

        const sql = `
            SELECT
                e.hospital_code,
                e.hospital_name,
                e.category_id,
                c.category_name_th,    
                e.question_id,
                q.question_number,
                ea.sub_question_id,
                sq.sub_quest_number,
                ea.answer_id
            FROM Evaluate e
            LEFT JOIN Category c ON e.category_id = c.id
            LEFT JOIN Question q ON e.question_id = q.id
            LEFT JOIN EvaluateAnswer ea ON ea.evaluate_id = e.id
            LEFT JOIN Sub_quest sq ON ea.sub_question_id = sq.id
            WHERE e.is_draft = false 
            AND e.hospital_code IN (${hospCode.join(",")})
            AND EXISTS (
                SELECT 1
                FROM Approve_answers ap
                WHERE ap.evaluate_id = e.id
                AND ap.prov_status IN ('PASS', 'FAIL')
            )
            ORDER BY 
                e.hospital_code,
                e.category_id,
                e.question_id,
                ea.sub_question_id
        `;

        const data = await prisma.$queryRawUnsafe(sql);

        res.json({
            success: true,
            count: data.length,
            data: data
        });
    } catch (err) {
        console.error('Error testAPI2:', err);
        res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};

exports.queryForTemplateExcelExport = async (req, res) => {
    try {

        const sql = `
            SELECT
                c.id AS category_id,
                c.category_name_th,
                q.id AS question_id,
                q.question_number,
                q.question_name,
                sq.id AS sub_quest_id,
                sq.sub_quest_number,
                sq.sub_quest_name,
                ch.answer_id,
                ch.choice_text,
                ch.choice_value,
                ch.choice_required
            FROM Category AS c
            LEFT JOIN Question AS q 
            ON c.id = q.category_id
            LEFT JOIN Sub_quest AS sq 
            ON c.id = sq.category_id AND q.id = sq.question_id
            LEFT JOIN (SELECT 
                        ch.id,
                        ch.category_id,
                        ch.question_id,
                        ch.sub_question_id,
                        a.id AS answer_id,
                        a.choice_id,
                        a.choice_text,
                        a.choice_value,
                        a.choice_required
                    FROM Choice AS ch 
                    INNER JOIN Answer AS a 
                    ON ch.id = a.choice_id) AS ch
            ON sq.category_id = ch.category_id AND sq.question_id = ch.question_id AND sq.id = ch.sub_question_id
            ORDER BY c.id,question_id,sub_quest_id ASC
        `;

        const data = await prisma.$queryRawUnsafe(sql);

        res.json({
            success: true,
            count: data.length,
            data: data
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
}