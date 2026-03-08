using System.Text;

namespace DataManager.Product;

public class ReportQueryBuilder {
  public string Build(ReportDefinition report) {
    var view    = report.View;
    var aliases = BuildTableAliases(report.Measures);
    var (from, to, useTimestamp) = ResolveTimeRange(view);

    var sb = new StringBuilder();

    // SELECT
    var select = new List<string> { $"t.{view.TimeField}" };
    if (view.Breakdown != null)
      select.Add($"t.{view.Breakdown.FieldName}");
    foreach (var m in report.Measures)
      select.Add($"{MeasureExpr(m, aliases)} AS \"{m.Name}\"");
    sb.AppendLine($"SELECT {string.Join(", ", select)}");

    // FROM
    var primaryTable = aliases.First().Key;
    sb.AppendLine($"FROM {primaryTable} t");

    // JOIN secondary tables on time field (and breakdown if set)
    foreach (var (table, alias) in aliases.Skip(1)) {
      var on = new List<string> { $"t.{view.TimeField} = {alias}.{view.TimeField}" };
      if (view.Breakdown != null)
        on.Add($"t.{view.Breakdown.FieldName} = {alias}.{view.Breakdown.FieldName}");
      sb.AppendLine($"LEFT JOIN {table} {alias} ON {string.Join(" AND ", on)}");
    }

    // WHERE — time range
    if (useTimestamp) {
      sb.AppendLine($"WHERE t.{view.TimeField} >= TIMESTAMP '{from:yyyy-MM-dd} 00:00:00'");
      sb.AppendLine($"  AND t.{view.TimeField} < TIMESTAMP '{to:yyyy-MM-dd} 00:00:00'");
    } else {
      sb.AppendLine($"WHERE t.{view.TimeField} >= DATE '{from:yyyy-MM-dd}'");
      sb.AppendLine($"  AND t.{view.TimeField} < DATE '{to:yyyy-MM-dd}'");
    }

    // GROUP BY
    var groupCount = 1 + (view.Breakdown != null ? 1 : 0);
    sb.AppendLine($"GROUP BY {string.Join(", ", Enumerable.Range(1, groupCount))}");

    // ORDER BY time ASC
    sb.AppendLine($"ORDER BY 1");

    return sb.ToString();
  }

  // ── Table aliases ─────────────────────────────────────────────────────────

  // Collect all unique EventNames in declaration order; primary table = "t".
  private static Dictionary<string, string> BuildTableAliases(List<MeasureDefinition> measures) {
    var seen    = new List<string>();
    var aliases = new Dictionary<string, string>();

    void Add(string? eventName) {
      if (eventName == null || seen.Contains(eventName)) return;
      seen.Add(eventName);
      aliases[eventName] = seen.Count == 1 ? "t" : $"t{seen.Count - 1}";
    }

    foreach (var m in measures) {
      Add(m.EventName);
      foreach (var c in m.Calculation ?? [])
        if (c.Type == "operand") Add(c.EventName);
    }

    return aliases;
  }

  // ── Measure SQL ───────────────────────────────────────────────────────────

  private static string MeasureExpr(MeasureDefinition m, Dictionary<string, string> aliases) =>
    m.Calculation?.Count > 0
      ? CalcExpr(m.Calculation, aliases)
      : SimpleExpr(m, aliases);

  private static string SimpleExpr(MeasureDefinition m, Dictionary<string, string> aliases) {
    var alias = aliases.TryGetValue(m.EventName ?? "", out var a) ? a : "t";
    return $"{m.Aggregation!.ToUpper()}({alias}.{m.FieldName})";
  }

  // Build formula from operand/operator chain; auto-wraps divisor in NULLIF.
  private static string CalcExpr(List<CalculationDefinition> parts, Dictionary<string, string> aliases) {
    var sb         = new StringBuilder();
    var nullifNext = false;

    foreach (var part in parts) {
      if (part.Type == "operator") {
        sb.Append($" {part.Aggregation} ");
        nullifNext = part.Aggregation == "/";
      } else { // operand
        var alias = aliases.TryGetValue(part.EventName ?? "", out var a) ? a : "t";
        var expr  = $"{part.Aggregation!.ToUpper()}({alias}.{part.FieldName})";
        sb.Append(nullifNext ? $"NULLIF({expr}, 0)" : expr);
        nullifNext = false;
      }
    }

    return sb.ToString();
  }

  // ── Time range ────────────────────────────────────────────────────────────

  // Returns (from, to, useTimestamp).
  // Rolling: today - StartRollingDate .. today - EndRollingDate
  // Exact: parsed from StartExactDate / EndExactDate
  // Mixed: one rolling, one exact
  private static (DateOnly from, DateOnly to, bool useTimestamp) ResolveTimeRange(ViewDefinition view) {
    var today        = DateOnly.FromDateTime(DateTime.UtcNow.Date);
    var useTimestamp = IsTimestamp(view.StartExactDate) || IsTimestamp(view.EndExactDate);

    var from = view.StartExactDate != null
      ? DateOnly.Parse(view.StartExactDate[..10])
      : today.AddDays(-(view.StartRollingDate ?? 30));

    var to = view.EndExactDate != null
      ? DateOnly.Parse(view.EndExactDate[..10])
      : today.AddDays(-(view.EndRollingDate ?? 0) + 1); // +1: exclusive upper bound

    return (from, to, useTimestamp);
  }

  // A date string is a timestamp if it contains a space or 'T' (has time component).
  private static bool IsTimestamp(string? s) =>
    s != null && (s.Contains(' ') || s.Contains('T'));

}
