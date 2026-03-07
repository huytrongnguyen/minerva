using System.Text.Json;
using DataManager.Auth;
using DataManager.Product;
using DataManager.Shared;
using Microsoft.AspNetCore.Mvc;

namespace DataManager.Controllers;

[Route("api/products/{productId}/dashboard")] [ApiController] [AuthFilter]
public class ProductDashboardController(ProductAdapter productAdapter,
                                        ITrinoStore trinoStore, ILogger<ProductDashboardController> logger) : ControllerBase {
  static readonly QueryBuilder _builder = new();

  static readonly QueryDefinition _installsQuery = new() {
    Event = "postgres_ballistar.public.mkt_user_active",
    Dimensions = [
      new() { Field = "report_date", Alias = "report_date", Label = "Date" }
    ],
    Measures = [
      new() { Field = "installs", Aggregation = "SUM", Alias = "installs", Label = "Installs", Format = ",.0f" },
      new() { Field = "cost",     Aggregation = "SUM", Alias = "cost",     Label = "Cost",     Format = "$,.2f" },
      new() { Formula = "{cost} / NULLIF({installs}, 0)", Alias = "cpi", Label = "CPI", Format = "$,.4f" }
    ],
    TimeRange = new() { Field = "report_date", Preset = "last30days" },
    OrderBy = [new("report_date")]
  };

  // Groups by report_date + media_source so the controller can pivot into stacked-bar format
  static readonly QueryDefinition _costBySourceQuery = new() {
    Event = "postgres_ballistar.public.mkt_user_active",
    Dimensions = [
      new() { Field = "report_date",  Alias = "report_date",  Label = "Date" },
      new() { Field = "media_source", Alias = "media_source", Label = "Media Source" }
    ],
    Measures = [
      new() { Field = "cost", Aggregation = "SUM", Alias = "cost", Label = "Cost", Format = "$,.2f" }
    ],
    Filters = [
      new() { Field = "cost", Operator = "gt", Value = 0 }
    ],
    TimeRange = new() { Field = "report_date", Preset = "last30days" },
    OrderBy = [new("report_date"), new("cost", "DESC")]
  };

  // Pivot [{report_date, media_source, cost}] → [{report_date, "Facebook Ads": 100, ...}]
  private static List<Dictionary<string, object>> PivotByMediaSource(List<Dictionary<string, object>> rows) =>
    [..rows.GroupBy(r => r["report_date"])
        .Select(g => {
          var row = new Dictionary<string, object> { { "report_date", g.Key } };
          foreach (var r in g) row[((JsonElement)r["media_source"]).GetString()] = r["cost"];
          return row;
        })];

  [HttpGet("{dashboardId}")] public async Task<Dictionary<string, List<Dictionary<string, object>>>> GetDashboard(string productId, string dashboardId) {
    _ = dashboardId;
    var connection = productAdapter.GetDataConnection(productId);
    var installsSql = _builder.Build(_installsQuery);
    var costBySourceSql = _builder.Build(_costBySourceQuery);
    logger.Console($"installs SQL:\n{installsSql}");
    logger.Console($"cost_by_source SQL:\n{costBySourceSql}");
    var results = await Task.WhenAll(
      trinoStore.ExecuteQueryAsync(connection, installsSql),
      trinoStore.ExecuteQueryAsync(connection, costBySourceSql)
    );
    return new Dictionary<string, List<Dictionary<string, object>>> {
      { "installs",       results[0] },
      { "cost_by_source", PivotByMediaSource(results[1]) }
    };
  }
}
