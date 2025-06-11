namespace api.ModelDto;

using System.ComponentModel.DataAnnotations;

public class CategoryDto
{
    [Required, StringLength(50, MinimumLength = 2)]
    public string Name { get; set; }

    [Required]
    [RegularExpression("^(Доход|Расход)$", ErrorMessage = "Тип должен быть 'Доход' или 'Расход'")]
    public string Type { get; set; }
}
