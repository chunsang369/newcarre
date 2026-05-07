const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function runRealMigration() {
  console.log("🛠️ Starting Actual Data Migration...\n");

  try {
    const quotes = await prisma.quoteRequest.findMany();
    console.log(`Total quotes to process: ${quotes.length}`);

    let successCount = 0;
    let failCount = 0;

    for (const quote of quotes) {
      const text = quote.carOfInterest;
      if (!text) continue;

      // Regex patterns
      const carMatch = text.match(/^\[(.*?)\]/);
      const trimMatch = text.match(/트림:\s*(.*?)(?=\n|$)/);
      const extMatch = text.match(/외장:\s*(.*?)(?=\n|$)/);
      const intMatch = text.match(/내장:\s*(.*?)(?=\n|$)/);
      const optMatch = text.match(/옵션:\s*(.*?)(?=\n|$)/);
      const condMatch = text.match(/조건:\s*(.*?)(?=\n|$)/);

      if (carMatch && trimMatch) {
        // Deep parsing for contract
        const condRaw = condMatch ? condMatch[1] : "";
        const monthsMatch = condRaw.match(/(\d+)개월/);
        const mileageMatch = condRaw.match(/연\s*([\d,]+)km/);
        const depositMatch = condRaw.match(/(선수금|보증금)\s*(\d+)%/);

        const config = {
          carName: carMatch[1],
          trim: trimMatch[1],
          exteriorColor: extMatch ? { name: extMatch[1] } : null,
          interiorColor: intMatch ? { name: intMatch[1] } : null,
          options: optMatch ? optMatch[1].split(",").map(s => s.trim()).filter(s => s !== "없음") : [],
          contract: {
            type: condRaw.includes("렌트") ? "RENT" : condRaw.includes("리스") ? "LEASE" : "UNKNOWN",
            months: monthsMatch ? parseInt(monthsMatch[1]) : null,
            mileage: mileageMatch ? parseInt(mileageMatch[1].replace(/,/g, "")) : null,
            deposit: depositMatch ? parseInt(depositMatch[2]) : 0,
            raw: condRaw
          }
        };

        // Update DB
        await prisma.quoteRequest.update({
          where: { id: quote.id },
          data: { carConfig: config }
        });

        successCount++;
      } else {
        failCount++;
      }
    }

    console.log("\n" + "=".repeat(40));
    console.log("🏁 Migration Completed");
    console.log("=".repeat(40));
    console.log(`✅ Updated: ${successCount}`);
    console.log(`❌ Skipped (No match): ${failCount}`);
    console.log("=".repeat(40));

    // Verification Sample
    const samples = await prisma.quoteRequest.findMany({
      where: { NOT: { carConfig: null } },
      take: 3
    });

    console.log("\n🔍 Post-Migration Verification (Samples):");
    samples.forEach((s, i) => {
      console.log(`\nSample ${i + 1}:`);
      console.log(`Original: ${s.carOfInterest.split("\n")[0]}`);
      console.log(`Config: ${JSON.stringify(s.carConfig, null, 2)}`);
    });

  } catch (error) {
    console.error("Critical error during migration:", error);
  } finally {
    await prisma.$disconnect();
  }
}

runRealMigration();
