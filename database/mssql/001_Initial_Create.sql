IF NOT EXISTS(SELECT 1 FROM INFORMATION_SCHEMA.TABLES where TABLE_NAME = 'AuditLogs')
    BEGIN
    CREATE TABLE AuditLogs
    (
        id uniqueidentifier PRIMARY KEY NOT NULL,
        level nvarchar(255),
        message nvarchar(max),
        createdAt datetimeoffset NOT NULL,
        updatedAt datetimeoffset NOT NULL,
        application varchar(255),
        environment varchar(255),
        type varchar(255),
        subType varchar(255),
        userId uniqueidentifier
    );
    CREATE INDEX level ON dbo.AuditLogs (level);
    CREATE INDEX userId ON dbo.AuditLogs (userId);
    CREATE INDEX type ON dbo.AuditLogs (type);
END

IF NOT EXISTS(SELECT 1 FROM INFORMATION_SCHEMA.TABLES where TABLE_NAME = 'AuditLogMeta')
    BEGIN
    CREATE TABLE AuditLogMeta
    (
        id uniqueidentifier PRIMARY KEY NOT NULL,
        auditId uniqueidentifier NOT NULL,
        [key] nvarchar(125) NOT NULL,
        [value] nvarchar(max) NULL,
        CONSTRAINT [AuditLog_FK] FOREIGN KEY (auditId) REFERENCES AuditLogs(id)
    );
END
