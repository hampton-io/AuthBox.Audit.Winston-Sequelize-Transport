IF NOT EXISTS(SELECT 1 FROM INFORMATION_SCHEMA.TABLES where TABLE_NAME = 'AuditLogs')
    BEGIN
    CREATE TABLE AuditLogs
    (
        id int PRIMARY KEY NOT NULL IDENTITY,
        level nvarchar(255),
        message nvarchar(255),
        meta nvarchar(max),
        createdAt datetimeoffset NOT NULL,
        updatedAt datetimeoffset NOT NULL,
        application varchar(255),
        environment varchar(255)
    );
    CREATE INDEX level ON [lgn-dev-dir-db].dbo.AuditLogs (level);
END