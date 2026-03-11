using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using DataManager.Product;
using DataManager.Shared;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace DataManager.Infrastructure;

[Table("product_dashboard")] public class PRODUCT_DASHBOARD {
  [Key] [DatabaseGenerated(DatabaseGeneratedOption.Identity)] public long DashboardId { get; set; }
  public string ProductId { get; set; }
  public string DashboardName { get; set; }
  public bool IsFolder { get; set; }
  public int DashboardOrder { get; set; }
  public long? ParentId { get; set; }
  [Column(TypeName = "jsonb")] public List<ReportDefinition>? Reports { get; set; }
}

public class ProductDashboardStore(DataManagerDbContext dbContext) : DataStore<PRODUCT_DASHBOARD, ProductDashboard>(dbContext), IProductDashboardStore {
  public List<ProductDashboard> List(string productId) =>
    [..dbSet.Where(x => x.ProductId == productId)
            .OrderBy(x => x.ParentId)
            .ThenBy(x => x.DashboardOrder)
            .ThenBy(x => x.DashboardId)
            .Select(ToValue)];

  public ProductDashboard Get(string productId, long dashboardId) =>
    Get(x => x.DashboardId == dashboardId && x.ProductId == productId);

  public ProductDashboard Update(string productId, long dashboardId, ProductDashboard request) {
    dbSet.Where(x => x.DashboardId == dashboardId && x.ProductId == productId).ExecuteUpdate(setters => {
      if (request.Name != null) setters.SetProperty(x => x.DashboardName, request.Name);
      if (request.IsFolder != null) setters.SetProperty(x => x.IsFolder, request.IsFolder);
      if (request.DashboardOrder != null) setters.SetProperty(x => x.DashboardOrder, request.DashboardOrder);
      if (request.ParentId != null) setters.SetProperty(x => x.ParentId, request.ParentId);
      if (request.Reports != null) setters.SetProperty(x => x.Reports, request.Reports);
    });

    return Get(productId, dashboardId);
  }

  protected override ProductDashboard ToValue(PRODUCT_DASHBOARD entity) => new(
    ProductId: entity.ProductId,
    DashboardId: entity.DashboardId,
    Name: entity.DashboardName,
    IsFolder: entity.IsFolder,
    DashboardOrder: entity.DashboardOrder,
    ParentId: entity.ParentId,
    Reports: entity.Reports //string.IsNullOrWhiteSpace(entity.Reports) ? null : ObjectUtils.Decode<List<ReportDefinition>>(entity.Reports)
  );
}
