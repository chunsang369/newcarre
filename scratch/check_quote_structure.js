const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkQuoteStructure() {
  try {
    const latestQuote = await prisma.quoteRequest.findFirst({
      orderBy: { createdAt: "desc" },
    });

    console.log("=== Latest Quote Request Structure ===");
    if (latestQuote) {
      console.log(JSON.stringify(latestQuote, null, 2));
    } else {
      console.log("No quote requests found in the database.");
    }
  } catch (error) {
    console.error("Error fetching quotes:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkQuoteStructure();
