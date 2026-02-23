using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Conventions;
using Microsoft.EntityFrameworkCore.Query;
using Npgsql.Replication;

namespace DataManager.Infrastructure;

public class DataManagerDbContext(DbContextOptions<DataManagerDbContext> options) : DbContext(options) {
  public DbSet<CAMPAIGN_INFO> CampaignInfo { get; set; }
  public DbSet<PRODUCT_INFO> ProductInfo { get; set; }
  public DbSet<PRODUCT_DATATABLE> ProductDatatable { get; set; }
  public DbSet<PRODUCT_DATACOLUMN> ProductDatacolumn { get; set; }
}

public abstract class DataStore<TEntity, T>(DataManagerDbContext _dbContext) where TEntity : class {
  public List<T> List() => [..dbSet.Where(x => true).AsNoTracking().Select(ToValue)];

  public T Get(Expression<Func<TEntity, bool>> predicate) {
    var entity = dbSet.FirstOrDefault(predicate);
    return ToValue(entity) ?? default;
  }

  protected int Update(Expression<Func<TEntity, bool>> predicate, Action<UpdateSettersBuilder<TEntity>> setPropertyCalls) {
    return dbSet.Where(predicate).ExecuteUpdate(setPropertyCalls);
  }

  protected abstract T ToValue(TEntity entity);

  protected readonly DataManagerDbContext dbContext = _dbContext;
  protected readonly DbSet<TEntity> dbSet = _dbContext.Set<TEntity>();
}

public static class DbSetUtils {
  public static void Merge<TEntity>(this DbSet<TEntity> dbSet, TEntity newEntity, Expression<Func<TEntity, bool>> whenMatched, Action<TEntity> doUpdate = null) where TEntity : class {
    var entity = dbSet.FirstOrDefault(whenMatched);
    if (entity == null) {
      dbSet.Add(newEntity);
    } else if (doUpdate != null) {
      doUpdate(entity);
      dbSet.Update(entity);
    }
  }
}