const prisma = require('../Config/Prisma');
const { canAccessRoom } = require('./ChatPermission');

exports.checkChatRoomAccess = async (req, res, next) => {
    try {
        const roomId =
            req.params.roomId || req.body.room_id;

        if (!roomId) {
            return res.status(400).json({
                message: 'roomId is required'
            });
        }

        const userId = req.user.id;

        const room = await prisma.chatRoom.findUnique({
            where: {
                id: Number(roomId)
            }
        });

        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        const isMember = await prisma.chatRoomMember.findFirst({
            where: {
                room_id: Number(roomId),
                user_id: userId
            }
        });

        if (!isMember) {
            return res.status(403).json({ message: 'No access to this room' });
        }

        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Access check failed' });
    }
};
