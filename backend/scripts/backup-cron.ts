#!/usr/bin/env node

/**
 * Scheduled Backup Script
 * Uses node-cron to run automated database backups
 */

import * as cron from 'node-cron';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execAsync = promisify(exec);

// Backup schedule (default: daily at 2 AM)
const BACKUP_SCHEDULE = process.env.BACKUP_SCHEDULE || '0 2 * * *';

console.log('🔧 Starting backup scheduler...');
console.log(`Schedule: ${BACKUP_SCHEDULE}`);

// Validate cron expression
if (!cron.validate(BACKUP_SCHEDULE)) {
    console.error('❌ Invalid cron schedule:', BACKUP_SCHEDULE);
    process.exit(1);
}

// Schedule the backup
const task = cron.schedule(BACKUP_SCHEDULE, async () => {
    console.log('🔧 Running scheduled backup...');

    try {
        const scriptPath = path.join(__dirname, 'backup.sh');
        const { stdout, stderr } = await execAsync(`bash ${scriptPath}`);

        console.log('Backup output:', stdout);
        if (stderr) {
            console.error('Backup stderr:', stderr);
        }

        console.log('✅ Scheduled backup completed successfully');

        // TODO: Send email notification on success

    } catch (error) {
        console.error('❌ Scheduled backup failed:', error);

        // TODO: Send email notification on failure
    }
});

console.log('✅ Backup scheduler started successfully');
console.log('Press Ctrl+C to stop');

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🔧 Stopping backup scheduler...');
    task.stop();
    console.log('✅ Backup scheduler stopped');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🔧 Stopping backup scheduler...');
    task.stop();
    console.log('✅ Backup scheduler stopped');
    process.exit(0);
});
