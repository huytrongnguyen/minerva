using DataManager.Auth;

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
    // .AddDbContext<VenusDbContext>(options => {
    //   options.UseNpgsql(dataSource).UseSnakeCaseNamingConvention();
    // })
    // .AddScoped<UserService>()
    .AddScoped<AuthService>()
    .AddCors()
    .AddControllers();

services.AddRazorPages();

services.AddHealthChecks();

AppContext.SetSwitch("Npgsql.DisableDateTimeInfinityConversions", true);


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

app.UseHealthChecks("/health");

app.MapControllers();
app.MapStaticAssets();
app.MapRazorPages().WithStaticAssets();

await app.RunAsync();
