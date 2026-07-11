CREATE TABLE [dbo].[StaticUsers] (
    [Id]         INT            IDENTITY (1, 1) NOT NULL,
    [FullName]   NVARCHAR (MAX) NOT NULL,
    [Email]      NVARCHAR (MAX) NOT NULL,
    [CreatedAt]  DATETIME2 (7)  NOT NULL,
    [CreatedBy]  NVARCHAR (MAX) NULL,
    [ModifiedAt] DATETIME2 (7)  NULL,
    [ModifiedBy] NVARCHAR (MAX) NULL,
    [IsDeleted]  BIT            NOT NULL,
    CONSTRAINT [PK_StaticUsers] PRIMARY KEY CLUSTERED ([Id] ASC)
);

