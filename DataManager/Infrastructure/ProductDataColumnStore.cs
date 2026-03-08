using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using DataManager.Product;
using Microsoft.EntityFrameworkCore;

namespace DataManager.Infrastructure;

[Table("product_datacolumn")] public class PRODUCT_DATACOLUMN {
  [Key] [DatabaseGenerated(DatabaseGeneratedOption.Identity)] public long Id { get; set; }
  public string ProductId { get; set; }
  public string TableName { get; set; }
  public string ColumnName { get; set; }
  public string? ColumnDisplayName { get; set; }
  public string? ColumnSemanticName { get; set; }
  public string? ColumnType { get; set; }
  public string? ColumnDesc { get; set; }
}

public class ProductDataColumnStore(DataManagerDbContext dbContext) : DataStore<PRODUCT_DATACOLUMN, ProductDataColumn>(dbContext), IProductDataColumnStore {
  public List<ProductDataColumn> List(string productId, string tableName) =>
    [..dbSet.Where(x => x.ProductId == productId && x.TableName == tableName).Select(ToValue)];

  public List<ProductDataColumn> BatchUpdate(string productId, string tableName, List<ProductDataColumn> columns) {
    using var tx = dbContext.Database.BeginTransaction();
    dbSet.Where(x => x.ProductId == productId && x.TableName == tableName).ExecuteDelete();
    dbSet.AddRange(columns.Select(c => new PRODUCT_DATACOLUMN {
      ProductId = productId,
      TableName = tableName,
      ColumnName = c.Name,
      ColumnDisplayName = c.DisplayName,
      ColumnSemanticName = c.SemanticName,
      ColumnType = c.Type,
      ColumnDesc = c.Desc
    }));
    dbContext.SaveChanges();
    tx.Commit();
    return List(productId, tableName);
  }

  protected override ProductDataColumn ToValue(PRODUCT_DATACOLUMN entity) {
    return new(
      Name: entity.ColumnName,
      DisplayName: entity.ColumnDisplayName,
      SemanticName: entity.ColumnSemanticName,
      Type: entity.ColumnType,
      Desc: entity.ColumnDesc
    );
  }
}
