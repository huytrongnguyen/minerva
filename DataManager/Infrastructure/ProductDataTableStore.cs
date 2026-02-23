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
  public List<ProductDataTable> List(string productId) {
    var tables = dbSet.Where(x => x.ProductId == productId).ToList();
    return [..tables.Select(table => {
      var columns = dbContext.ProductDatacolumn
          .Where(x => x.ProductId == productId && x.TableName == table.TableName)
          .Select(ToProductDataColumn)
          .ToList();
      return ToProductDataTable(table, columns);
    })];
  }

  public List<ProductDataTable> BatchUpdate(string productId, List<ProductDataTable> tables) {
    foreach(var table in tables) {
      dbSet.Merge(
        new PRODUCT_DATATABLE { ProductId = productId, DatasetName = table.DataSetName, TableName = table.Name },
        x => x.ProductId == productId && x.DatasetName == table.DataSetName && x.TableName == table.Name
      );

      foreach(var column in table.Columns) {
        dbContext.ProductDatacolumn.Merge(
          new PRODUCT_DATACOLUMN {
            ProductId = productId, DatasetName = table.DataSetName, TableName = table.Name,
            ColumnName = column.Name, ColumnType = column.Type, ColumnDesc = column.Desc
          },
          x => x.ProductId == productId && x.DatasetName == table.DataSetName && x.TableName == table.Name
        );
      }
    }

    dbContext.SaveChanges();
    return List(productId);
  }

  protected override ProductDataTable ToValue(PRODUCT_DATATABLE entity) {
    return ToProductDataTable(entity, []);
  }

  private static ProductDataTable ToProductDataTable(PRODUCT_DATATABLE entity, List<ProductDataColumn> columns) {
    return new(
      DataSetName: entity.DatasetName,
      Name: entity.TableName,
      DisplayName: entity.TableDisplayName,
      SemanticName: entity.TableSemanticName,
      Desc: entity.TableDesc,
      Columns: columns
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
