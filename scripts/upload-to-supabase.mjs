#!/usr/bin/env node
/**
 * Upload Textbooks to Supabase
 * ============================
 * Reads public/textbooks.json and uploads all sections to Supabase database.
 * Run this once after processing new PDFs.
 * 
 * Usage: node scripts/upload-to-supabase.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const SUPABASE_URL = 'https://cifuhexjuourvwetrkmv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpZnVoZXhqdW91cnZ3ZXRya212Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MTI4MDcsImV4cCI6MjA4OTA4ODgwN30.42k6IvP4_1FtFoca0HKBlPYsPFxYqfosWk9rhXbaizI';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function uploadTextbooks() {
  console.log('\n📚 Uploading textbooks to Supabase...\n');

  const filePath = join(process.cwd(), 'public', 'textbooks.json');
  
  if (!existsSync(filePath)) {
    console.error('❌ textbooks.json not found. Run: npm run process-pdfs first');
    process.exit(1);
  }

  const data = JSON.parse(readFileSync(filePath, 'utf-8'));
  console.log(`Found ${data.length} sections to upload...`);

  // Clear existing data
  const { error: deleteError } = await supabase
    .from('textbook_sections')
    .delete()
    .neq('id', 0);
  
  if (deleteError) {
    console.error('Error clearing old data:', deleteError.message);
  } else {
    console.log('✓ Cleared old textbook data');
  }

  // Upload in batches of 100
  const BATCH_SIZE = 100;
  let uploaded = 0;

  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE).map(item => ({
      title: item.title || 'Untitled',
      chapter: item.chapter || 'General',
      page: item.page || 0,
      content: item.content || '',
    }));

    const { error } = await supabase
      .from('textbook_sections')
      .insert(batch);

    if (error) {
      console.error(`Error uploading batch ${i}-${i + BATCH_SIZE}:`, error.message);
    } else {
      uploaded += batch.length;
      console.log(`✓ Uploaded ${uploaded}/${data.length} sections...`);
    }
  }

  console.log(`\n✅ Done! ${uploaded} textbook sections uploaded to Supabase.`);
  console.log('Your live platform will now load textbooks from the database.\n');
}

uploadTextbooks().catch(console.error);
