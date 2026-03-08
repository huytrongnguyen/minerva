using System.Text.Json;
using DataManager.Shared;

namespace DataManager.Product;

public partial class ProductService {
  public async Task<Dictionary<string, List<Dictionary<string, object>>>> GetDashboard(string productId, string dashboardId) {
    var connection = GetDataConnection(productId);

    var installsQuery = new QueryDefinition() {
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

    var costBySourceQuery = new QueryDefinition() {
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

    var builder = new QueryBuilder();
    var installsSql = builder.Build(installsQuery); logger.Console($"installs SQL:\n{installsSql}");
    var costBySourceSql = builder.Build(costBySourceQuery); logger.Console($"cost_by_source SQL:\n{costBySourceSql}");

    var results = await Task.WhenAll(
      trinoStore.ExecuteQueryAsync(connection, installsSql),
      trinoStore.ExecuteQueryAsync(connection, costBySourceSql)
    );

    return new Dictionary<string, List<Dictionary<string, object>>> {
      { "installs",       results[0] },
      { "cost_by_source", PivotByMediaSource(results[1]) }
    };
  }

  // Pivot [{report_date, media_source, cost}] → [{report_date, "Facebook Ads": 100, ...}]
  private static List<Dictionary<string, object>> PivotByMediaSource(List<Dictionary<string, object>> rows) =>
    [..rows.GroupBy(r => r["report_date"])
        .Select(g => {
          var row = new Dictionary<string, object> { { "report_date", g.Key } };
          foreach (var r in g) row[((JsonElement)r["media_source"]).GetString()] = r["cost"];
          return row;
        })];
}