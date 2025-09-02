#!/usr/bin/env node

/**
 * Development Tools for MockTest AI
 * Unified utility for data management and testing
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const args = process.argv.slice(2)
const command = args[0]

// Browser cleanup script
const browserCleanupScript = `
// Clear all localStorage
localStorage.clear();
sessionStorage.clear();

// Clear IndexedDB
if (window.indexedDB) {
  indexedDB.databases().then(dbs => 
    dbs.forEach(db => indexedDB.deleteDatabase(db.name))
  );
}

console.log('✅ Browser data cleared! Refresh the page.');
`

// Help text
function showHelp() {
  console.log(`
MockTest AI Development Tools

Usage: node scripts/dev-tools.js [command]

Commands:
  --help              Show this help message
  --init-db           Initialize database schema
  --clear-browser     Show browser cleanup script
  --clear-db          Clear database (requires service key)
  --clear-all         Clear everything (browser + database)

Examples:
  node scripts/dev-tools.js --init-db
  node scripts/dev-tools.js --clear-browser
  node scripts/dev-tools.js --clear-db
  npm run dev:clean   # Alias for --clear-all
  npm run db:init     # Alias for --init-db
`)
}

// Clear browser command
function clearBrowser() {
  console.log('📋 Copy and run this in your browser console:\n')
  console.log('─'.repeat(50))
  console.log(browserCleanupScript)
  console.log('─'.repeat(50))
  console.log('\n✨ After running, refresh the page.')
}

// Clear database command
async function clearDatabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables')
    console.error('   NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required')
    console.error('   Add them to .env.local file')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  console.log('🗑️  Starting database cleanup...\n')

  try {
    // Delete in correct order (foreign key constraints)
    const tables = [
      'test_responses',
      'test_results', 
      'tests',
      'questions',
      'profiles'
    ]

    for (const table of tables) {
      console.log(`Deleting ${table}...`)
      const { error } = await supabase
        .from(table)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')
      
      if (error) {
        console.error(`  ⚠️  Error: ${error.message}`)
      } else {
        console.log(`  ✅ ${table} cleared`)
      }
    }

    // Delete auth users
    console.log('\nDeleting auth users...')
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    
    if (!listError && users && users.length > 0) {
      for (const user of users) {
        const { error } = await supabase.auth.admin.deleteUser(user.id)
        if (error) {
          console.error(`  ⚠️  Error deleting ${user.email}`)
        } else {
          console.log(`  ✅ Deleted: ${user.email}`)
        }
      }
    } else {
      console.log('  No users to delete')
    }

    console.log('\n✨ Database cleanup complete!')
  } catch (error) {
    console.error('❌ Cleanup failed:', error)
    process.exit(1)
  }
}

// Initialize database command
async function initDatabase() {
  console.log('📦 Database initialization info:\n')
  console.log('The database schema is managed via Supabase migrations.')
  console.log('\nTo initialize your database:')
  console.log('─'.repeat(50))
  console.log('1. Go to your Supabase dashboard')
  console.log('2. Navigate to SQL Editor')
  console.log('3. Run the migration file:')
  console.log('   supabase/migrations/000_initial_schema.sql')
  console.log('─'.repeat(50))
  console.log('\nAlternatively, if you have Supabase CLI:')
  console.log('  supabase db push')
  console.log('\n✨ This will create all tables, indexes, and RLS policies.')
}

// Clear all command
async function clearAll() {
  console.log('🧹 Complete cleanup starting...\n')
  
  // Show browser cleanup instructions
  console.log('Step 1: Clear browser data')
  console.log('─'.repeat(50))
  clearBrowser()
  console.log('\nStep 2: Clear database')
  console.log('─'.repeat(50))
  
  // Clear database
  await clearDatabase()
  
  console.log('\n✅ All cleanup complete!')
  console.log('🔄 Refresh your browser to start fresh.')
}

// Reset database - drop and recreate all tables
async function resetDatabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables')
    console.error('   NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required')
    console.error('   Add them to .env.local file')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  console.log('🔄 Resetting database schema...\n')

  try {
    // Read SQL files
    const dropSql = fs.readFileSync(path.join(__dirname, '../supabase/migrations/drop_all_tables.sql'), 'utf8')
    const schemaSql = fs.readFileSync(path.join(__dirname, '../supabase/migrations/000_initial_schema.sql'), 'utf8')

    // Execute drop tables
    console.log('📦 Dropping all tables...')
    const { error: dropError } = await supabase.rpc('exec_sql', { sql: dropSql }).single()
    
    if (dropError && !dropError.message.includes('does not exist')) {
      console.error('❌ Error dropping tables:', dropError.message)
      console.log('\n💡 Please run these SQL commands manually in Supabase SQL Editor:')
      console.log('1. Run: supabase/migrations/drop_all_tables.sql')
      console.log('2. Run: supabase/migrations/000_initial_schema.sql')
      return
    }

    console.log('✅ Tables dropped successfully')
    
    console.log('\n📦 Creating new schema...')
    console.log('\n💡 Please run this SQL in Supabase SQL Editor:')
    console.log('   supabase/migrations/000_initial_schema.sql')
    console.log('\n✨ Database reset instructions displayed!')
    
  } catch (error) {
    console.error('❌ Reset failed:', error)
    console.log('\n💡 Please run these SQL commands manually in Supabase SQL Editor:')
    console.log('1. Run: supabase/migrations/drop_all_tables.sql')
    console.log('2. Run: supabase/migrations/000_initial_schema.sql')
  }
}

// Main command handler
async function main() {
  switch(command) {
    case '--help':
    case '-h':
    case undefined:
      showHelp()
      break
      
    case '--clear-browser':
      clearBrowser()
      break
      
    case '--clear-db':
      // Confirmation prompt
      const readline = require('readline')
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      })
      
      console.log('⚠️  This will delete ALL data from the database!')
      rl.question('Are you sure? (yes/no): ', async (answer) => {
        if (answer.toLowerCase() === 'yes') {
          await clearDatabase()
        } else {
          console.log('Cancelled')
        }
        rl.close()
        process.exit(0)
      })
      break
      
    case '--clear-all':
      await clearAll()
      break
      
    case '--init-db':
      initDatabase()
      break
      
    case '--reset-db':
      await resetDatabase()
      break
      
    default:
      console.error(`Unknown command: ${command}`)
      console.log('Run with --help for usage information')
      process.exit(1)
  }
}

// Run the tool
if (require.main === module) {
  main().catch(console.error)
}