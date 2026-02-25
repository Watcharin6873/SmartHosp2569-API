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
            ? req.body.hcode9.map(h => h.trim()).filter(Boolean)
            : [];

        if (!hospCode.length) {
            return res.status(400).json({ message: "hcode9 is required" });
        }

        // ===============================
        // 2️⃣ Query Data (include choice text)
        // ===============================
        const data = await prisma.evaluate.findMany({
            where: {
                hospital_code: {
                    in: hospCode
                },
                is_draft: false
            },
            include: {
                categories: true,
                questions: true,
                evaluateAnswers: {
                    include: {
                        subQuestions: true
                    }
                }
            }
        });

        // console.log("Data: ", data);

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

        function truncateText(text, maxLength) {
            if (!text || text.length <= maxLength) return text;

            const trimmed = text.slice(0, maxLength);
            return trimmed.slice(0, trimmed.lastIndexOf(" ")) + "...";
        }

        function cleanSubQuestion(text) {
            if (!text) return text;

            const match = text.match(/^\d+(\.\d+)*/);
            return match ? match[0] : text;
        }

        data.forEach(evaluate => {

            const hospitalName =
                `${evaluate.hospital_name} (${evaluate.hospital_code})`;

            const categoryId = evaluate.category_id;
            const questionId = evaluate.question_id;

            // เก็บชื่อ category
            categoryNameMap[categoryId] =
                evaluate.categories?.category_name_th || `${categoryId}`;

            // เก็บชื่อ question
            questionNameMap[questionId] =
                evaluate.questions?.question_name || `${questionId}`;

            evaluate.evaluateAnswers.forEach(answer => {

                const {
                    category_id,
                    question_id,
                    sub_question_id,
                    choice_id,
                    answer_id,
                    subQuestions
                } = answer;

                const choiceLabel = `${answer_id}`;

                // เก็บชื่อ sub question
                if (sub_question_id) {
                subQuestionNameMap[sub_question_id] =
                    subQuestions?.sub_quest_name || `${sub_question_id}`;
                }

                // -------------------------
                // hospital map
                // -------------------------
                if (!hospitals[hospitalName]) hospitals[hospitalName] = {};
                if (!hospitals[hospitalName][category_id])
                    hospitals[hospitalName][category_id] = {};
                if (!hospitals[hospitalName][category_id][question_id])
                    hospitals[hospitalName][category_id][question_id] = {};
                if (!hospitals[hospitalName][category_id][question_id][sub_question_id])
                    hospitals[hospitalName][category_id][question_id][sub_question_id] = {};

                hospitals[hospitalName][category_id][question_id][sub_question_id][choiceLabel] = 1;

                // -------------------------
                // global structure
                // -------------------------
                if (!structure[category_id]) structure[category_id] = {};
                if (!structure[category_id][question_id])
                    structure[category_id][question_id] = {};
                if (!structure[category_id][question_id][sub_question_id])
                    structure[category_id][question_id][sub_question_id] = new Set();

                structure[category_id][question_id][sub_question_id].add(choiceLabel);

            });

        });

        const sortedCategories = Object.keys(structure).sort((a, b) => a - b);

        // ===============================
        // 4️⃣ HEADER ชั้นที่ 3
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

                    const choiceList = Array
                        .from(structure[catId][qId][subId])
                        .sort();

                    const rawName = subQuestionNameMap[subId] || "";
                    const cleanName = cleanSubQuestion(rawName);

                    choiceList.forEach(choiceLabel => {
                        worksheet.getCell(3, colIndex).value =
                            `${cleanName} - ${choiceLabel}`;
                        colIndex++;
                    });

                });
                // ===============================
                // 4️⃣ HEADER ชั้นที่ 2
                // ===============================

                worksheet.mergeCells(2, questionStart, 2, colIndex - 1);
                worksheet.getCell(2, questionStart).value = cleanSubQuestion(questionNameMap[qId]);

            });
            // ===============================
            // 4️⃣ HEADER ชั้นที่ 1
            // ===============================
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

                        const choiceList = Array
                            .from(structure[catId][qId][subId])
                            .sort();

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
        // 6️⃣ Formatting
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

        // ===============================
        // 7️⃣ Response
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