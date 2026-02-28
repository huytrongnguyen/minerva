using DataManager.Auth;
using DataManager.Product;
using DataManager.Shared;
using Microsoft.AspNetCore.Mvc;

namespace DataManager.Controllers;

[Route("api/products")] [ApiController] [AuthFilter]
public class ProductController(IProductStore productStore) : ControllerBase {
  [HttpGet] public List<ProductInfo> List() => productStore.List();

  [HttpPost] public ProductInfo Create(string productId) => productStore.Get(productId);

  [HttpGet("{productId}")] public ProductInfo Get(string productId) => productStore.Get(productId);

  [HttpPatch("{productId}")] public ProductInfo Update(string productId, ProductInfoPatchRequest request) => productStore.Update(productId, request);

  [HttpGet("{productId}/navigator")] public List<NavItem> GetNavigator(string productId) {
    return [
      new(
        NavId: "dashboard",
        NavName: "Dashboard",
        NavIcon: null,
        NavPath: null,
        Children: [
          new(
            NavId: "smart-view",
            NavName: "Smart View",
            NavIcon: null,
            NavPath: null,
            Children: [
              new(
                NavId: "overview",
                NavName: "Overview",
                NavIcon: null,
                NavPath: $"/products/{productId}/dashboard/smart-view/overview",
                Children: null
              )
            ]
          )
        ]
      ),
      new(
        NavId: "management",
        NavName: "Management",
        NavIcon: null,
        NavPath: null,
        Children: [
          new(
            NavId: "events",
            NavName: "Events",
            NavIcon: null,
            NavPath: $"/products/{productId}/events",
            Children: null
          ),
          new(
            NavId: "settings",
            NavName: "Settings",
            NavIcon: null,
            NavPath: $"/products/{productId}/settings",
            Children: null
          )
        ]
      )
    ];
  }
}
