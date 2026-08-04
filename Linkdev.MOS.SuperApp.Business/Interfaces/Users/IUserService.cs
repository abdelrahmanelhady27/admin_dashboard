using LinkDev.MOS.SuperApp.Business.DTOs.User;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LinkDev.MOS.SuperApp.Business.Interfaces.Users
{
    public interface IUserService
    {
        Task<IEnumerable<UserDto>> GetAllUsersAsync(string? search, string? status, string? contentType);
        Task<UserDto?> GetUserByIdAsync(int id);
        Task<UserDto> CreateUserAsync(CreateUserDto createUserDto);
        Task<UserDto?> UpdateUserPermissionsAsync(int id, List<PermissionSetDto> permissions);
        Task<bool> DeleteUserAsync(int id);
        Task<UserDto?> SuspendUserAsync(int id);
        Task<UserDto?> ActivateUserAsync(int id);
        Task<IEnumerable<StaticUserDto>> SearchStaticUsersAsync(string term);
    }
}
