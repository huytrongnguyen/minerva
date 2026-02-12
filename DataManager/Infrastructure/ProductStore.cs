using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using DataManager.Product;
using Microsoft.EntityFrameworkCore;

namespace DataManager.Infrastructure;

[Table("product_info")] public class PRODUCT_INFO {
  [Key] public string ProductId { get; set; }
  public DateOnly StartDate { get; set; }
}

public class ProductStore(DataManagerDbContext dbContext) : DataStore<PRODUCT_INFO, ProductInfo>(dbContext), IProductStore {
  public ProductInfo Get(string productId) {
    var entity = dbContext.Set<PRODUCT_INFO>().AsNoTracking().FirstOrDefault(x => x.ProductId == productId);
    return FromEntity(entity) ?? null;
  }

  protected override ProductInfo FromEntity(PRODUCT_INFO entity) {
    return new(
      ProductId: entity.ProductId,
      StartDate: entity.StartDate
    );
  }
}