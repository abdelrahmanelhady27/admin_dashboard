using Linkdev.MOS.SuperApp.Business.DTOs.User;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Linkdev.MOS.SuperApp.Business.Interfaces.Services
{
    public interface IUserAccountService
    {
        Task<IEnumerable<UserAccountDto>> GetAllAccountsAsync(string? search);
        Task<UserAccountDto?> GetAccountByIdAsync(int id);
        Task<UserAccountDto> CreateAccountAsync(string email, string fullName, string password, int staticUserId);
        Task<bool> DeleteAccountAsync(int id);
        Task<UserAccountDto?> SuspendAccountAsync(int id);
    }
}
