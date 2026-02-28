using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using DataManager.Product;
using DataManager.Shared;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace DataManager.Infrastructure;

[Table("product_datatable")] public class PRODUCT_DATATABLE {
  [Key] [DatabaseGenerated(DatabaseGeneratedOption.Identity)] public long Id { get; set; }
  public string ProductId { get; set; }
  public string DatasetName { get; set; }
  public string TableName { get; set; }
  public string? TableDisplayName { get; set; }
  public string? TableSemanticName { get; set; }
  public string? TableDesc { get; set; }
}

public class ProductDataTableStore(DataManagerDbContext dbContext) : DataStore<PRODUCT_DATATABLE, ProductDataTable>(dbContext), IProductDataTableStore {
  public List<ProductDataTable> List(string productId) => [..dbSet.Where(x => x.ProductId == productId).Select(ToValue)];

  public List<ProductDataTable> BatchUpdate(string productId, List<ProductDataTable> tables) {
    foreach(var table in tables) {
      dbSet.Merge(
        new PRODUCT_DATATABLE { ProductId = productId, DatasetName = table.DataSetName, TableName = table.Name },
        x => x.ProductId == productId && x.DatasetName == table.DataSetName && x.TableName == table.Name,
        x => {
          x.TableDisplayName = table.DisplayName;
          x.TableSemanticName = table.SemanticName;
          x.TableDesc = table.Desc;
        }
      );
    }

    dbContext.SaveChanges();
    return List(productId);
  }

  protected override ProductDataTable ToValue(PRODUCT_DATATABLE entity) {
    return new(
      DataSetName: entity.DatasetName,
      Name: entity.TableName,
      DisplayName: entity.TableDisplayName,
      SemanticName: entity.TableSemanticName,
      Desc: entity.TableDesc
    );
  }

  private static ProductDataColumn ToProductDataColumn(PRODUCT_DATACOLUMN entity) {
    return new(
      Name: entity.ColumnName,
      DisplayName: entity.ColumnDisplayName,
      SemanticName: entity.ColumnSemanticName,
      Type: entity.ColumnType,
      Desc: entity.ColumnDesc
    );
  }
}
