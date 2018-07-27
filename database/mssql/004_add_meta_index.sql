DECLARE @ExistingIndexName nvarchar(128) = (SELECT i.name
FROM sys.indexes i
  JOIN sys.index_columns ic ON i.index_id = ic.index_id
  JOIN sys.columns c ON ic.column_id = c.column_id AND c.object_id = i.object_id
WHERE i.[object_id] = OBJECT_ID('AuditLogMeta')
AND i.type <> 1
AND (
  (c.name = 'auditid' AND ic.is_included_column = 0)
  OR
  (c.name = 'key' AND ic.is_included_column = 1)
  OR
  (c.name = 'value' AND ic.is_included_column = 1)
)
GROUP BY i.name
HAVING COUNT(DISTINCT c.name) = 3)

IF @ExistingIndexName IS NULL
    BEGIN
      PRINT 'creating IX_AuditLogMeta_IdKeyValue'
      CREATE NONCLUSTERED INDEX [IX_AuditLogMeta_IdKeyValue]
        ON [AuditLogMeta] ([AuditId])
        INCLUDE ([Key], [Value])
      PRINT 'created IX_AuditLogMeta_IdKeyValue'
    END
ELSE
  PRINT 'Index already exists as ' + @ExistingIndexName
GO