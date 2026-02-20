using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;

namespace DataManager.Infrastructure;

public class DataManagerDbContext(DbContextOptions<DataManagerDbContext> options) : DbContext(options) {
  public DbSet<CAMPAIGN_INFO> CampaignInfo { get; set; }
  public DbSet<PRODUCT_INFO> ProductInfo { get; set; }
}

public abstract class DataStore<TEntity, T>(DataManagerDbContext _dbContext) where TEntity : class {
  public IEnumerable<T> List() => Where(x => true).AsNoTracking().Select(FromEntity);
  public T Get(Expression<Func<TEntity, bool>> predicate) {
    var entity = FirstOrDefault(predicate);
    return FromEntity(entity) ?? default;
  }

  protected T Update(Expression<Func<TEntity, bool>> predicate, Action<TEntity> doUpdate) {
    var entity = First(predicate);
    doUpdate(entity);
    dbSet.Update(entity);
    dbContext.SaveChanges();
    return FromEntity(entity) ?? default;
  }

  protected IQueryable<TEntity> Where(Expression<Func<TEntity, bool>> predicate) => dbSet.Where(predicate);
  protected TEntity FirstOrDefault(Expression<Func<TEntity, bool>> predicate) => dbSet.FirstOrDefault(predicate);
  protected TEntity First(Expression<Func<TEntity, bool>> predicate) => dbSet.First(predicate);
  protected abstract T FromEntity(TEntity entity);

  protected readonly DataManagerDbContext dbContext = _dbContext;
  protected readonly DbSet<TEntity> dbSet = _dbContext.Set<TEntity>();
}