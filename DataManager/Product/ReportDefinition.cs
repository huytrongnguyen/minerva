namespace DataManager.Product;

public record DashboardDefinition(
  string Name,
  List<ReportDefinition> Reports
);

public record ReportDefinition(
  string Name,
  List<MeasureDefinition> Measures,
  ViewDefinition View
);

public record MeasureDefinition(
  string Name,
  string? EventName,
  string? FieldName,
  string? Aggregation,
  List<CalculationDefinition> Calculation
);

public record CalculationDefinition(
  string Type, // operand, operator
  string? EventName,
  string? FieldName,
  string? Aggregation
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
