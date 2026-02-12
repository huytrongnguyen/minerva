using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;

namespace DataManager.Infrastructure;

public class DataManagerDbContext(DbContextOptions<DataManagerDbContext> options) : DbContext(options) {
  public DbSet<CAMPAIGN_INFO> CampaignInfo { get; set; }
  public DbSet<PRODUCT_INFO> ProductInfo { get; set; }
}

public abstract class DataStore<TEntity, T>(DataManagerDbContext _dbContext) where TEntity : class {
  public IEnumerable<T> List() => Where(x => true);

  private IEnumerable<T> Where(Expression<Func<TEntity, bool>> predicate) => dbContext.Set<TEntity>()
      .Where(predicate).AsNoTracking().Select(FromEntity);

  protected abstract T FromEntity(TEntity entity);

  protected readonly DataManagerDbContext dbContext = _dbContext;
}