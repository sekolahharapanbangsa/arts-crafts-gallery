import { db } from '../src/lib/db'

async function migrateArtworkCounts() {
  try {
    console.log('Starting artwork counts migration...')
    
    // Get all artworks that need updating
    const artworks = await db.artwork.findMany({
      where: {
        OR: [
          { likeCount: null },
          { saveCount: null },
          { viewCount: null }
        ]
      }
    })
    
    console.log(`Found ${artworks.length} artworks to update`)
    
    // Update each artwork individually
    for (const artwork of artworks) {
      await db.artwork.update({
        where: { id: artwork.id },
        data: {
          likeCount: 0,
          saveCount: 0,
          viewCount: 0
        }
      })
    }
    
    console.log(`Updated ${artworks.length} artworks with default count values`)
    console.log('Migration completed successfully!')
    
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  } finally {
    await db.$disconnect()
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateArtworkCounts()
}