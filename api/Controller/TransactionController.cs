namespace api.Controller;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using api.Model;
using api.ModelDto;
using api.Extension;
using Microsoft.EntityFrameworkCore;

[Route("api/[controller]")]
[ApiController]
public class TransactionController : ControllerBase
{
    private readonly AppDbContext _context;

    public TransactionController(AppDbContext context)
    {
        _context = context;
    }

    // POST: api/Transaction (Создание транзакции)
    [HttpPost]
    public async Task<ActionResult<Transaction>> CreateTransaction(TransactionDto transactionDto)
    {
        // Проверка существования категории
        var categoryExists = await _context.Categories.AnyAsync(c => c.ID == transactionDto.CategoryID);
        if (!categoryExists) return BadRequest("Invalid CategoryID");

        var transaction = new Transaction
        {
            Amount = transactionDto.Amount,
            Date = transactionDto.Date,
            CategoryID = transactionDto.CategoryID,
            Description = transactionDto.Description
        };

        _context.Transactions.Add(transaction);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTransaction), new { id = transaction.ID }, transaction);
    }

    // GET: api/Transaction (Получение всех транзакций)
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Transaction>>> GetTransactions()
    {
        return await _context.Transactions
            .Include(t => t.Category) // Включаем связанную категорию
            .ToListAsync();
    }

    // DELETE: api/Transaction/{id} (Удаление транзакции)
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTransaction(int id)
    {
        var transaction = await _context.Transactions.FindAsync(id);
        if (transaction == null) return NotFound();

        _context.Transactions.Remove(transaction);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // PUT: api/Transaction/{id} (Обновление транзакции)
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTransaction(int id, TransactionDto transactionDto)
    {
        var transaction = await _context.Transactions.FindAsync(id);
        if (transaction == null) return NotFound();

        // Проверка существования категории
        var categoryExists = await _context.Categories.AnyAsync(c => c.ID == transactionDto.CategoryID);
        if (!categoryExists) return BadRequest("Invalid CategoryID");

        transaction.Amount = transactionDto.Amount;
        transaction.Date = transactionDto.Date;
        transaction.CategoryID = transactionDto.CategoryID;
        transaction.Description = transactionDto.Description;

        _context.Entry(transaction).State = EntityState.Modified;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // GET: api/Transaction/{id} (Получение конкретной транзакции)
    [HttpGet("{id}")]
    public async Task<ActionResult<Transaction>> GetTransaction(int id)
    {
        var transaction = await _context.Transactions
            .Include(t => t.Category) // Включаем связанную категорию
            .FirstOrDefaultAsync(t => t.ID == id);

        if (transaction == null) return NotFound();

        return transaction;
    }

    // GET: api/Transaction/pass (Специальный эндпоинт как на схеме)
    [HttpGet("pass")]
    public IActionResult GetPass()
    {
        // Здесь может быть любая логика, например, проверка доступа
        return Ok("Access granted");
    }
}