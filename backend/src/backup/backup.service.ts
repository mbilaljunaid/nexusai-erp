import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

export interface BackupInfo {
    filename: string;
    path: string;
    size: number;
    created: Date;
}

export interface BackupResult {
    success: boolean;
    filename?: string;
    path?: string;
    size?: number;
    error?: string;
}

@Injectable()
export class BackupService {
    private readonly backupDir = process.env.BACKUP_DIR || './backups';
    private readonly scriptPath = path.join(__dirname, '../../scripts/backup.sh');

    /**
     * Trigger a database backup
     */
    async createBackup(): Promise<BackupResult> {
        try {
            console.log('🔧 Starting database backup...');

            const { stdout, stderr } = await execAsync(`bash ${this.scriptPath}`);

            console.log('Backup output:', stdout);
            if (stderr) {
                console.error('Backup stderr:', stderr);
            }

            // Parse the output to get the backup filename
            const filenameMatch = stdout.match(/Backup location: (.+)/);
            if (!filenameMatch) {
                throw new Error('Could not parse backup filename from output');
            }

            const backupPath = filenameMatch[1].trim();
            const stats = await fs.stat(backupPath);

            return {
                success: true,
                filename: path.basename(backupPath),
                path: backupPath,
                size: stats.size,
            };
        } catch (error) {
            console.error('Backup error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    /**
     * List all available backups
     */
    async listBackups(): Promise<BackupInfo[]> {
        try {
            const files = await fs.readdir(this.backupDir);
            const backupFiles = files.filter(f => f.startsWith('backup_') && f.endsWith('.sql.gz'));

            const backups: BackupInfo[] = [];
            for (const file of backupFiles) {
                const filePath = path.join(this.backupDir, file);
                const stats = await fs.stat(filePath);
                backups.push({
                    filename: file,
                    path: filePath,
                    size: stats.size,
                    created: stats.mtime,
                });
            }

            // Sort by creation date, newest first
            backups.sort((a, b) => b.created.getTime() - a.created.getTime());

            return backups;
        } catch (error) {
            console.error('Error listing backups:', error);
            return [];
        }
    }

    /**
     * Get backup by filename
     */
    async getBackup(filename: string): Promise<BackupInfo | null> {
        try {
            const filePath = path.join(this.backupDir, filename);
            const stats = await fs.stat(filePath);

            return {
                filename,
                path: filePath,
                size: stats.size,
                created: stats.mtime,
            };
        } catch (error) {
            return null;
        }
    }

    /**
     * Delete a backup file
     */
    async deleteBackup(filename: string): Promise<boolean> {
        try {
            const filePath = path.join(this.backupDir, filename);
            await fs.unlink(filePath);
            console.log(`✅ Deleted backup: ${filename}`);
            return true;
        } catch (error) {
            console.error('Error deleting backup:', error);
            return false;
        }
    }

    /**
     * Restore from backup (use with extreme caution!)
     */
    async restoreBackup(filename: string): Promise<BackupResult> {
        try {
            const filePath = path.join(this.backupDir, filename);
            const restoreScript = path.join(__dirname, '../../scripts/restore.sh');

            console.log(`🔧 Starting database restore from: ${filename}`);

            // This requires manual confirmation in the script
            const { stdout, stderr } = await execAsync(`bash ${restoreScript} ${filePath}`);

            console.log('Restore output:', stdout);
            if (stderr) {
                console.error('Restore stderr:', stderr);
            }

            return {
                success: true,
                filename,
                path: filePath,
            };
        } catch (error) {
            console.error('Restore error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
}
