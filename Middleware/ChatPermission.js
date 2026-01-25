exports.canAccessRoom = (user, room) => {
    if (!user || !room) return false;

    if (room.room_type === 'HOSPITAL_PROVINCE') {
        return (
            user.province_code === room.province_code &&
            ['Unit_service', 'Prov'].includes(user.user_type)
        );
    }

    if (room.room_type === 'PROVINCE_REGION') {
        return (
            user.zone === room.zone_code && 
            ['Prov', 'Zone'].includes(user.user_type)
        );
    }

    return false;
}