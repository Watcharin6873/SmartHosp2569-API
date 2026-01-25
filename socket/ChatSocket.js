const prisma = require('../Config/Prisma')

exports.chatSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('Socket connected:', socket.user.id)

        // ================= JOIN ROOM =================
        socket.on('join-room', async (roomId) => {
            const room = await prisma.chatRoom.findUnique({
                where: { id: Number(roomId) }
            })

            if (!room) return

            // ACL
            if (
                room.room_type === 'HOSPITAL_PROVINCE' &&
                socket.user.province_code !== room.province_code
            ) return

            if (
                room.room_type === 'PROVINCE_ZONE' &&
                socket.user.zone !== room.zone_code
            ) return

            socket.join(`room-${roomId}`)
            console.log(`User ${socket.user.id} joined room ${roomId}`)
        })

        // ================= SEND MESSAGE =================
        socket.on('send-message', async ({ room_id, content }) => {
            if (!content) return

            const message = await prisma.chatMessage.create({
                data: {
                    room_id: Number(room_id),
                    sender_id: socket.user.id,
                    content
                },
                include: {
                    sender: {
                        select: { id: true, user_type: true }
                    }
                }
            })

            io.to(`room-${room_id}`).emit('new-message', message)
        })

        // ================= DISCONNECT =================
        socket.on('disconnect', () => {
            console.log('Socket disconnected:', socket.user.id)
        })
    })
}
