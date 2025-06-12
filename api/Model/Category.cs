namespace api.Model;

using System.ComponentModel.DataAnnotations;

public class Category
{
    [Key]
    public int ID { get; set; }

    [Required, StringLength(50)]
    public string Name { get; set; }

    [Required]
    public string Type { get; set; }
}
