namespace DataManager.Product;

public record DashboardDefinition(
  string Name,
  List<ReportDefinition> Reports
);

public record ReportDefinition(
  string Name,
  int RowIndex,
  int ColIndex,
  int ColWidth, // Align with Bootstrap grid: XS -> 2, S -> 3, M -> 6, L -> 12
  List<MeasureDefinition> Measures,
  ViewDefinition View
);

public record MeasureDefinition(
  string Name,
  string? EventName,
  string? FieldName,
  string? Aggregation,
  string? ChartType,
  bool? Stacked,
  bool? SecondaryAxis,
  List<CalculationDefinition>? Calculation
);

public record CalculationDefinition(
  string Type, // operand, operator
  string? EventName,
  string? FieldName,
  string Aggregation
);

public record ViewDefinition(
  string TimeField,
  BreakdownDefinition? Breakdown,
  int? StartRollingDate,
  int? EndRollingDate,
  string? StartExactDate,
  string? EndExactDate
);

public record BreakdownDefinition(string FieldName);

public record ProductReportExecutePostRequest(ReportDefinition Report);

public record ReportResult(string Name, List<List<object>> Data, List<string>? Groups);
