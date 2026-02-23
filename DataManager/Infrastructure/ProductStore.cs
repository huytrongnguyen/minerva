using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using DataManager.Product;
using DataManager.Shared;
using Microsoft.AspNetCore.DataProtection;

namespace DataManager.Infrastructure;

[Table("product_info")] public class PRODUCT_INFO {
  [Key] public string ProductId { get; set; }
  public DateOnly? StartDate { get; set; }
  public string? ProductName { get; set; }
  public string? DataOwner { get; set; }
  public string? DataProducer { get; set; }
  public string? SqlDialect { get; set; }
  public string? Endpoint { get; set; }
  public string? ClientId { get; set; }
  public string? ClientSecret { get; set; }
  public DateTime CreatedAt { get; set; }
  public DateTime? UpdatedAt { get; set; }
}

public class ProductStore(DataManagerDbContext dbContext, IDataProtectionProvider dataProtectionProvider) : DataStore<PRODUCT_INFO, ProductInfo>(dbContext), IProductStore {
  public ProductInfo Get(string productId) => Get(x => x.ProductId == productId);

  public ProductInfo Update(string productId, ProductInfoPatchRequest request) {
    Update(x => x.ProductId == productId, setter => {
      if (!string.IsNullOrWhiteSpace(request.ProductName)) setter.SetProperty(x => x.ProductName, request.ProductName);
      if (!string.IsNullOrWhiteSpace(request.DataOwner)) setter.SetProperty(x => x.DataOwner, request.DataOwner);
      if (!string.IsNullOrWhiteSpace(request.DataProducer)) setter.SetProperty(x => x.DataProducer, request.DataProducer);
      if (!string.IsNullOrWhiteSpace(request.SqlDialect)) setter.SetProperty(x => x.SqlDialect, request.SqlDialect);

      if (!string.IsNullOrWhiteSpace(request.Endpoint)) setter.SetProperty(x => x.Endpoint, dataProtector.Protect(request.Endpoint));
      if (!string.IsNullOrWhiteSpace(request.ClientId)) setter.SetProperty(x => x.ClientId, dataProtector.Protect(request.ClientId));
      if (!string.IsNullOrWhiteSpace(request.ClientSecret)) setter.SetProperty(x => x.ClientSecret, dataProtector.Protect(request.ClientSecret));
      setter.SetProperty(x => x.UpdatedAt, DateTime.UtcNow);
    });

    return Get(productId);
  }

  public DataConnection GetDataConnection(string productId) {
    var entity = dbSet.First(x => x.ProductId == productId);
    return ToDataConnection(entity);
  }

  protected override ProductInfo ToValue(PRODUCT_INFO entity) {
    return new(
      ProductId: entity.ProductId,
      StartDate: entity.StartDate,
      ProductName: entity.ProductName,
      DataOwner: entity.DataOwner,
      DataProducer: entity.DataProducer,
      SqlDialect: entity.SqlDialect,
      CreatedAt: entity.CreatedAt,
      UpdatedAt: entity.UpdatedAt
    );
  }

  private DataConnection ToDataConnection(PRODUCT_INFO entity) {
    return new(
      SqlDialect: entity.SqlDialect,
      Endpoint: string.IsNullOrWhiteSpace(entity.Endpoint) ? null : dataProtector.Unprotect(entity.Endpoint),
      ClientId: string.IsNullOrWhiteSpace(entity.ClientId) ? null : dataProtector.Unprotect(entity.ClientId),
      ClientSecret: string.IsNullOrWhiteSpace(entity.ClientSecret) ? null : dataProtector.Unprotect(entity.ClientSecret)
    );
  }

  private readonly IDataProtector dataProtector = dataProtectionProvider.CreateProtector("EncryptSensitiveData");
}