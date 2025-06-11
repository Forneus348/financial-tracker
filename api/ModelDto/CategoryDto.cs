namespace api.ModelDto;

using System.ComponentModel.DataAnnotations;

public class CategoryDto
{
    [Required, StringLength(50)]
    public string Name { get; set; }

    [Required]
    public string Type { get; set; }
}
