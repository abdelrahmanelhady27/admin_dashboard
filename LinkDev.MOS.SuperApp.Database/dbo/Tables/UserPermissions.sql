CREATE TABLE [dbo].[UserPermissions] (
    [Id]                INT            IDENTITY (1, 1) NOT NULL,
    [UserId]            INT            NOT NULL,
    [Feature]           INT            NOT NULL,
    [Permission]        INT            NOT NULL,
    [ApplicationUserId] INT            NULL,
    [CreatedAt]         DATETIME2 (7)  DEFAULT ('0001-01-01T00:00:00.0000000') NOT NULL,
    [CreatedBy]         NVARCHAR (MAX) NULL,
    [IsDeleted]         BIT            DEFAULT (CONVERT([bit],(0))) NOT NULL,
    [ModifiedAt]        DATETIME2 (7)  NULL,
    [ModifiedBy]        NVARCHAR (MAX) NULL,
    CONSTRAINT [PK_UserPermissions] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_UserPermissions_AspNetUsers_ApplicationUserId] FOREIGN KEY ([ApplicationUserId]) REFERENCES [dbo].[AspNetUsers] ([Id]),
    CONSTRAINT [FK_UserPermissions_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE CASCADE
);


GO
CREATE NONCLUSTERED INDEX [IX_UserPermissions_ApplicationUserId]
    ON [dbo].[UserPermissions]([ApplicationUserId] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_UserPermissions_UserId]
    ON [dbo].[UserPermissions]([UserId] ASC);

