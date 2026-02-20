using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using DataManager.Product;

namespace DataManager.Infrastructure;

[Table("product_event")] public class PRODUCT_EVENT {
  [Key] [DatabaseGenerated(DatabaseGeneratedOption.Identity)] public long Id { get; set; }
  public string ProductId { get; set; }
  public string EventName { get; set; }
  public string? EventDisplayName { get; set; }
  public string? EventSemanticName { get; set; }
}

public class ProductEventStore(DataManagerDbContext dbContext) : DataStore<PRODUCT_EVENT, ProductEvent>(dbContext), IProductEventStore {
  public IEnumerable<ProductEvent> List(string productId) => Where(x => x.ProductId == productId).Select(ToValue);

  protected override ProductEvent ToValue(PRODUCT_EVENT entity) {
    return new(
      ProductId: entity.ProductId,
      EventName: entity.EventName,
      EventDisplayName: entity.EventDisplayName,
      EventSemanticName: entity.EventSemanticName
    );
  }
}