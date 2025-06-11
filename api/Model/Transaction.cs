namespace api.Model;

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class Transaction
{
    [Key]
    public int ID { get; set; }

    [Required]
    public double Amount { get; set; }

    [Required]
    public DateTime Date { get; set; } = DateTime.UtcNow;

    [Required]
    public int CategoryID { get; set; }

    [StringLength(200)]
    public string Description { get; set; }

    [ForeignKey("CategoryID")]
    public Category Category { get; set; }
}