using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using DataManager.Product;
using DataManager.Shared;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;

namespace DataManager.Infrastructure;

[Table("product_info")] public class PRODUCT_INFO {
  [Key] public string ProductId { get; set; }
  public DateOnly StartDate { get; set; }
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
    return Update(x => x.ProductId == productId, entity => {
      if (!string.IsNullOrWhiteSpace(request.ProductName)) entity.ProductName = request.ProductName;
      if (!string.IsNullOrWhiteSpace(request.DataOwner)) entity.DataOwner = request.DataOwner;
      if (!string.IsNullOrWhiteSpace(request.DataProducer)) entity.DataProducer = request.DataProducer;
      if (!string.IsNullOrWhiteSpace(request.SqlDialect)) entity.SqlDialect = request.SqlDialect;

      if (!string.IsNullOrWhiteSpace(request.Endpoint)) entity.Endpoint = dataProtector.Protect(request.Endpoint);
      if (!string.IsNullOrWhiteSpace(request.ClientId)) entity.ClientId = dataProtector.Protect(request.ClientId);
      if (!string.IsNullOrWhiteSpace(request.ClientSecret)) entity.ClientSecret = dataProtector.Protect(request.ClientSecret);
      entity.UpdatedAt = DateTime.UtcNow;
    });
  }

  protected override ProductInfo FromEntity(PRODUCT_INFO entity) {
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

  private readonly IDataProtector dataProtector = dataProtectionProvider.CreateProtector("EncryptSensitiveData");
}