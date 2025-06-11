namespace api.Controller;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using api.Model;
using api.ModelDto;
using api.Extension;
using Microsoft.EntityFrameworkCore;

[Route("api/[controller]")]
[ApiController]
public class CategoryController : ControllerBase
{
    private readonly AppDbContext _context;

    public CategoryController(AppDbContext context)
    {
        _context = context;
    }

    // POST: api/Category (Создание категории)
    /* [HttpPost]
    public async Task<ActionResult<Category>> CreateCategory(CategoryDto categoryDto)
    {
        var category = new Category
        {
            Name = categoryDto.Name,
            Type = categoryDto.Type
        };

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCategory), new { id = category.ID }, category);
    } */
    [HttpPost]
    public async Task<ActionResult<Category>> CreateCategory(CategoryDto categoryDto)
    {
        try
        {
            // Логирование полученных данных
            Console.WriteLine($"Received category: Name={categoryDto.Name}, Type={categoryDto.Type}");

            var category = new Category
            {
                Name = categoryDto.Name,
                Type = categoryDto.Type
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCategory), new { id = category.ID }, category);
        }
        catch (Exception ex)
        {
            // Подробное логирование ошибки
            Console.WriteLine($"Error creating category: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");

            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
    // GET: api/Category (Получение всех категорий)
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
    {
        return await _context.Categories.ToListAsync();
    }

    // DELETE: api/Category/{id} (Удаление категории)
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null) return NotFound();

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // PUT: api/Category/{id} (Обновление категории)
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCategory(int id, CategoryDto categoryDto)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null) return NotFound();

        category.Name = categoryDto.Name;
        category.Type = categoryDto.Type;

        _context.Entry(category).State = EntityState.Modified;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // GET: api/Category/{id} (Получение конкретной категории)
    [HttpGet("{id}")]
    public async Task<ActionResult<Category>> GetCategory(int id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null) return NotFound();

        return category;
    }
}