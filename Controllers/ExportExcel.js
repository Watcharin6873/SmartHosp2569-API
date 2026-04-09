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
                approveAnswers:{
                    select:{
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