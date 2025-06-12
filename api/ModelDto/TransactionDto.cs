namespace api.ModelDto;

using System.ComponentModel.DataAnnotations;

public class TransactionDto
{
    [Required]
    public double Amount { get; set; }

    [Required]
    public DateTime Date { get; set; } = DateTime.UtcNow;

    [Required]
    public int CategoryID { get; set; }

    [StringLength(200)]
    public string Description { get; set; }
}