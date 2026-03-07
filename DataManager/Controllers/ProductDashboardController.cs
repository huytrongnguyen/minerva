using DataManager.Auth;
using DataManager.Product;
using DataManager.Shared;
using Microsoft.AspNetCore.Mvc;

namespace DataManager.Controllers;

[Route("api/products/{productId}/dashboard")] [ApiController] [AuthFilter]
public class ProductDashboardController(ProductAdapter productAdapter,
                                        ITrinoStore trinoStore, ILogger<ProductDashboardController> logger) : ControllerBase {
  [HttpGet("{viewId}")] public async Task<Dictionary<string, List<Dictionary<string, object>>>> GetDashboard(string productId, string viewId) {
    var connection = productAdapter.GetDataConnection(productId);

    var installsQuery = @"
    select report_date, sum(installs) as installs, sum(cost) / sum(installs) as cpi
    from postgres_ballistar.public.mkt_user_active
    where (current_date - interval '30' day) <= report_date and report_date < current_date
    group by report_date
    ";

    var installsResultSet = await trinoStore.ExecuteQueryAsync(connection, installsQuery);

    return new Dictionary<string, List<Dictionary<string, object>>> {
      { "installs", installsResultSet }
    };
  }
}
