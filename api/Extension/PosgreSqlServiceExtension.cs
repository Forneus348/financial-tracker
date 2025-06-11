using api.Extension;
using Microsoft.EntityFrameworkCore;

public static class PosgreSqlServiceExtension
/* класс для вынесения подключения к бд */
{
    public static void AddPosgreSqlDbContext(this IServiceCollection services, IConfiguration configuration)
    {
        // указываем, что мы используем тот dbcontext
        services.AddDbContext<AppDbContext>(options =>
        {
            options.UseNpgsql(configuration.GetConnectionString("PostgreSQLConnection")); // использованная строка подключения  
        });
    }

    public static void AddPostgreSqlIdentityContext(
        this IServiceCollection services
    )
    { }
}