const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function dryRunMigration() {
  console.log("🚀 Starting Migration Dry-run...\n");

  try {
    const quotes = await prisma.quoteRequest.findMany();
    console.log(`Total quotes found: ${quotes.length}`);

    let successCount = 0;
    let failCount = 0;
    const parsedResults = [];

    for (const quote of quotes) {
      const text = quote.carOfInterest;
      if (!text) {
        failCount++;
        continue;
      }

      // Regex patterns
      const carMatch = text.match(/^\[(.*?)\]/);
      const trimMatch = text.match(/트림:\s*(.*?)(?=\n|$)/);
      const extMatch = text.match(/외장:\s*(.*?)(?=\n|$)/);
      const intMatch = text.match(/내장:\s*(.*?)(?=\n|$)/);
      const optMatch = text.match(/옵션:\s*(.*?)(?=\n|$)/);
      const condMatch = text.match(/조건:\s*(.*?)(?=\n|$)/);

      if (carMatch && trimMatch) {
        successCount++;
        
        // 정밀 파싱 (조건 필드 등)
        const condRaw = condMatch ? condMatch[1] : "";
        const type = condRaw.includes("렌트") ? "RENT" : condRaw.includes("리스") ? "LEASE" : "UNKNOWN";
        
        const config = {
          carName: carMatch[1],
          trim: trimMatch[1],
          exteriorColor: extMatch ? extMatch[1] : null,
          interiorColor: intMatch ? intMatch[1] : null,
          options: optMatch ? optMatch[1].split(",").map(s => s.trim()).filter(s => s !== "없음") : [],
          contract: {
            type: type,
            raw: condRaw
          },
          isParsed: true
        };
        
        parsedResults.push({
          id: quote.id,
          original: text.split("\n")[0] + "...", // 첫 줄만 표시
          parsed: config
        });
      } else {
        failCount++;
        console.log(`❌ Failed to parse ID ${quote.id}: "${text.replace(/\n/g, " ")}"`);
      }
    }

    console.log("\n" + "=".repeat(40));
    console.log("📊 Dry-run Results Summary");
    console.log("=".repeat(40));
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Failure: ${failCount}`);
    console.log(`📈 Success Rate: ${((successCount / quotes.length) * 100).toFixed(1)}%`);
    console.log("=".repeat(40));

    if (parsedResults.length > 0) {
      console.log("\n🔍 Sample Parsed Data (First 3):");
      console.log(JSON.stringify(parsedResults.slice(0, 3), null, 2));
    }

  } catch (error) {
    console.error("Critical error during dry-run:", error);
  } finally {
    await prisma.$disconnect();
  }
}

dryRunMigration();
