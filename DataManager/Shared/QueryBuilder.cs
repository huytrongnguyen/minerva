using System.Text;
using System.Text.RegularExpressions;

namespace DataManager.Shared;

// ── Model ────────────────────────────────────────────────────────────────────

public record QueryDefinition {
  public string Event { get; init; }            // fully-qualified base table
  public List<string> JoinKeys { get; init; } = []; // shared keys for auto-JOIN of secondary events
  public List<Dimension> Dimensions { get; init; } = [];
  public List<Measure> Measures { get; init; } = [];
  public List<Filter> Filters { get; init; } = []; // global WHERE — applied to all measures
  public TimeRange TimeRange { get; init; }
  public List<QueryOrderBy> OrderBy { get; init; } = [];
}

public record Dimension {
  public string Field { get; init; }
  public Granularity? Granularity { get; init; }
  public string Alias { get; init; }
  public string Label { get; init; }
}

public enum Granularity { Day, Week, Month, Quarter, Year }

public record Measure {
  public string Event { get; init; }              // null = base event; else fully-qualified secondary table
  public string Field { get; init; }              // field to aggregate; null when Aggregation = COUNT_EVENTS
  public string Aggregation { get; init; }        // SUM, COUNT, COUNT_DISTINCT, COUNT_EVENTS, AVG, MIN, MAX
  public List<Filter> Filters { get; init; } = []; // per-measure filters — applied as CASE WHEN inside aggregation
  public string Formula { get; init; }            // references other measure aliases: "{revenue} / NULLIF({payers}, 0)"
  public bool Visible { get; init; } = true;      // false = used in formulas only, not returned to frontend
  public string Alias { get; init; }
  public string Label { get; init; }
  public string Format { get; init; }             // d3 format string for frontend
}

public record Filter {
  public string Field { get; init; }
  public string Operator { get; init; }           // eq, neq, gt, gte, lt, lte, in, not_in, like
  public object Value { get; init; }
  public List<object> Values { get; init; } = [];
}

public record TimeRange {
  public string Field { get; init; }
  public string FieldType { get; init; } = "date"; // "date" or "timestamp"
  public string Preset { get; init; }              // last7days, last30days, last90days, mtd, ytd
  public DateOnly? From { get; init; }
  public DateOnly? To { get; init; }
}

public record QueryOrderBy(string Alias, string Direction = "ASC");

// ── Builder ──────────────────────────────────────────────────────────────────

public class QueryBuilder {
  public string Build(QueryDefinition q) {
    // Assign table aliases: base = "t", secondary events = "t1", "t2", …
    var tableAliases = new Dictionary<string, string> { [q.Event] = "t" };
    var counter = 0;
    foreach (var m in q.Measures.Where(m => m.Event != null && m.Event != q.Event))
      tableAliases.TryAdd(m.Event, $"t{++counter}");

    // Pre-compute SQL for every simple measure (including hidden ones — needed for formula substitution)
    var measureSql = q.Measures
      .Where(m => m.Formula == null)
      .ToDictionary(m => m.Alias, m => SimpleMeasureExpr(m, tableAliases));

    var sb = new StringBuilder();

    // SELECT — only visible measures
    var select = new List<string>();
    foreach (var d in q.Dimensions)
      select.Add($"{DimExpr(d)} AS {d.Alias}");
    foreach (var m in q.Measures.Where(m => m.Visible))
      select.Add($"{ResolveMeasure(m, measureSql, tableAliases)} AS {m.Alias}");
    sb.AppendLine($"SELECT {string.Join(", ", select)}");

    // FROM
    sb.AppendLine($"FROM {q.Event} t");

    // AUTO JOINs — one per unique secondary event, joined on JoinKeys
    foreach (var (table, alias) in tableAliases.Where(kv => kv.Value != "t")) {
      var on = q.JoinKeys.Select(k => $"t.{k} = {alias}.{k}");
      sb.AppendLine($"LEFT JOIN {table} {alias} ON {string.Join(" AND ", on)}");
    }

    // WHERE — global filters + time range
    var where = BuildWhere(q.Filters, q.TimeRange);
    if (where.Count > 0)
      sb.AppendLine($"WHERE {string.Join(" AND ", where)}");

    // GROUP BY (positional)
    if (q.Dimensions.Count > 0)
      sb.AppendLine($"GROUP BY {string.Join(", ", Enumerable.Range(1, q.Dimensions.Count))}");

    // ORDER BY
    if (q.OrderBy.Count > 0)
      sb.AppendLine($"ORDER BY {string.Join(", ", q.OrderBy.Select(o => $"{o.Alias} {o.Direction}"))}");

    return sb.ToString();
  }

  // ── Dimension ─────────────────────────────────────────────────────────────

