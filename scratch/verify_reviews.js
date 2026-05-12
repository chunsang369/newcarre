const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const reviews = await prisma.review.findMany({
    where: { isPublished: true },
    orderBy: { sortOrder: 'asc' },
    take: 10,
  });
  
  console.log(`Total reviews: ${reviews.length}\n`);
  
  let withContent = 0;
  let withImage = 0;
  
  for (const r of reviews) {
    const hasContent = r.content && r.content.length > 20 && r.content !== r.title;
    const hasImage = !!r.imageUrl;
    if (hasContent) withContent++;
    if (hasImage) withImage++;
    
    console.log(`[${r.sortOrder}] ${r.title}`);
    console.log(`  Content: ${(r.content || '').substring(0, 80)}...`);
    console.log(`  Image: ${r.imageUrl || 'NONE'}`);
    console.log(`  Content length: ${(r.content || '').length}`);
    console.log();
  }
  
  // Count all
  const allReviews = await prisma.review.findMany({ where: { isPublished: true } });
  const totalContent = allReviews.filter(r => r.content && r.content.length > 20 && r.content !== r.title).length;
  const totalImages = allReviews.filter(r => !!r.imageUrl).length;
  
  console.log(`\n=== SUMMARY ===`);
  console.log(`Total reviews: ${allReviews.length}`);
  console.log(`Reviews with content: ${totalContent}/${allReviews.length}`);
  console.log(`Reviews with images: ${totalImages}/${allReviews.length}`);
  
  await prisma.$disconnect();
}

main().catch(console.error);
