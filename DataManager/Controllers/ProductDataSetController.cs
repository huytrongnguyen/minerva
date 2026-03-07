using DataManager.Auth;
using DataManager.Product;
using Microsoft.AspNetCore.Mvc;

namespace DataManager.Controllers;

[Route("api/products/{productId}/datasets")] [ApiController] [AuthFilter]
public class ProductDataSetController(IProductDataSetStore productDataSetStore) : ControllerBase {
  [HttpGet] public List<ProductDataSet> ListProductDataSets(string productId) => productDataSetStore.List(productId);

  [HttpPatch] public List<ProductDataSet> UpdateProductDataSets(string productId, ProductDataSetUpdateRequest request) => productDataSetStore.BatchUpdate(productId, request.DataSets);
}
