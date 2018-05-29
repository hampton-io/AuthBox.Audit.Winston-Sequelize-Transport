IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'AuditLogs' AND COLUMN_NAME = 'organisationId')
    BEGIN
      ALTER TABLE AuditLogs
        ADD organisationId uniqueidentifier
    END
GO