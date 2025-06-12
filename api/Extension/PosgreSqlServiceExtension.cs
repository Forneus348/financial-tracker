using api.Extension;
using Microsoft.EntityFrameworkCore;

public static class PosgreSqlServiceExtension
// класс для вынесения подключения к бд 
{
    public static void AddPosgreSqlDbContext(this IServiceCollection services, IConfiguration configuration)
    {
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