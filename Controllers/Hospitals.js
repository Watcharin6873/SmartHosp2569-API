const prisma = require('../Config/Prisma');

// Get all hospitals
exports.getListHospitals = async (req, res) => {
    try {
        // Code
        const listType = ['โรงพยาบาลศูนย์', 'โรงพยาบาลทั่วไป', 'โรงพยาบาลชุมชน', 'หน่วยงานทดสอบ']; //, 'หน่วยงานทดสอบ'
        const listHcode9 = ['EA0053964', 'EA0043735', 'EA0052478'];

        const results = await prisma.hospitals.findMany({
            where: {
                AND: [
                    {
                        dept_type: {
                            in: listType
                        }
                    },
                    {
                        hcode9: {
                            notIn: listHcode9
                        }
                    }
                ]
            }
        });

        if (results) return res.status(200).json(results);
        
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: `Server error!!` })
    }
}