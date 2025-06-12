### Работа с проектом:
1. Клонирование репозитория:
<pre class="language-bash"><code>git@github.com:Forneus348/financial-tracker.git</code></pre>
2. Создание бд (я использовал pgAdmin):
    - Name: financial-tracker-db
    - Host name/address: localhost
    - Maintenance database: postgres
    - Username: postgres
    - Password: 12345678
3. Работа с api:
    - Добавление файлов в папке api appsettings.Development.json:
   ```json5
   {
    "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
        }
     },
      "ConnectionStrings": {
        "PostgreSQLConnection": "Host=localhost;Port=5432;Username=postgres;Password=12345678;Database=financial-tracker-db"
      }
   }

   ```
   - и appsettings.json:
   ```json5
   {
     "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
        }
      },
      "ConnectionStrings": {
        "PostgreSQLConnection": "Host=localhost;Port=5432;Username=postgres;Password=12345678;Database=financial-tracker-db"
      },
      "AllowedHosts": "*"
   }
   ```
4. Запуск миграций:
  перейдите в папку api, запустите команды:
   - <pre class="language-bash"><code>dotnet ef migrations add InitialCreate</code></pre>
   - <pre class="language-bash"><code>dotnet ef database update</code></pre>
5. Генерирование данных в бд (если необходимо):
   <pre class="language-bash"><code>INSERT INTO Categories ("Name", "Type")
    VALUES 
      ('Зарплата', 'Доход'),
      ('Фриланс', 'Доход'),
      ('Дивиденды', 'Доход'),
      ('Подарки', 'Доход'),
      ('Продажа вещей', 'Доход'),
      ('Продукты', 'Расход'),
      ('Транспорт', 'Расход'),
      ('Жилье', 'Расход'),
      ('Развлечения', 'Расход'),
      ('Одежда', 'Расход');
   </code></pre>

   <pre class="language-bash"><code>INSERT INTO Transactions ("Amount", "Date", "CategoryID", "Description")
    VALUES
      (150000, '2025-05-28', 1, 'Зарплата за май'),
      (25000, '2025-06-05', 2, 'Веб-разработка для клиента'),
      (-3500, '2025-06-10', 6, 'Супермаркет "Пятерочка"'),
      (12000, '2025-05-15', 3, 'Акции Газпрома'),
      (-800, '2025-06-11', 7, 'Такси до аэропорта'),
      (-45000, '2025-06-01', 8, 'Аренда квартиры'),
      (-2000, '2025-06-08', 9, 'Поход в кино'),
      (5000, '2025-06-12', 4, 'День рождения'),
      (-7000, '2025-05-30', 10, 'Куртка H&M'),
      (18000, '2025-06-07', 5, 'Продажа ноутбука'),
      (-1500, '2025-06-09', 6, 'Фермерский рынок'),
      (-300, '2025-06-12', 7, 'Метро'),
      (3000, '2025-06-10', 2, 'Редизайн логотипа'),
      (-5000, '2025-06-05', 9, 'Ресторан "Токио Сити"'),
      (-22000, '2025-06-03', 8, 'Коммунальные платежи'),
      (-1200, '2025-06-04', 10, 'Футболка'),
      (7500, '2025-05-25', 3, 'Дивиденды Сбербанк'),
      (-900, '2025-06-06', 6, 'Хлеб и молоко'),
      (15000, '2025-06-11', 1, 'Аванс'),
      (-3500, '2025-06-07', 9, 'Билеты на концерт');
   </code></pre>
7. Запуск проекта:
   - В папке api пропишите команду: <pre class="language-bash"><code>dotnet run</code></pre>
   Swagger будет открыт по ссылке: <pre class="language-bash"><code>http://localhost:5000/swagger/index.html</code></pre>
   - Далее запустите файл index.html в папке client
