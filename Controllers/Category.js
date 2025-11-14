const prisma = require('../Config/Prisma');

// Create
exports.createCategory = async (req, res) => {
    try {
        // Code
        const {
            topic_id,
            category_name_th,
            category_name_eng,
            fiscal_year,
            user_id
        } = req.body;

        const category = await prisma.category.create({
            data: {
                topic_id: parseInt(topic_id),
                category_name_th: category_name_th,
                category_name_eng: category_name_eng,
                fiscal_year: fiscal_year,
                user_id: parseInt(user_id)
            }
        });

        if (category) return res.status(200).json({ message: `บันทึกข้อมูลสำเร็จ!!` })

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: `Server error!` })
    }
}

// Get list
exports.getListCategory = async (req, res) => {
    try {
        // Code
        const category = await prisma.category.findMany();
        if (category) return res.status(200).json(category)
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: `Server error!` })
    }
}

// Get by id
exports.getCategoryById = async (req, res) => {
    try {
        // Code
        const { id } = req.params;

        const category = await prisma.category.findFirst({
            where: {
                id: parseInt(id)
            },
            select: {
                id: true,
                topic_id: true,
                category_name_th: true,
                category_name_eng: true,
                fiscal_year: true,
                user_id: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (category) return res.status(200).json(category);

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: `Server error!` })
    }
}

// Update
exports.updateCategory = async (req, res) => {
    try {
        // Code
        const {
            id,
            topic_id,
            category_name_th,
            category_name_eng,
            fiscal_year,
            user_id,
        } = req.body;

        const category = await prisma.category.update({
            where: {
                id: parseInt(id)
            },
            data: {
                topic_id: parseInt(topic_id),
                category_name_th: category_name_th,
                category_name_eng: category_name_eng,
                fiscal_year: fiscal_year,
                user_id: parseInt(user_id),
                updatedAt: new Date()
            }
        });

        if (category) return res.status(200).json({message: `แก้ไขข้อมูลสำเร็จ!!`});

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: `Server error!` })
    }
}

// Delete
exports.deleteCategory = async (req, res) => {
    try {
        // Code
        const {id} = req.params;

        const category = await prisma.category.delete({
            where:{
                id: parseInt(id)
            }
        });

        if (category) return res.status(200).json({message: `ลบข้อมูลสำเร็จ!!`});
        
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: `Server error!` })
    }
}