  private static string DimExpr(Dimension d) => d.Granularity switch {
    Granularity.Day     => $"date_trunc('day', t.{d.Field})",
    Granularity.Week    => $"date_trunc('week', t.{d.Field})",
    Granularity.Month   => $"date_trunc('month', t.{d.Field})",
    Granularity.Quarter => $"date_trunc('quarter', t.{d.Field})",
    Granularity.Year    => $"date_trunc('year', t.{d.Field})",
    _                   => $"t.{d.Field}"
  };

  // ── Measure ───────────────────────────────────────────────────────────────

  // Builds SQL for a simple (non-formula) measure, with per-measure CASE WHEN filters
  private static string SimpleMeasureExpr(Measure m, Dictionary<string, string> tableAliases) {
    var alias = m.Event != null && tableAliases.TryGetValue(m.Event, out var a) ? a : "t";
    var condition = BuildMeasureCondition(m.Filters, alias);

    return m.Aggregation switch {
      "COUNT_EVENTS"   => condition != null
                          ? $"COUNT(CASE WHEN {condition} THEN 1 END)"
                          : "COUNT(*)",
      "COUNT_DISTINCT" => condition != null
                          ? $"COUNT(DISTINCT CASE WHEN {condition} THEN {alias}.{m.Field} END)"
                          : $"COUNT(DISTINCT {alias}.{m.Field})",
      _                => condition != null
                          ? $"{m.Aggregation}(CASE WHEN {condition} THEN {alias}.{m.Field} ELSE NULL END)"
                          : $"{m.Aggregation}({alias}.{m.Field})"
    };
  }

  // Resolves a measure — either expands a formula or returns simple measure SQL
  private static string ResolveMeasure(Measure m, Dictionary<string, string> measureSql, Dictionary<string, string> tableAliases) {
    if (m.Formula == null) return SimpleMeasureExpr(m, tableAliases);
    return Regex.Replace(m.Formula, @"\{(\w+)\}", match => {
      var key = match.Groups[1].Value;
      return measureSql.TryGetValue(key, out var sql) ? sql : match.Value;
    });
  }

  // Builds CASE WHEN condition string from per-measure filters
  private static string BuildMeasureCondition(List<Filter> filters, string alias) {
    if (filters == null || filters.Count == 0) return null;
    return string.Join(" AND ", filters.Select(f => FilterExpr(f, alias)));
  }

  // ── WHERE ─────────────────────────────────────────────────────────────────

  private static List<string> BuildWhere(List<Filter> filters, TimeRange tr) {
    var parts = new List<string>();

    if (tr != null) {
      var (from, to) = ResolvePreset(tr);
      if (tr.FieldType == "timestamp") {
        parts.Add($"t.{tr.Field} >= TIMESTAMP '{from:yyyy-MM-dd} 00:00:00'");
        parts.Add($"t.{tr.Field} < TIMESTAMP '{to:yyyy-MM-dd} 00:00:00'");
      } else {
        parts.Add($"t.{tr.Field} >= DATE '{from:yyyy-MM-dd}'");
        parts.Add($"t.{tr.Field} < DATE '{to:yyyy-MM-dd}'");
      }
    }

    foreach (var f in filters ?? [])
      parts.Add(FilterExpr(f, "t"));

    return parts;
  }

  private static string Literal(object v) => v is string s ? $"'{s}'" : $"{v}";

  private static string FilterExpr(Filter f, string alias) => f.Operator switch {
    "in"     => $"{alias}.{f.Field} IN ({string.Join(", ", f.Values.Select(Literal))})",
    "not_in" => $"{alias}.{f.Field} NOT IN ({string.Join(", ", f.Values.Select(Literal))})",
    "gt"     => $"{alias}.{f.Field} > {Literal(f.Value)}",
    "gte"    => $"{alias}.{f.Field} >= {Literal(f.Value)}",
    "lt"     => $"{alias}.{f.Field} < {Literal(f.Value)}",
    "lte"    => $"{alias}.{f.Field} <= {Literal(f.Value)}",
    "like"   => $"{alias}.{f.Field} LIKE '{f.Value}'",
    "neq"    => $"{alias}.{f.Field} <> {Literal(f.Value)}",
    _        => $"{alias}.{f.Field} = {Literal(f.Value)}"
  };

  // ── Time range ────────────────────────────────────────────────────────────

  private static (DateOnly from, DateOnly to) ResolvePreset(TimeRange tr) {
    if (tr.Preset == null) return (tr.From!.Value, tr.To!.Value);
    var today = DateOnly.FromDateTime(DateTime.UtcNow.Date);
    return tr.Preset switch {
      "last7days"  => (today.AddDays(-7),  today),
      "last30days" => (today.AddDays(-30), today),
      "last90days" => (today.AddDays(-90), today),
      "mtd"        => (new DateOnly(today.Year, today.Month, 1), today),
      "ytd"        => (new DateOnly(today.Year, 1, 1),           today),
      _            => (today.AddDays(-30), today)
    };
  }
}
