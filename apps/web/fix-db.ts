import { prisma } from "@clinixpro/database";

async function fix() {
    // Fix the cadet profile that was created before the real Clerk integration
    await prisma.profile.updateMany({
        where: {
            email: "cadetengeslamhassan@gmail.com",
            id: { startsWith: "pending_" }
        },
        data: {
            id: "user_3ADs1emvu3ditJ1CVSwtwsYArsC"
        }
    });
    console.log("Fixed DB mapped ID for cadetengeslamhassan@gmail.com");
}

fix().catch(console.error).finally(() => prisma.$disconnect());
