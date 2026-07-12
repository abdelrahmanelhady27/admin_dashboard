CREATE TABLE [dbo].[AspNetUsers] (
    [Id]                   INT                IDENTITY (1, 1) NOT NULL,
    [FullName]             NVARCHAR (MAX)     NULL,
    [IsActive]             BIT                NOT NULL,
    [UserName]             NVARCHAR (256)     NULL,
    [NormalizedUserName]   NVARCHAR (256)     NULL,
    [Email]                NVARCHAR (256)     NULL,
    [NormalizedEmail]      NVARCHAR (256)     NULL,
    [EmailConfirmed]       BIT                NOT NULL,
    [PasswordHash]         NVARCHAR (MAX)     NULL,
    [SecurityStamp]        NVARCHAR (MAX)     NULL,
    [ConcurrencyStamp]     NVARCHAR (MAX)     NULL,
    [PhoneNumber]          NVARCHAR (MAX)     NULL,
    [PhoneNumberConfirmed] BIT                NOT NULL,
    [TwoFactorEnabled]     BIT                NOT NULL,
    [LockoutEnd]           DATETIMEOFFSET (7) NULL,
    [LockoutEnabled]       BIT                NOT NULL,
    [AccessFailedCount]    INT                NOT NULL,
    [CreatedAt]            DATETIME2 (7)      DEFAULT ('0001-01-01T00:00:00.0000000') NOT NULL,
    [CreatedBy]            NVARCHAR (MAX)     NULL,
    [IsDeleted]            BIT                DEFAULT (CONVERT([bit],(0))) NOT NULL,
    [ModifiedAt]           DATETIME2 (7)      NULL,
    [ModifiedBy]           NVARCHAR (MAX)     NULL,
    [StaticUserId]     INT                DEFAULT ((0)) NOT NULL,
    CONSTRAINT [PK_AspNetUsers] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO
CREATE NONCLUSTERED INDEX [EmailIndex]
    ON [dbo].[AspNetUsers]([NormalizedEmail] ASC);


GO
CREATE UNIQUE NONCLUSTERED INDEX [UserNameIndex]
    ON [dbo].[AspNetUsers]([NormalizedUserName] ASC) WHERE ([NormalizedUserName] IS NOT NULL);

