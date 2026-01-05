const prisma = require('../Config/Prisma');
const fs = require('fs');

// Upload File evidence
exports.uploadEvidenceFile = async (req, res) => {
    try {
        // Code
        const data = req.body;
        data.file_ev = req.file.filename;

        const evidence = await prisma.evidence_all.create({
            data: {
                category_id: parseInt(data.category_id),
                file_ev: data.file_ev,
                hcode9: data.hcode9,
                user_id: parseInt(data.user_id)
            }
        })

        if (evidence) return res.status(200).json({
            message: `Upload file สำเร็จ!!`,
            filename: req.file.filename
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: `Server error!` })
    }
}

// Get list Evidence all
exports.getListEvidence = async (req, res) =>{
    try {
        // Code
        const results = await prisma.evidence_all.findMany();

        if (results) return res.status(200).json(results);
        
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: `Server error!` })
    }
}

// Get All Evidence Files
exports.getEvidenceFiles = async (req, res) => {
    try {
        // Code
        const {hcode9, category_id} = req.query;
        const results = await prisma.evidence_all.findFirst({
            where: {
                hcode9: hcode9,
                category_id: parseInt(category_id)
            }
        });
        
        if (results) return res.status(200).json(results);

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: `Server error!` })
    }
}

// Remove evidence file
exports.removeEvidenceFile = async (req, res) =>{
    try {
        // Code
        const {id} = req.params;
        const find = await prisma.evidence_all.findFirst({
            where:{id: parseInt(id)}
        });

        fs.unlinkSync(`evidence_files/${find.file_ev}`);

        const removed = await prisma.evidence_all.delete({
            where: {id: parseInt(id)}
        });

        if (removed) return res.status(200).json({message: `ลบหลักฐานเรียบร้อย!!`});

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: `Server error!` })
    }
}

