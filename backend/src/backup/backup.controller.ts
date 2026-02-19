import { Controller, Post, Get, Delete, Param, HttpException, HttpStatus } from '@nestjs/common';
import { BackupService } from './backup.service';

@Controller('api/backup')
export class BackupController {
    constructor(private readonly backupService: BackupService) { }

    /**
     * Trigger a new backup
     * POST /api/backup
     */
    @Post()
    async createBackup() {
        const result = await this.backupService.createBackup();

        if (!result.success) {
            throw new HttpException(
                { message: 'Backup failed', error: result.error },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }

        return {
            message: 'Backup created successfully',
            backup: {
                filename: result.filename,
                size: result.size,
            },
        };
    }

    /**
     * List all backups
     * GET /api/backup
     */
    @Get()
    async listBackups() {
        const backups = await this.backupService.listBackups();

        return {
            count: backups.length,
            backups: backups.map(b => ({
                filename: b.filename,
                size: b.size,
                created: b.created,
            })),
        };
    }

    /**
     * Get backup details
     * GET /api/backup/:filename
     */
    @Get(':filename')
    async getBackup(@Param('filename') filename: string) {
        const backup = await this.backupService.getBackup(filename);

        if (!backup) {
            throw new HttpException('Backup not found', HttpStatus.NOT_FOUND);
        }

        return {
            filename: backup.filename,
            size: backup.size,
            created: backup.created,
        };
    }

    /**
     * Delete a backup
     * DELETE /api/backup/:filename
     */
    @Delete(':filename')
    async deleteBackup(@Param('filename') filename: string) {
        const success = await this.backupService.deleteBackup(filename);

        if (!success) {
            throw new HttpException('Failed to delete backup', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return {
            message: 'Backup deleted successfully',
            filename,
        };
    }

    /**
     * Restore from backup (use with extreme caution!)
     * POST /api/backup/restore/:filename
     * 
     * Note: This endpoint should be protected with admin-only access
     */
    @Post('restore/:filename')
    async restoreBackup(@Param('filename') filename: string) {
        const result = await this.backupService.restoreBackup(filename);

        if (!result.success) {
            throw new HttpException(
                { message: 'Restore failed', error: result.error },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }

        return {
            message: 'Database restored successfully',
            filename: result.filename,
        };
    }
}
