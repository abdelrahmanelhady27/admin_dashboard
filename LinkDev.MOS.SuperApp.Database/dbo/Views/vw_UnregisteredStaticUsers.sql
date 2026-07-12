CREATE VIEW [dbo].[vw_UnregisteredStaticUsers] AS
SELECT 
    s.[Id], 
    s.[FullName], 
    s.[Email], 
    s.[IsDeleted], 
    s.[CreatedAt], 
    s.[CreatedBy], 
    s.[ModifiedAt], 
    s.[ModifiedBy]
FROM [dbo].[StaticUsers] s
LEFT JOIN [dbo].[AspNetUsers] u ON s.[Id] = u.[StaticUserId]
WHERE u.[StaticUserId] IS NULL AND s.[IsDeleted] = 0;
