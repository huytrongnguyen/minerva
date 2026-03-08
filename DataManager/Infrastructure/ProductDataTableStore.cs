using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using DataManager.Product;
using Microsoft.EntityFrameworkCore;

namespace DataManager.Infrastructure;

[Table("product_datatable")] public class PRODUCT_DATATABLE {
  [Key] [DatabaseGenerated(DatabaseGeneratedOption.Identity)] public long Id { get; set; }
  public string ProductId { get; set; }
  public string TableName { get; set; }
  public string? TableDisplayName { get; set; }
  public string? TableSemanticName { get; set; }
  public string? TableDesc { get; set; }
}

public class ProductDataTableStore(DataManagerDbContext dbContext) : DataStore<PRODUCT_DATATABLE, ProductDataTable>(dbContext), IProductDataTableStore {
  public List<ProductDataTable> List(string productId) => [..dbSet.Where(x => x.ProductId == productId).Select(ToValue)];

  public List<ProductDataTable> BatchUpdate(string productId, List<ProductDataTable> tables) {
    using var tx = dbContext.Database.BeginTransaction();
    dbSet.Where(x => x.ProductId == productId).ExecuteDelete();
    dbSet.AddRange(tables.Select(t => new PRODUCT_DATATABLE {
      ProductId = productId,
      TableName = t.Name,
      TableDisplayName = t.DisplayName,
      TableSemanticName = t.SemanticName,
      TableDesc = t.Desc
    }));
    dbContext.SaveChanges();
    tx.Commit();
    return List(productId);
  }

  protected override ProductDataTable ToValue(PRODUCT_DATATABLE entity) {
    return new(
      Name: entity.TableName,
      DisplayName: entity.TableDisplayName,
      SemanticName: entity.TableSemanticName,
      Desc: entity.TableDesc
    );
  }
}
