using AutoMapper;
using LinkDev.MOS.SuperApp.Business.DTOs.Common;
using LinkDev.MOS.SuperApp.Business.DTOs.ServiceIntroPage.ServiceFaq;
using LinkDev.MOS.SuperApp.Business.Interfaces;
using LinkDev.MOS.SuperApp.Business.Interfaces.AuditLogs;
using LinkDev.MOS.SuperApp.Business.Interfaces.Repositories;
using LinkDev.MOS.SuperApp.Business.Interfaces.ServiceIntroPages;
using LinkDev.MOS.SuperApp.Domain.Entities.ServiceIntroPages;
using LinkDev.MOS.SuperApp.Domain.Enums;

namespace LinkDev.MOS.SuperApp.Business.Services.ServiceIntroPages
{
    public class ServiceFaqService : IServiceFaqService
    {
        private readonly IServiceFaqRepository _faqRepo;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IAuditLogService _auditLogService;

        public ServiceFaqService(
            IServiceFaqRepository faqRepo,
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IAuditLogService auditLogService)
        {
            _faqRepo = faqRepo;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _auditLogService = auditLogService;
        }

        public async Task<PagedResult<ServiceFaqDto>> GetAllAsync(ServiceFaqSearchDto request)
        {
            var pageNumber = request.PageNumber < 1 ? 1 : request.PageNumber;
            var pageSize = request.PageSize < 1 ? 10 : request.PageSize;

            var (items, totalCount) = await _faqRepo.SearchAsync(
                request.Search,
                request.IsActive,
                pageNumber,
                pageSize,
                request.SortBy,
                request.SortDescending);

            return new PagedResult<ServiceFaqDto>
            {
                Items = _mapper.Map<List<ServiceFaqDto>>(items),
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<ServiceFaqDto?> GetByIdAsync(int id)
        {
            var faq = await _faqRepo.GetActiveByIdAsync(id);
            return faq == null ? null : _mapper.Map<ServiceFaqDto>(faq);
        }

        public async Task<ServiceFaqDto> CreateAsync(CreateServiceFaqDto dto)
        {
            var displayOrder = Math.Max(1, dto.DisplayOrder);
            await _faqRepo.ShiftDisplayOrdersForInsertAsync(displayOrder);

            var faq = new ServiceFaq
            {
                Question = dto.Question.Trim(),
                Answer = dto.Answer.Trim(),
                DisplayOrder = displayOrder,
                IsActive = dto.IsActive
            };

            await _faqRepo.AddAsync(faq);
            await _unitOfWork.SaveChangesAsync();

            await _auditLogService.LogAsync(
                AuditActionType.Create,
                AuditEntityType.ServiceFaq,
                faq.Question,
                faq.Id);

            return _mapper.Map<ServiceFaqDto>(faq);
        }

        public async Task<ServiceFaqDto?> UpdateAsync(int id, UpdateServiceFaqDto dto)
        {
            var faq = await _faqRepo.GetActiveByIdAsync(id);
            if (faq == null)
            {
                return null;
            }

            var wasActive = faq.IsActive;

            if (!dto.IsActive && faq.IsActive)
            {
                if (await _faqRepo.IsAssignedToPublishedPageAsync(id))
                {
                    throw new InvalidOperationException(
                        "Cannot deactivate a FAQ assigned to a published service intro page");
                }
            }

            var displayOrder = Math.Max(1, dto.DisplayOrder);
            if (displayOrder != faq.DisplayOrder)
            {
                await _faqRepo.ShiftDisplayOrdersForMoveAsync(faq.DisplayOrder, displayOrder, id);
            }

            faq.Question = dto.Question.Trim();
            faq.Answer = dto.Answer.Trim();
            faq.DisplayOrder = displayOrder;
            faq.IsActive = dto.IsActive;

            await _unitOfWork.SaveChangesAsync();

            var action = wasActive && !dto.IsActive
                ? AuditActionType.Suspend
                : !wasActive && dto.IsActive
                    ? AuditActionType.Activate
                    : AuditActionType.Update;

            await _auditLogService.LogAsync(
                action,
                AuditEntityType.ServiceFaq,
                faq.Question,
                id);

            return _mapper.Map<ServiceFaqDto>(faq);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var faq = await _faqRepo.GetActiveByIdAsync(id);
            if (faq == null)
            {
                return false;
            }

            if (await _faqRepo.IsAssignedToPublishedPageAsync(id))
            {
                throw new InvalidOperationException(
                    "Cannot delete a FAQ assigned to a published service intro page");
            }

            var question = faq.Question;
            await _faqRepo.SoftDeletePageLinksAsync(id);
            faq.IsDeleted = true;
            faq.IsActive = false;
            await _unitOfWork.SaveChangesAsync();

            await _auditLogService.LogAsync(
                AuditActionType.Delete,
                AuditEntityType.ServiceFaq,
                question,
                id);

            return true;
        }
    }
}
