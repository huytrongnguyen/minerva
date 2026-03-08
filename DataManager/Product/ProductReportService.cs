using System.Text.Json;
using DataManager.Shared;

namespace DataManager.Product;

public partial class ProductService {
  // ── Layout endpoint ───────────────────────────────────────────────────────
  // Fast — no Trino. Returns the dashboard structure so the client can render
  // a skeleton and kick off per-report requests in parallel.

  public DashboardLayout GetDashboardLayout(string dashboardId) {
    var dashboard = BuildDashboard(dashboardId);
    return new DashboardLayout(
      dashboard.Name,
      [..dashboard.Reports.Select(r => new ReportStub(Slug(r.Name), r.Name))]
    );
  }

  // ── Per-report endpoint ───────────────────────────────────────────────────
  // Executes exactly one Trino query; called in parallel from the client.

  public async Task<ReportResult> GetReport(string productId, string dashboardId, string reportId) {
    var connection = GetDataConnection(productId);
    var dashboard  = BuildDashboard(dashboardId);
    var report     = dashboard.Reports.FirstOrDefault(r => Slug(r.Name) == reportId)
                     ?? throw new Exception($"Report '{reportId}' not found in dashboard '{dashboardId}'.");

    return await ExecuteReport(report, connection);
  }

  // ── Dashboard definitions ─────────────────────────────────────────────────
  // Inline — not static readonly, so it's easy to inspect and will swap to
  // DB loading later without any structural change.

  private static DashboardDefinition BuildDashboard(string dashboardId) => dashboardId switch {
    "complete-view" => new DashboardDefinition(
      Name: "Complete View",
      Reports: [
        new ReportDefinition(
          Name: "Installs & CPI",
          Measures: [
            new MeasureDefinition(
              Name: "Installs",
              EventName: "postgres_ballistar.public.mkt_user_active",
              FieldName: "installs",
              Aggregation: "sum",
              Calculation: null
            ),
            new MeasureDefinition(
              Name: "CPI",
              EventName: null,
              FieldName: null,
              Aggregation: null,
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
          Measures: [
            new MeasureDefinition(
              Name: "Cost",
              EventName: "postgres_ballistar.public.mkt_user_active",
              FieldName: "cost",
              Aggregation: "sum",
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
    ),
    _ => throw new Exception($"Dashboard '{dashboardId}' not found.")
  };

  // ── Private ───────────────────────────────────────────────────────────────

  private async Task<ReportResult> ExecuteReport(ReportDefinition report, DataConnection connection) {
    var sql  = new ReportQueryBuilder().Build(report);
    logger.Console($"[{report.Name}] SQL:\n{sql}");

    var rows = await trinoStore.ExecuteQueryAsync(connection, sql);

    return report.View.Breakdown != null
      ? PivotResult(report, rows)
      : FlatResult(report, rows);
  }

  // No breakdown — convert rows to columnar: one array per field.
  private static ReportResult FlatResult(ReportDefinition report, List<Dictionary<string, object>> rows) {
    var timeField = report.View.TimeField;

    var timeCol = new List<object> { timeField };
    timeCol.AddRange(rows.Select(r => r[timeField]));

    var dataColumns = new List<List<object>> { timeCol };
    foreach (var m in report.Measures) {
      var slug = Slug(m.Name);
      var col  = new List<object> { slug };
      col.AddRange(rows.Select(r => r.TryGetValue(slug, out var v) ? v : null));
      dataColumns.Add(col);
    }

    return new ReportResult(report.Name, BuildColumns(report), dataColumns);
  }

  // Breakdown — one column per distinct breakdown value.
  // Sparse cells (no row for that date × value) are filled with null.
  private static ReportResult PivotResult(ReportDefinition report, List<Dictionary<string, object>> rows) {
    var timeField      = report.View.TimeField;
    var breakdownField = report.View.Breakdown.FieldName;
    var measureSlug    = Slug(report.Measures[0].Name);

    var dates       = rows.Select(r => GetString(r, timeField)).Distinct().ToList();
    var pivotValues = rows.Select(r => GetString(r, breakdownField)).Distinct().ToList();
    var lookup      = rows.ToDictionary(
      r => (GetString(r, timeField), GetString(r, breakdownField)),
      r => r[measureSlug]
    );

    var timeCol = new List<object> { timeField };
    timeCol.AddRange(dates.Cast<object>());

    var dataColumns = new List<List<object>> { timeCol };
    foreach (var v in pivotValues) {
      var col = new List<object> { v };
      col.AddRange(dates.Select(d => lookup.TryGetValue((d, v), out var val) ? val : null));
      dataColumns.Add(col);
    }

    var columnInfos = new List<ColumnInfo> { new(timeField, "Date") };
    columnInfos.AddRange(pivotValues.Select(v => new ColumnInfo(v, v)));

    return new ReportResult(report.Name, columnInfos, dataColumns);
  }

  private static List<ColumnInfo> BuildColumns(ReportDefinition report) {
    var cols = new List<ColumnInfo> { new(report.View.TimeField, "Date") };
    if (report.View.Breakdown != null)
      cols.Add(new(report.View.Breakdown.FieldName, report.View.Breakdown.FieldName));
    cols.AddRange(report.Measures.Select(m => new ColumnInfo(Slug(m.Name), m.Name)));
    return cols;
  }

  private static string GetString(Dictionary<string, object> row, string key) =>
    row[key] is JsonElement je ? je.GetString() : row[key]?.ToString() ?? "";

  private static string Slug(string name) =>
    name.ToLower().Replace(' ', '_');
}
