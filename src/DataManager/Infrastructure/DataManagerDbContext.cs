using Microsoft.EntityFrameworkCore;

namespace DataManager.Infrastructure;

public class DataManagerDbContext(DbContextOptions<DataManagerDbContext> options) : DbContext(options) {}