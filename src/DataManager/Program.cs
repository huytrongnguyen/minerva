using DataManager.Auth;
using DataManager.Campaign;
using DataManager.Infrastructure;
using DataManager.Shared;
using DataManager.Simulation;
using Microsoft.AspNetCore.Hosting.StaticWebAssets;
using Microsoft.EntityFrameworkCore;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

// var connStringBuilder = new NpgsqlConnectionStringBuilder {
//   SslMode = SslMode.VerifyFull,
//   Host = builder.Configuration["Db:Host"],
//   Port = builder.Configuration["Db:Port"].ParseInt(),
//   Database = builder.Configuration["Db:Name"],
//   Username = builder.Configuration["Db:User"],
//   Password = builder.Configuration["Db:Pass"]
// };

// var dataSourceBuilder = new NpgsqlDataSourceBuilder(connStringBuilder.ConnectionString);
// dataSourceBuilder.EnableDynamicJson();
// var dataSource = dataSourceBuilder.Build();

// Add services to the container.
var services = builder.Services;

services
    // .AddDbContext<DataManagerDbContext>(options => {
    //   options.UseNpgsql(dataSource).UseSnakeCaseNamingConvention();
    // })
    .AddScoped<CampaignService>()
    .AddScoped<AuthService>()
    .AddHostedService<SimulationService>() // Background simulator worker (runs forever)
    .AddCors()
    .AddControllers();

services.AddSignalR();
services.AddHealthChecks();
services.AddRazorPages();

AppContext.SetSwitch("Npgsql.DisableDateTimeInfinityConversions", true);

// StaticWebAssetsLoader.UseStaticWebAssets(builder.Environment, builder.Configuration); 

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

// app.UseExceptionHandler(configure => configure.Run(async context => {
//   var error = context.Features.Get<IExceptionHandlerPathFeature>().Error;
//   await context.Response.WriteAsJsonAsync(new { message = error.Message, trace = error.StackTrace });
// }));

app.MapHub<EventHub>("/hub/event");

app.UseHealthChecks("/health");

app.MapControllers();
app.MapStaticAssets();
app.MapRazorPages().WithStaticAssets();

await app.RunAsync();
