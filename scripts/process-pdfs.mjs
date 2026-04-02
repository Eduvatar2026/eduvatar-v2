#!/usr/bin/env node
/**
 * PDF Textbook Processor
 * =====================
 * Extracts text from PDF textbooks and saves as structured JSON
 * for the Victory Learning Platform chatbot and quiz system.
 * 
 * Usage:
 *   npm run process-pdfs
 * 
 * Place your PDF files in the /textbook-data/ folder before running.
 * Output will be saved as /public/textbooks.json
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'fs';
import { join, basename } from 'path';

// pdf-parse is a CommonJS module
import pdfParse from 'pdf-parse';

const INPUT_DIR = join(process.cwd(), 'textbook-data');
const OUTPUT_FILE = join(process.cwd(), 'public', 'textbooks.json');
const CHUNK_SIZE = 500; // words per chunk (adjust for your textbooks)

async function processTextbook(filepath) {
  console.log(`  Processing: ${basename(filepath)}...`);
  
  const buffer = readFileSync(filepath);
  const data = await pdfParse(buffer);
  
  const bookName = basename(filepath, '.pdf')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
  
  const text = data.text;
  const pages = text.split(/\f/); // Form feed separates pages
  
  const chunks = [];
  let currentChapter = bookName;
  
  for (let pageNum = 0; pageNum < pages.length; pageNum++) {
    const pageText = pages[pageNum].trim();
    if (!pageText) continue;
    
    // Simple chapter detection (lines that look like headings)
    const lines = pageText.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      // Detect chapter headings (customize these patterns for your textbooks)
      if (/^(chapter|unit|section|module|lesson)\s+\d/i.test(trimmed)) {
        currentChapter = trimmed;
      }
    }
    
    // Split page into chunks of CHUNK_SIZE words
    const words = pageText.split(/\s+/);
    for (let i = 0; i < words.length; i += CHUNK_SIZE) {
      const chunkWords = words.slice(i, i + CHUNK_SIZE);
      if (chunkWords.length < 20) continue; // Skip very small chunks
      
      const content = chunkWords.join(' ');
      
      // Generate a title from the first sentence
      const firstSentence = content.match(/^[^.!?]+[.!?]/)?.[0] || content.slice(0, 60) + '...';
      
      chunks.push({
        title: firstSentence.slice(0, 80),
        chapter: currentChapter,
        page: pageNum + 1,
        content: content,
      });
    }
  }
  
  console.log(`  → Extracted ${chunks.length} sections from ${pages.length} pages`);
  return chunks;
}

async function main() {
  console.log('\n📚 Victory Learning Platform — Textbook Processor\n');
  
  // Create directories if needed
  if (!existsSync(INPUT_DIR)) {
    mkdirSync(INPUT_DIR, { recursive: true });
    console.log(`Created ${INPUT_DIR}/`);
    console.log('Place your PDF textbooks in this folder and run again.\n');
    return;
  }
  
  // Find all PDFs
  const pdfFiles = readdirSync(INPUT_DIR).filter(f => f.toLowerCase().endsWith('.pdf'));
  
  if (pdfFiles.length === 0) {
    console.log('No PDF files found in /textbook-data/');
    console.log('Place your textbook PDFs there and run this script again.\n');
    return;
  }
  
  console.log(`Found ${pdfFiles.length} PDF file(s):\n`);
  
  let allChunks = [];
  
  for (const file of pdfFiles) {
    try {
      const chunks = await processTextbook(join(INPUT_DIR, file));
      allChunks = allChunks.concat(chunks);
    } catch (err) {
      console.error(`  ✗ Error processing ${file}: ${err.message}`);
    }
  }
  
  // Save output
  mkdirSync(join(process.cwd(), 'public'), { recursive: true });
  writeFileSync(OUTPUT_FILE, JSON.stringify(allChunks, null, 2));
  
  console.log(`\n✅ Done! Saved ${allChunks.length} sections to public/textbooks.json`);
  console.log('The platform will automatically load this data.\n');
}

main().catch(console.error);
