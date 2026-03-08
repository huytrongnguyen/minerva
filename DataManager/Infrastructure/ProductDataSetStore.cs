using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using DataManager.Product;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace DataManager.Infrastructure;

[Table("product_dataset")] public class PRODUCT_DATASET {
  [Key] [DatabaseGenerated(DatabaseGeneratedOption.Identity)] public long Id { get; set; }
  public string ProductId { get; set; }
  public string DatasetName { get; set; }
}

public class ProductDataSetStore(DataManagerDbContext dbContext) : DataStore<PRODUCT_DATASET, ProductDataSet>(dbContext), IProductDataSetStore {
  public List<ProductDataSet> List(string productId) => [..dbSet.Where(x => x.ProductId == productId).Select(ToValue)];

  public List<ProductDataSet> BatchUpdate(string productId, List<string> dataSetNames) {
    using var tx = dbContext.Database.BeginTransaction();
    dbSet.Where(x => x.ProductId == productId).ExecuteDelete();
    dbSet.AddRange(dataSetNames.Select(name => new PRODUCT_DATASET { ProductId = productId, DatasetName = name }));
    dbContext.SaveChanges();
    tx.Commit();
    return List(productId);
  }

  protected override ProductDataSet ToValue(PRODUCT_DATASET entity) {
    return new(Name: entity.DatasetName);
  }
}
