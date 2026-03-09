using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using DataManager.Product;

namespace DataManager.Infrastructure;

[Table("product_dashboard")] public class PRODUCT_DASHBOARD {
  [Key] [DatabaseGenerated(DatabaseGeneratedOption.Identity)] public long DashboardId { get; set; }
  public string ProductId { get; set; }
  public string DashboardName { get; set; }
  public bool IsFolder { get; set; }
  public int DashboardOrder { get; set; }
  public long? ParentId { get; set; }
}

public class ProductDashboardStore(DataManagerDbContext dbContext) : DataStore<PRODUCT_DASHBOARD, ProductDashboard>(dbContext), IProductDashboardStore {
  public List<ProductDashboard> List(string productId) =>
    [..dbSet.Where(x => x.ProductId == productId)
            .OrderBy(x => x.ParentId)
            .ThenBy(x => x.DashboardOrder)
            .ThenBy(x => x.DashboardId)
            .Select(ToValue)];

  protected override ProductDashboard ToValue(PRODUCT_DASHBOARD entity) => new(
    DashboardId: entity.DashboardId,
    ProductId: entity.ProductId,
    DashboardName: entity.DashboardName,
    IsFolder: entity.IsFolder,
    DashboardOrder: entity.DashboardOrder,
    ParentId: entity.ParentId
  );
}
