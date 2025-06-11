using Microsoft.AspNetCore.Mvc;
using api.Model;
using api.ModelDto;
using api.Extension;
using Microsoft.EntityFrameworkCore;

namespace api.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class TransactionController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<TransactionController> _logger;

        public TransactionController(AppDbContext context, ILogger<TransactionController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> CreateTransaction([FromBody] TransactionDto transactionDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Проверка существования категории
                var category = await _context.Categories
                    .FirstOrDefaultAsync(c => c.ID == transactionDto.CategoryID);

                if (category == null)
                {
                    return BadRequest(new { Message = "Категория не найдена" });
                }

                var transaction = new Transaction
                {
                    Amount = transactionDto.Amount,
                    Date = DateTime.SpecifyKind(transactionDto.Date, DateTimeKind.Utc),
                    CategoryID = transactionDto.CategoryID,
                    Description = transactionDto.Description ?? string.Empty
                };

                await _context.Transactions.AddAsync(transaction);
                await _context.SaveChangesAsync();

                // Загружаем связанную категорию для возврата
                await _context.Entry(transaction)
                    .Reference(t => t.Category)
                    .LoadAsync();

                return CreatedAtAction(nameof(GetTransaction),
                    new { id = transaction.ID },
                    transaction);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при создании транзакции");
                return StatusCode(500, new
                {
                    Message = "Внутренняя ошибка сервера",
                    Error = ex.Message
                });
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Transaction>>> GetTransactions()
        {
            return await _context.Transactions
                .Include(t => t.Category)
                .AsNoTracking()
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Transaction>> GetTransaction(int id)
        {
            var transaction = await _context.Transactions
                .Include(t => t.Category)
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.ID == id);

            if (transaction == null)
            {
                return NotFound();
            }

            return transaction;
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTransaction(int id, [FromBody] TransactionDto transactionDto)
        {
            try
            {
                var transaction = await _context.Transactions.FindAsync(id);
                if (transaction == null)
                {
                    return NotFound();
                }

                var category = await _context.Categories
                    .FirstOrDefaultAsync(c => c.ID == transactionDto.CategoryID);

                if (category == null)
                {
                    return BadRequest(new { Message = "Категория не найдена" });
                }

                transaction.Amount = transactionDto.Amount;
                transaction.Date = DateTime.SpecifyKind(transactionDto.Date, DateTimeKind.Utc);
                transaction.CategoryID = transactionDto.CategoryID;
                transaction.Description = transactionDto.Description ?? string.Empty;

                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при обновлении транзакции");
                return StatusCode(500, new
                {
                    Message = "Внутренняя ошибка сервера",
                    Error = ex.Message
                });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTransaction(int id)
        {
            var transaction = await _context.Transactions.FindAsync(id);
            if (transaction == null)
            {
                return NotFound();
            }

            _context.Transactions.Remove(transaction);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}