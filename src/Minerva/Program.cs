using Microsoft.EntityFrameworkCore;
using Minerva.Config;
using Minerva.Infrastructure;
using Npgsql;
using Shared;

var builder = WebApplication.CreateBuilder(args);

var connStringBuilder = new NpgsqlConnectionStringBuilder {
  SslMode = SslMode.VerifyFull,
  Host = builder.Configuration["DB_HOST"],
  Port = builder.Configuration["DB_PORT"].ParseInt(),
  Database = builder.Configuration["DB_NAME"],
  Username = builder.Configuration["DB_USER"],
  Password = builder.Configuration["DB_PASS"]
};

var dataSourceBuilder = new NpgsqlDataSourceBuilder(connStringBuilder.ConnectionString);
dataSourceBuilder.EnableDynamicJson();
var dataSource = dataSourceBuilder.Build();

// Add services to the container.
var services = builder.Services;

services
    .Configure<ServerConfig>(builder.Configuration.GetSection(nameof(ServerConfig)))
    .AddDbContext<MasterDbContext>(options => {
      options.UseNpgsql(dataSource).UseSnakeCaseNamingConvention();
    })
    .AddCors()
    .AddRazorPages();

services.AddControllers();

AppContext.SetSwitch("Npgsql.DisableDateTimeInfinityConversions", true);

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseHsts();

app.Use(async (context, next) => {
  await next();
  if (context.Response.StatusCode == 404) {
    context.Request.Path = "/Index";
    await next();
  }
});

app.UseRouting();

app.MapStaticAssets();
app.MapRazorPages().WithStaticAssets();
app.MapControllers();

await app.RunAsync();
