using Microsoft.EntityFrameworkCore;

namespace Minerva.Infrastructure;

public class MasterDbContext(DbContextOptions<MasterDbContext> options) : DbContext(options) {
}