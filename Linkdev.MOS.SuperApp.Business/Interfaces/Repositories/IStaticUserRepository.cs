using LinkDev.MOS.SuperApp.Domain.Entities.StaticUsers;

namespace LinkDev.MOS.SuperApp.Business.Interfaces.Repositories
{
    public interface IStaticUserRepository
    {
        Task<StaticUser?> GetByIdAsync(int id);
        Task<IEnumerable<UnregisteredStaticUser>> SearchUnregisteredAsync(string term);
    }
}
