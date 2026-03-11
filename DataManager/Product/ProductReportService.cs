using System.Text.Json;
using DataManager.Shared;

namespace DataManager.Product;

public partial class ProductService {
  public DashboardLayout GetDashboard(string dashboardId) {
    return new DashboardLayout(
      Name: "Complete View",
      Reports: [
        new ReportDefinition(
          Name: "Installs & CPI",
          RowIndex: 1, ColIndex: 1, ColWidth: 6,
          Measures: [
            new MeasureDefinition(
              Name: "Installs",
              EventName: "postgres_ballistar.public.mkt_user_active",
              FieldName: "installs",
              Aggregation: "sum",
              ChartType: "bar",
              Stacked: false,
              SecondaryAxis: false,
              Calculation: null
            ),
            new MeasureDefinition(
              Name: "CPI",
              EventName: null,
              FieldName: null,
              Aggregation: null,
              ChartType: "line",
              Stacked: false,
              SecondaryAxis: true,
              Calculation: [
                new CalculationDefinition("operand",  "postgres_ballistar.public.mkt_user_active", "cost",     "sum"),
                new CalculationDefinition("operator", null,                                         null,       "/"),
                new CalculationDefinition("operand",  "postgres_ballistar.public.mkt_user_active", "installs", "sum"),
              ]
            )
          ],
          View: new ViewDefinition(
            TimeField:        "report_date",
            Breakdown:        null,
            StartRollingDate: 30,
            EndRollingDate:   1,
            StartExactDate:   null,
            EndExactDate:     null
          )
        ),
        new ReportDefinition(
          Name: "Cost by OS",
          RowIndex: 1, ColIndex: 2, ColWidth: 6,
          Measures: [
            new MeasureDefinition(
              Name: "Cost",
              EventName: "postgres_ballistar.public.mkt_user_active",
              FieldName: "cost",
              Aggregation: "sum",
              ChartType: "bar",
              Stacked: true,
              SecondaryAxis: false,
              Calculation: null
            )
          ],
          View: new ViewDefinition(
            TimeField:        "report_date",
            Breakdown:        new BreakdownDefinition("platform"),
            StartRollingDate: 30,
            EndRollingDate:   1,
            StartExactDate:   null,
            EndExactDate:     null
          )
        )
      ]
    );
  }

  // public DashboardLayout UpdateDashboard(string dashboardId, ProductDashboardUpdateRequest request) {
  //   return GetDashboard(dashboardId);
  // }

  public async Task<ReportResult> ExecuteReport(string productId, ProductReportExecutePostRequest request) {
    var connection = GetDataConnection(productId);
    return await ExecuteReport(request.Report, connection);
  }

  // ── Private ───────────────────────────────────────────────────────────────

  private async Task<ReportResult> ExecuteReport(ReportDefinition report, DataConnection connection) {
    var sql  = new ReportQueryBuilder().Build(report);
    logger.Console($"[{report.Name}] SQL:\n{sql}");

    var rows = await trinoStore.ExecuteQueryAsync(connection, sql);

    return BuildResult(report, rows);
  }

  // Converts rows → columnar format for C3.
  // Breakdown: pivots on the breakdown field — one column per distinct value,
  //            Groups carries the column names so the client can stack them.
  // Flat: time column + one column per measure. Groups is null.
  private static ReportResult BuildResult(ReportDefinition report, List<Dictionary<string, object>> rows) {
    var timeField = report.View.TimeField;
    var data      = new List<List<object>>();

    if (report.View.Breakdown != null) {
      var breakdownField = report.View.Breakdown.FieldName;
      var measureName    = report.Measures[0].Name;

      var dates  = rows.Select(r => GetString(r, timeField)).Distinct().ToList();
      var groups = rows.Select(r => GetString(r, breakdownField)).Distinct().ToList();
      var lookup = rows.ToDictionary(
        r => (GetString(r, timeField), GetString(r, breakdownField)),
        r => r.TryGetValue(measureName, out var v) ? v : null);

      var timeCol = new List<object> { timeField };
      timeCol.AddRange(dates);
      data.Add(timeCol);

      foreach (var g in groups) {
        var col = new List<object> { g };
        col.AddRange(dates.Select(d => lookup.TryGetValue((d, g), out var v) ? v : null));
        data.Add(col);
      }

      return new ReportResult(report.Name, data, groups);
    } else {
      var timeCol = new List<object> { timeField };
      timeCol.AddRange(rows.Select(r => r.TryGetValue(timeField, out var v) ? v : null));
      data.Add(timeCol);

      foreach (var m in report.Measures) {
        var col = new List<object> { m.Name };
        col.AddRange(rows.Select(r => r.TryGetValue(m.Name, out var v) ? v : null));
        data.Add(col);
      }

      return new ReportResult(report.Name, data, null);
    }
  }

  private static string GetString(Dictionary<string, object> row, string key) =>
    row[key] is JsonElement je ? je.GetString() ?? "" : row[key]?.ToString() ?? "";

}
