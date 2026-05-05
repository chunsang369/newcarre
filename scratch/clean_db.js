const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanDB() {
    console.log("=== 기존 쓰레기 데이터 및 중복 데이터 전체 삭제 중 ===");
    const res = await prisma.car.deleteMany({});
    console.log(`✅ 삭제 완료: ${res.count}대 차량 삭제됨`);
}

cleanDB().catch(console.error).finally(() => prisma.$disconnect());
