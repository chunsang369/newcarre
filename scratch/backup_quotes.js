const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");
const prisma = new PrismaClient();

async function backupQuotes() {
  const now = new Date();
  const timestamp = now.getFullYear() + 
                    String(now.getMonth() + 1).padStart(2, '0') + 
                    String(now.getDate()).padStart(2, '0') + "_" + 
                    String(now.getHours()).padStart(2, '0') + 
                    String(now.getMinutes()).padStart(2, '0');
  
  const filename = `consultations_backup_${timestamp}.csv`;
  const filePath = path.join(__dirname, filename);

  console.log(`📦 Starting backup to ${filename}...`);

  try {
    const quotes = await prisma.quoteRequest.findMany();
    
    if (quotes.length === 0) {
      console.log("No data found to backup.");
      return;
    }

    const headers = Object.keys(quotes[0]).join(",");
    const rows = quotes.map(quote => {
      return Object.values(quote).map(val => {
        if (val === null) return "";
        const str = String(val).replace(/"/g, '""'); // Escape quotes
        return `"${str}"`;
      }).join(",");
    });

    const csvContent = [headers, ...rows].join("\n");
    fs.writeFileSync(filePath, csvContent);

    console.log(`✅ Backup completed successfully: ${filePath}`);
    console.log(`📊 Total rows backed up: ${quotes.length}`);
  } catch (error) {
    console.error("❌ Backup failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

backupQuotes();
