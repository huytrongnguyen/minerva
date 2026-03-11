using DataManager.Auth;
using DataManager.Infrastructure;
using DataManager.Product;
using DataManager.Shared;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Hosting.StaticWebAssets;
using Microsoft.EntityFrameworkCore;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

var connStringBuilder = new NpgsqlConnectionStringBuilder {
  SslMode = SslMode.Require,
  Host = builder.Configuration["Db:Host"],
  Port = builder.Configuration["Db:Port"].ParseInt(),
  Database = builder.Configuration["Db:Name"],
  Username = builder.Configuration["Db:User"],
  Password = builder.Configuration["Db:Pass"]
};

var dataSourceBuilder = new NpgsqlDataSourceBuilder(connStringBuilder.ConnectionString);
dataSourceBuilder.EnableDynamicJson();
var dataSource = dataSourceBuilder.Build();

// Add services to the container.
var services = builder.Services;

services
    .AddDbContext<DataManagerDbContext>(options => {
      options.UseNpgsql(dataSource).UseSnakeCaseNamingConvention();
    })
    .AddScoped<IProductStore, ProductStore>()
    .AddScoped<IProductDataSetStore, ProductDataSetStore>()
    .AddScoped<IProductDataTableStore, ProductDataTableStore>()
    .AddScoped<IProductDataColumnStore, ProductDataColumnStore>()
    .AddScoped<IProductDashboardStore, ProductDashboardStore>()
    .AddScoped<ProductService>()
    .AddCors()
    .AddControllers();

services.AddHttpClient<ITrinoStore, TrinoStore>();
services.AddHttpClient<AuthService>();
services.AddDataProtection();
services.AddHealthChecks();
services.AddRazorPages();

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
AppContext.SetSwitch("Npgsql.DisableDateTimeInfinityConversions", true);

StaticWebAssetsLoader.UseStaticWebAssets(builder.Environment, builder.Configuration);

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseHsts();

app.Use(async (context, next) => {
  await next();
  if (context.Response.StatusCode == 404) {
      context.Request.Path = "/";
    await next();
  }
});

app.UseRouting();

// custom jwt auth middleware
app.UseMiddleware<AuthMiddleware>();

app.UseAuthorization();

app.UseExceptionHandler(configure => configure.Run(async context => {
  var error = context.Features.Get<IExceptionHandlerPathFeature>().Error;
  await context.Response.WriteAsJsonAsync(new { message = $"{error.Message.TrimEnd(".")}. {error.InnerException}" });
}));

app.UseHealthChecks("/health");

app.MapControllers();
app.MapStaticAssets();
app.MapRazorPages().WithStaticAssets();

await app.RunAsync();
