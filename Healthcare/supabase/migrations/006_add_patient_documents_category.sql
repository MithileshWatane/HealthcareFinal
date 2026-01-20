-- Migration: Add category and description columns to patient_documents table
-- Created: 2026-01-15

-- Add category column to patient_documents table
ALTER TABLE patient_documents 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'other';

-- Add description column to patient_documents table
ALTER TABLE patient_documents 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add index on category for faster filtering
CREATE INDEX IF NOT EXISTS idx_patient_documents_category 
ON patient_documents(category);

-- Add comment to explain the category column
COMMENT ON COLUMN patient_documents.category IS 'Document category: photo, report, prescription, xray, mri, other';
COMMENT ON COLUMN patient_documents.description IS 'Optional description of the document';
