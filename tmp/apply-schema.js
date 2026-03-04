
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  try {
    const sqlPath = path.join(__dirname, 'schema.sql');
    
    // Read the file as buffer and then decode from utf16le
    const buffer = fs.readFileSync(sqlPath);
    let sql = buffer.toString('utf16le');
    
    // Remove BOM if present
    if (sql.charCodeAt(0) === 0xFEFF) {
        sql = sql.slice(1);
    }

    console.log("Applying schema to database sequentially...");
    
    // Split by ; and execute one by one
    // Note: This is a simple split, works for standard Prisma migrations
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    console.log(`Found ${statements.length} statements.`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const snippet = statement.substring(0, 50).replace(/\n/g, ' ');
      console.log(`[${i + 1}/${statements.length}] Executing: ${snippet}...`);
      try {
        await prisma.$executeRawUnsafe(statement);
      } catch (err) {
        console.warn(`Warning at statement ${i + 1}: ${err.message}`);
        // Sometimes "already exists" errors happen if partially run, we continue
        if (!err.message.includes('already exists')) {
            throw err;
        }
      }
    }
    
    console.log("Schema applied successfully!");
    
    const count = await prisma.patient.count();
    console.log(`Verification: Found ${count} patients.`);
  } catch (error) {
    console.error("Failed to apply schema:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
