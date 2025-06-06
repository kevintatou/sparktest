-- Insert test definitions
INSERT INTO test_definitions (id, name, description, image, commands)
VALUES 
  (
    '70e92383-2f9b-4d52-99ff-83d4a028b6fe',
    'API Health Check',
    'Checks if the API responds with 200',
    'postman/newman:alpine',
    ARRAY['newman run api-tests.json']
  ),
  (
    '127274ab-d119-42e6-9bd0-a39dea73bfdd',
    'Load Test',
    'Simulates load using K6',
    'grafana/k6',
    ARRAY['k6 run load-test.js']
  );

-- Insert test executors
INSERT INTO test_executors (
  id, name, description, image, default_command, supported_file_types, environment_variables, icon
)
VALUES 
  (
    gen_random_uuid(),
    'Postman',
    'Run Postman collections using Newman',
    'postman/newman:alpine',
    'newman run collection.json',
    ARRAY['json'],
    ARRAY['API_KEY', 'BASE_URL'],
    '🧪'
  ),
  (
    gen_random_uuid(),
    'K6',
    'Load testing tool by Grafana',
    'grafana/k6',
    'k6 run script.js',
    ARRAY['js'],
    ARRAY['TOKEN', 'BASE_URL'],
    '📈'
  );

-- Insert test runs
INSERT INTO test_runs (
  id, name, image, command, status, created_at, duration, logs, test_definition_id
)
VALUES 
  (
    gen_random_uuid(),
    'Run 1 - API Health',
    'postman/newman:alpine',
    ARRAY['newman run api-tests.json'],
    'Completed',
    now(),
    12,
    ARRAY['Start', 'Request sent', '200 OK', 'Done'],
    '70e92383-2f9b-4d52-99ff-83d4a028b6fe'
  ),
  (
    gen_random_uuid(),
    'Run 2 - Load Test',
    'grafana/k6',
    ARRAY['k6 run script.js'],
    'Running',
    now(),
    NULL,
    NULL,
    '127274ab-d119-42e6-9bd0-a39dea73bfdd'
  );
