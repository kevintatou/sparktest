CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create table for test definitions
CREATE TABLE test_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    image TEXT NOT NULL,
    commands TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create table for test executors
CREATE TABLE test_executors (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    image TEXT NOT NULL,
    default_command TEXT NOT NULL,
    supported_file_types TEXT[] NOT NULL,
    environment_variables TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    icon TEXT
);

-- Create table for test runs
CREATE TABLE test_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    image TEXT NOT NULL,
    command TEXT[] NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Running', 'Completed', 'Failed')),
    created_at TIMESTAMPTZ DEFAULT now(),
    duration INTEGER,
    logs TEXT[],
    test_definition_id UUID REFERENCES test_definitions(id) ON DELETE SET NULL
);
